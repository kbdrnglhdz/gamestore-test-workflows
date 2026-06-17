import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateToken, generateRefreshToken, verifyRefreshToken, AuthRequest, authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ValidationRule {
  field: string;
  label: string;
  required?: boolean;
  email?: boolean;
}

function validate(body: any, rules: ValidationRule[]): { error: string; code: string } | null {
  for (const rule of rules) {
    const value = body[rule.field];
    if (rule.required && (!value || typeof value !== 'string' || !value.trim())) {
      return { error: `${rule.label} is required`, code: 'VALIDATION_ERROR' };
    }
    if (rule.email && value && !EMAIL_REGEX.test(value)) {
      return { error: 'Invalid email format', code: 'VALIDATION_ERROR' };
    }
  }
  return null;
}

router.post('/register', async (req, res) => {
  try {
    const validationError = validate(req.body, [
      { field: 'email', label: 'Email', required: true, email: true },
      { field: 'password', label: 'Password', required: true },
      { field: 'name', label: 'Name', required: true },
    ]);
    if (validationError) {
      return res.status(400).json(validationError);
    }

    const { email, password, name } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists', code: 'DUPLICATE_EMAIL' });
    }

    // BUG: Password stored in plain text
    const user = await prisma.user.create({
      data: {
        email,
        password, // TODO: Store hashed password
        name,
        role: 'user'
      }
    });

    const token = generateToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    });

    res.json({ token, refreshToken, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch {
    res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const validationError = validate(req.body, [
      { field: 'email', label: 'Email', required: true, email: true },
      { field: 'password', label: 'Password', required: true },
    ]);
    if (validationError) {
      return res.status(400).json(validationError);
    }

    const { email, password } = req.body;

    // BUG: Comparing plain text passwords directly
    const user = await prisma.user.findFirst({
      where: { email, password } // FIXME: Should compare with hashed password
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
    }

    const token = generateToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    });

    res.json({ token, refreshToken, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch {
    res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required', code: 'MISSING_REFRESH_TOKEN' });
    }

    const decoded = verifyRefreshToken(refreshToken);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ error: 'Invalid refresh token', code: 'INVALID_REFRESH_TOKEN' });
    }

    const newRefreshToken = generateRefreshToken(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken }
    });

    const token = generateToken(user.id, user.role);
    res.json({ token, refreshToken: newRefreshToken });
  } catch {
    res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

router.post('/logout', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.user.update({
      where: { id: req.userId },
      data: { refreshToken: null }
    });

    res.json({ message: 'Logged out successfully' });
  } catch {
    res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, name: true, role: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found', code: 'USER_NOT_FOUND' });
    }

    res.json(user);
  } catch {
    res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

export default router;