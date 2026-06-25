import { describe, it, expect, vi, beforeAll } from 'vitest';
import express from 'express';
import request from 'supertest';

const { mockPrisma } = vi.hoisted(() => {
  const mockPrisma = {
    product: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  };
  return { mockPrisma };
});

vi.mock('@prisma/client', () => ({
  PrismaClient: function () {
    return mockPrisma;
  },
}));

import productsRouter from '../routes/products';

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/products', productsRouter);
  return app;
}

describe('GET /products - Rate Limiting', () => {
  beforeAll(() => {
    mockPrisma.product.findMany.mockResolvedValue([]);
    mockPrisma.product.count.mockResolvedValue(0);
  });

  it('returns 200 for requests within the 30 req/min limit', async () => {
    const app = createApp();
    for (let i = 0; i < 30; i++) {
      const res = await request(app).get('/products');
      expect(res.status).toBe(200);
    }
  });

  it('returns 429 on the 31st request', async () => {
    const app = createApp();
    for (let i = 0; i < 30; i++) {
      await request(app).get('/products');
    }
    const res = await request(app).get('/products');
    expect(res.status).toBe(429);
  });

  it('includes Retry-After and RateLimit headers in 429 response', async () => {
    const app = createApp();
    for (let i = 0; i < 30; i++) {
      await request(app).get('/products');
    }
    const res = await request(app).get('/products');
    expect(res.status).toBe(429);
    expect(res.headers['retry-after']).toBeDefined();
    expect(res.headers['ratelimit-remaining']).toBe('0');
    expect(res.headers['ratelimit-limit']).toBe('30');
  });

  it('returns rate limit headers on successful responses', async () => {
    const res = await request(createApp()).get('/products');
    expect(res.headers['ratelimit-limit']).toBeDefined();
    expect(res.headers['ratelimit-remaining']).toBeDefined();
  });
});
