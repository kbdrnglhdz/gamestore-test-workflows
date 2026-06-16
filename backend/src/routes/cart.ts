import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    let cart = await prisma.cart.findUnique({
      where: { userId: req.userId },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.userId }
      });
    }

    res.json(cart);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/add', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.userId;

    let cart = await prisma.cart.findUnique({
      where: { userId }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId }
      });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId }
    });

    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const existingQuantity = existingItem ? existingItem.quantity : 0;
    if (product.stock < existingQuantity + quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    if (existingItem) {
      try {
        await prisma.cartItem.update({
          where: { id: existingItem.id, quantity: existingItem.quantity },
          data: { quantity: existingItem.quantity + quantity }
        });
      } catch (error: any) {
        if (error.code === 'P2025') {
          const refreshed = await prisma.cartItem.findFirst({
            where: { cartId: cart.id, productId }
          });
          if (refreshed) {
            await prisma.cartItem.update({
              where: { id: refreshed.id },
              data: { quantity: refreshed.quantity + quantity }
            });
          } else {
            await prisma.cartItem.create({
              data: { cartId: cart.id, productId, quantity }
            });
          }
        } else {
          throw error;
        }
      }
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity
        }
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    res.json(updatedCart);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/item/:itemId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const item = await prisma.cartItem.update({
      where: { id: parseInt(itemId) },
      data: { quantity }
    });

    // BUG: Total price not recalculated when quantity changes
    // TODO: Recalculate cart total

    res.json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/item/:itemId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { itemId } = req.params;

    await prisma.cartItem.delete({
      where: { id: parseInt(itemId) }
    });

    res.json({ message: 'Item removed' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/clear', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.userId }
    });

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id }
      });
    }

    res.json({ message: 'Cart cleared' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;