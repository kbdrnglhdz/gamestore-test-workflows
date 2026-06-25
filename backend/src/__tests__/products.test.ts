import { describe, it, expect, vi, beforeEach } from 'vitest';
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

vi.mock('express-rate-limit', () => ({
  default: () => (req: any, res: any, next: any) => next(),
}));

import productsRouter from '../routes/products';

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/products', productsRouter);
  return app;
}

const sampleProducts = [
  { id: 1, name: 'Zelda: Breath of the Wild', price: '59.99', category: 'Adventure' },
  { id: 2, name: 'Call of Duty', price: '49.99', category: 'Shooter' },
  { id: 3, name: 'Age of Empires', price: '29.99', category: 'Strategy' },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /products', () => {
  it('returns all products when no search param', async () => {
    mockPrisma.product.findMany.mockResolvedValue(sampleProducts);
    mockPrisma.product.count.mockResolvedValue(sampleProducts.length);

    const res = await request(createApp()).get('/products');

    expect(res.status).toBe(200);
    expect(res.body.products).toHaveLength(3);
    expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} }),
    );
  });

  it('filters by name prefix when search param is provided', async () => {
    mockPrisma.product.findMany.mockResolvedValue([sampleProducts[0]]);
    mockPrisma.product.count.mockResolvedValue(1);

    const res = await request(createApp()).get('/products?search=zel');

    expect(res.status).toBe(200);
    expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ name: { startsWith: 'zel' } }),
      }),
    );
  });

  it('returns empty array when search matches no products', async () => {
    mockPrisma.product.findMany.mockResolvedValue([]);
    mockPrisma.product.count.mockResolvedValue(0);

    const res = await request(createApp()).get('/products?search=xyzzy');

    expect(res.status).toBe(200);
    expect(res.body.products).toEqual([]);
    expect(res.body.total).toBe(0);
  });

  it('combines search with category filter', async () => {
    mockPrisma.product.findMany.mockResolvedValue([sampleProducts[0]]);
    mockPrisma.product.count.mockResolvedValue(1);

    const res = await request(createApp()).get('/products?search=zel&category=Adventure');

    expect(res.status).toBe(200);
    expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          name: { startsWith: 'zel' },
          category: 'Adventure',
        }),
      }),
    );
  });

  it('combines search with price filters', async () => {
    mockPrisma.product.findMany.mockResolvedValue([sampleProducts[2]]);
    mockPrisma.product.count.mockResolvedValue(1);

    const res = await request(createApp()).get('/products?search=age&minPrice=10&maxPrice=50');

    expect(res.status).toBe(200);
    expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          name: { startsWith: 'age' },
          price: expect.objectContaining({ gte: 10, lte: 50 }),
        }),
      }),
    );
  });
});
