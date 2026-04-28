import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const { page = '1', limit = '10', category, minPrice, maxPrice, sort } = req.query;

    // BUG: Pagination is broken - page 2 shows same products
    // FIXME: Offset calculation is wrong
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // BUG: No caching - every request fetches all products
    // TODO: Implement caching layer

    const where: any = {};

    if (category) {
      where.category = category as string;
    }

    // BUG: Price filter sorts alphabetically ("10" < "2")
    // FIXME: Price should be numeric, not string comparison
    if (minPrice) {
      where.price = { ...where.price, gte: minPrice as string };
    }
    if (maxPrice) {
      where.price = { ...where.price, lte: maxPrice as string };
    }

    // BUG: Sort doesn't work properly for price
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') {
      orderBy = { price: 'asc' }; // FIXME: Sorts alphabetically
    } else if (sort === 'price_desc') {
      orderBy = { price: 'desc' };
    }

    // BUG: N+1 query problem - fetches each product separately
     const products = await prisma.product.findMany({
       where,
       skip: 0, // BUG: Always returns page 1 results
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

router.get('/:id', async (req, res) => {
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

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, image, stock, category } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: String(price), // BUG: Price stored as string
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

router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, image, stock, category } = req.body;

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        price: String(price),
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

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
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