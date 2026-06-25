import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';

const { mockTx, mockPrisma } = vi.hoisted(() => {
  const mockTx = {
    order: { create: vi.fn() },
    product: { update: vi.fn() },
    cartItem: { deleteMany: vi.fn() },
  };

  const mockPrisma = {
    cart: { findUnique: vi.fn() },
    $transaction: vi.fn().mockImplementation(
      async (cb: Function) => cb(mockTx),
    ),
  };

  return { mockTx, mockPrisma };
});

vi.mock('@prisma/client', () => ({
  PrismaClient: function () {
    return mockPrisma;
  },
}));

vi.mock('../middleware/auth', () => ({
  authenticate: (req: any, _res: any, next: any) => {
    req.userId = 1;
    next();
  },
  AuthRequest: {} as any,
}));

import ordersRouter from '../routes/orders';

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/orders', ordersRouter);
  return app;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockTx.order.create.mockReset();
  mockTx.product.update.mockReset();
  mockTx.cartItem.deleteMany.mockReset();
});

const validBody = { shippingAddress: '123 Main St', paymentMethod: 'credit_card' };

describe('POST /orders/checkout', () => {
  describe('empty cart', () => {
    it('returns 400 when cart is null', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue(null);

      const res = await request(createApp()).post('/orders/checkout').send(validBody);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Cart is empty' });
    });

    it('returns 400 when cart has no items', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue({ items: [] });

      const res = await request(createApp()).post('/orders/checkout').send(validBody);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Cart is empty' });
    });
  });

  describe('stock validation', () => {
    it('returns 400 with product name and stock details when insufficient', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue({
        id: 1,
        items: [
          {
            id: 10,
            productId: 5,
            quantity: 3,
            product: { id: 5, name: 'Game X', stock: 1, price: 10 },
          },
        ],
      });

      const res = await request(createApp()).post('/orders/checkout').send(validBody);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toContain('Game X');
      expect(res.body.error).toContain('Available: 1');
      expect(res.body.error).toContain('requested: 3');
    });

    it('returns 400 on first item when multiple have insufficient stock', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue({
        id: 1,
        items: [
          { id: 10, productId: 5, quantity: 2, product: { id: 5, name: 'Game A', stock: 1, price: 10 } },
          { id: 11, productId: 6, quantity: 1, product: { id: 6, name: 'Game B', stock: 5, price: 15 } },
        ],
      });

      const res = await request(createApp()).post('/orders/checkout').send(validBody);

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Game A');
    });

    it('returns 400 on last item when it has insufficient stock', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue({
        id: 1,
        items: [
          { id: 10, productId: 5, quantity: 1, product: { id: 5, name: 'Game A', stock: 3, price: 10 } },
          { id: 11, productId: 6, quantity: 5, product: { id: 6, name: 'Game B', stock: 2, price: 15 } },
        ],
      });

      const res = await request(createApp()).post('/orders/checkout').send(validBody);

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Game B');
    });
  });

  describe('successful checkout', () => {
    const cartWithItems = {
      id: 1,
      items: [
        { id: 10, productId: 5, quantity: 2, product: { id: 5, name: 'Game X', stock: 10, price: 10 } },
      ],
    };

    beforeEach(() => {
      mockPrisma.cart.findUnique.mockResolvedValue(cartWithItems);
      mockTx.order.create.mockResolvedValue({
        id: 100,
        userId: 1,
        total: 20,
        status: 'pending',
        items: [
          { id: 50, productId: 5, quantity: 2, price: 10, product: { id: 5, name: 'Game X', price: 10 } },
        ],
      });
    });

    it('returns 201 with order containing status pending', async () => {
      const res = await request(createApp()).post('/orders/checkout').send(validBody);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id', 100);
      expect(res.body).toHaveProperty('status', 'pending');
    });

    it('creates order inside a transaction', async () => {
      await request(createApp()).post('/orders/checkout').send(validBody);

      expect(mockPrisma.$transaction).toHaveBeenCalledOnce();
      expect(mockTx.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ userId: 1, status: 'pending' }),
        }),
      );
    });

    it('decrements product stock inside transaction', async () => {
      await request(createApp()).post('/orders/checkout').send(validBody);

      expect(mockTx.product.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 5 },
          data: { stock: { decrement: 2 } },
        }),
      );
    });

    it('decrements stock for every cart item', async () => {
      mockPrisma.cart.findUnique.mockResolvedValue({
        id: 1,
        items: [
          { id: 10, productId: 5, quantity: 1, product: { id: 5, name: 'A', stock: 10, price: 10 } },
          { id: 11, productId: 6, quantity: 3, product: { id: 6, name: 'B', stock: 10, price: 15 } },
        ],
      });

      await request(createApp()).post('/orders/checkout').send(validBody);

      expect(mockTx.product.update).toHaveBeenCalledTimes(2);
      expect(mockTx.product.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 5 }, data: { stock: { decrement: 1 } } }),
      );
      expect(mockTx.product.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 6 }, data: { stock: { decrement: 3 } } }),
      );
    });

    it('clears cart items inside transaction', async () => {
      await request(createApp()).post('/orders/checkout').send(validBody);

      expect(mockTx.cartItem.deleteMany).toHaveBeenCalledWith(
        { where: { cartId: 1 } },
      );
    });
  });
});
