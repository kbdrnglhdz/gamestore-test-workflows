import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { publicLimiter, writeLimiter } from '../middleware/rateLimiter';

const router = Router();
const prisma = new PrismaClient();

router.get('/', publicLimiter, async (req, res) => {
  try {
    const { page = '1', limit = '10', category, minPrice, maxPrice, sort, search } = req.query;

    // Pagination: offset is now computed from page param
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 10));
    const skip = (pageNum - 1) * limitNum;

    // BUG: No caching - every request fetches all products
    // TODO: Implement caching layer

    const where: any = {};

    if (category) {
      where.category = category as string;
    }

    if (search) {
      where.name = { startsWith: search as string };
    }

    if (minPrice) {
      where.price = { ...where.price, gte: parseFloat(minPrice as string) };
    }
    if (maxPrice) {
      where.price = { ...where.price, lte: parseFloat(maxPrice as string) };
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price_desc') {
      orderBy = { price: 'desc' };
    }

    // BUG: N+1 query problem - fetches each product separately
     const products = await prisma.product.findMany({
       where,
        skip,
       take: limitNum,
       orderBy
     });

    const total = await prisma.product.count({ where });

    res.json({
      products,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', publicLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticate, writeLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, image, stock, category } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        image, // BUG: Absolute path pointing to localhost
        stock,
        category
      }
    });

    res.status(201).json(product);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', authenticate, writeLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, image, stock, category } = req.body;

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        price,
        image,
        stock,
        category
      }
    });

    res.json(product);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authenticate, writeLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Product deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;