# Ejemplos BAD vs GOOD — Backend: Node.js + Express + TypeScript + Prisma

Cada ejemplo contrasta un bug real del código con la solución correcta según la documentación oficial.

---

## 1. Seguridad: Passwords en texto plano

```typescript
// 🚫 BAD: backend/src/routes/auth.ts
// El password se almacena tal cual — visible en la base de datos
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;

  const user = await prisma.user.create({
    data: {
      email,
      password, // texto plano: si alguien accede a la DB, tiene todas las contraseñas
      name,
      role: 'user',
    },
  });

  const token = generateToken(user.id, user.role);
  res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
});
```

```typescript
// ✅ GOOD: con bcryptjs
import bcrypt from 'bcryptjs';

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10); // ← hash antes de guardar

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword, // string irreversible
      name,
      role: 'user',
    },
  });

  const token = generateToken(user.id, user.role);
  res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

// También en login:
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password); // ← comparación segura
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = generateToken(user.id, user.role);
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});
```

> 📎 Relacionado con: **backend-standards.md §1 Seguridad** y **§6 Autenticación JWT**

---

## 2. JWT Secret hardcodeado

```typescript
// 🚫 BAD: backend/src/middleware/auth.ts
// Secret visible en el código fuente — cualquiera puede firmar tokens válidos
export const JWT_SECRET = 'hardcoded-secret-key-12345';
```

```typescript
// ✅ GOOD: desde variable de entorno
export const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
```

```bash
# .env
JWT_SECRET=una-clave-segura-y-única-por-entorno
```

> 📎 Relacionado con: **backend-standards.md §6 Autenticación JWT** y **§9 Convenciones — Config**

---

## 3. Paginación: skip: 0 fijo

```typescript
// 🚫 BAD: backend/src/routes/products.ts
// page 2 devuelve exactamente los mismos resultados que page 1
const page = parseInt(req.query.page as string) || 1;
const limit = parseInt(req.query.limit as string) || 20;

const products = await prisma.product.findMany({
  skip: 0,        // ← bug: hardcodeado, nunca salta registros
  take: limit,
});

const total = await prisma.product.count();
res.json({
  products,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  },
});
```

```typescript
// ✅ GOOD: skip calculado correctamente
const page = Math.max(1, parseInt(req.query.page as string) || 1);
const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));

const products = await prisma.product.findMany({
  skip: (page - 1) * limit, // ← salta los registros de páginas anteriores
  take: limit,
});

const total = await prisma.product.count();
res.json({
  products,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  },
});
```

> 📎 Relacionado con: **backend-standards.md §4 Base de Datos — Paginación** y **§5 API REST — Contrato**

---

## 4. Price como String (ordena alfabéticamente)

```prisma
// 🚫 BAD: backend/prisma/schema.prisma
// Los strings se ordenan alfabéticamente: "100.00" < "9.99" porque "1" < "9"
model Product {
  id          Int      @id @default(autoincrement())
  name        String
  description String
  price       String   // ← bug: ordenación incorrecta
  image       String
  stock       Int
  category    String
  createdAt   DateTime @default(now())
}
```

```prisma
// ✅ GOOD: tipo numérico — ordenación correcta y operaciones matemáticas posibles
model Product {
  id          Int      @id @default(autoincrement())
  name        String
  description String
  price       Float    // ← ordena numéricamente: 9.99 < 100.00
  image       String
  stock       Int
  category    String
  createdAt   DateTime @default(now())
}
```

```typescript
// En el controlador, sort funciona correctamente con Float:
const orderBy = req.query.sort === 'price_asc'
  ? { price: 'asc' }
  : { price: 'desc' };
```

> 📎 Relacionado con: **backend-standards.md §4 Base de Datos — ORM** y **§9 Convenciones — Tipado**

---

## 5. Cart items duplicados

```typescript
// 🚫 BAD: backend/src/routes/cart.ts
// Cada vez que se agrega un producto, se crea un nuevo CartItem
// Si el producto ya está en el carrito, queda duplicado
router.post('/add', authenticate, async (req: AuthRequest, res, next) => {
  const { productId, quantity = 1 } = req.body;

  const cart = await getOrCreateCart(req.userId!);

  await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId,
      quantity,
    },
  });

  const updatedCart = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: { include: { product: true } } },
  });
  res.json(updatedCart);
});
```

```typescript
// ✅ GOOD: verificar existencia y hacer upsert (update + insert)
router.post('/add', authenticate, async (req: AuthRequest, res, next) => {
  const { productId, quantity = 1 } = req.body;

  const cart = await getOrCreateCart(req.userId!);

  const existing = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId },
  });

  if (existing) {
    // Si ya existe, incrementa la cantidad
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
  } else {
    // Si no existe, lo crea
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity },
    });
  }

  const updatedCart = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: { include: { product: true } } },
  });
  res.json(updatedCart);
});
```

> 📎 Relacionado con: **backend-standards.md §3 Patrones — Prisma Client** y **§4 Base de Datos — Consultas**

---

## 6. Sin validación de stock

```typescript
// 🚫 BAD: backend/src/routes/cart.ts
// Se permite agregar productos al carrito sin verificar si hay stock disponible
router.post('/add', authenticate, async (req: AuthRequest, res, next) => {
  const { productId, quantity = 1 } = req.body;

  // No se consulta el producto, no se verifica stock
  const cart = await getOrCreateCart(req.userId!);
  await prisma.cartItem.create({
    data: { cartId: cart.id, productId, quantity },
  });
  // ...
});
```

```typescript
// ✅ GOOD: validar stock antes de agregar
router.post('/add', authenticate, async (req: AuthRequest, res, next) => {
  const { productId, quantity = 1 } = req.body;

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  if (product.stock < quantity) {
    return res.status(400).json({
      error: `Insufficient stock. Available: ${product.stock}, requested: ${quantity}`,
    });
  }

  const cart = await getOrCreateCart(req.userId!);
  // ... proceder con la lógica
});
```

```typescript
// ✅ GOOD EXTRA: validación en checkout con transacción
router.post('/checkout', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId: req.userId! },
        include: { items: { include: { product: true } } },
      });

      if (!cart || cart.items.length === 0) {
        throw new Error('Cart is empty');
      }

      // Validar stock de cada item dentro de la transacción
      for (const item of cart.items) {
        if (item.product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${item.product.name}`);
        }
      }

      // Decrementar stock
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Crear orden
      const total = cart.items.reduce(
        (sum, item) => sum + item.product.price * item.quantity, 0
      );

      const order = await tx.order.create({
        data: {
          userId: req.userId!,
          total,
          status: 'pending',
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
      });

      // Limpiar carrito
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return order;
    });

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});
```

> 📎 Relacionado con: **backend-standards.md §4 Base de Datos — Transacciones** y **§5 API REST — Códigos HTTP**

---

## 7. Admin sin role check

```typescript
// 🚫 BAD: backend/src/routes/admin.ts
// Cualquier usuario autenticado puede acceder a rutas administrativas
router.get('/users', authenticate, async (req: AuthRequest, res, next) => {
  // No verifica el rol — usuarios normales ven todos los usuarios
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
  res.json(users);
});
```

```typescript
// ✅ GOOD: verificar rol antes de ejecutar la lógica
function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// Opción 1: middleware específico
router.get('/users', authenticate, requireAdmin, async (req: AuthRequest, res, next) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
  res.json(users);
});

// Opción 2: inline en la ruta
router.get('/orders', authenticate, async (req: AuthRequest, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  const orders = await prisma.order.findMany({ include: { user: true } });
  res.json(orders);
});
```

> 📎 Relacionado con: **backend-standards.md §3 Patrones — Middleware Chain** y **§6 Autenticación JWT — Middleware auth**

---

## 8. Error handler centralizado

```typescript
// 🚫 BAD: backend/src/index.ts
// Cada ruta maneja sus propios errores — código duplicado, respuestas inconsistentes
// routes/products.ts
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: Number(req.params.id) } });
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' }); // ← repetido en cada archivo
  }
});

// routes/cart.ts
router.post('/add', async (req, res) => {
  try {
    // ...
  } catch (error) {
    res.status(500).json({ error: 'Error' }); // ← mensaje diferente, inconsistente
  }
});
```

```typescript
// ✅ GOOD: middleware de error centralizado

// backend/src/index.ts — definir al final del pipeline
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`[${new Date().toISOString()}] ${err.stack}`);

  const status = (err as any).status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
  });
});

// routes/products.ts — propagar errores con next(err)
router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: Number(req.params.id) } });
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json(product);
  } catch (err) {
    next(err); // ← centralizado
  }
});

// routes/cart.ts — mismo patrón
router.post('/add', authenticate, async (req: AuthRequest, res, next) => {
  try {
    // ...
  } catch (err) {
    next(err); // ← centralizado, misma respuesta siempre
  }
});
```

> 📎 Relacionado con: **backend-standards.md §1 Prácticas — Manejo de errores** y **§3 Patrones — Middleware Chain**

---

## 9. Refresh token nunca se renueva

```typescript
// 🚫 BAD: backend/src/routes/auth.ts
// El refresh token se verifica pero nunca se renueva — si se filtra, es válido para siempre
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Solo emite un nuevo access token, el refresh sigue siendo el mismo
    const token = generateToken(user.id, user.role);
    res.json({ token, refreshToken }); // ← mismo refresh token de siempre
  } catch (err) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});
```

```typescript
// ✅ GOOD: rotar refresh token (emitir uno nuevo en cada refresh)
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Emitir NUEVO par de tokens
    const token = generateToken(user.id, user.role);
    const newRefreshToken = generateRefreshToken(user.id);

    // Actualizar en DB
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    res.json({ token, refreshToken: newRefreshToken }); // ← nuevo refresh token
  } catch (err) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});
```

> 📎 Relacionado con: **backend-standards.md §6 Autenticación JWT — Refresh flow**

---

## 10. SRP: lógica de negocio en route handlers

```typescript
// 🚫 BAD: backend/src/routes/orders.ts
// El route handler mezcla lógica HTTP + lógica de negocio + acceso a datos
router.get('/orders', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const orders = await prisma.order.findMany({        // ← acceso a datos
      where: { userId: req.userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const totalSpent = orders.reduce((sum, o) => sum + o.total, 0); // ← lógica de negocio
    const pendingOrders = orders.filter((o) => o.status === 'pending');

    res.json({ orders, totalSpent, pendingCount: pendingOrders.length }); // ← HTTP
  } catch (err) {
    next(err);
  }
});
```

```typescript
// ✅ GOOD: separar responsabilidades

// services/orderService.ts
export async function getUserOrdersSummary(userId: number) {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return {
    orders,
    totalSpent: orders.reduce((sum, o) => sum + o.total, 0),
    pendingCount: orders.filter((o) => o.status === 'pending').length,
  };
}

// routes/orders.ts — handler delgado solo se preocupa por HTTP
import { getUserOrdersSummary } from '../services/orderService';

router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const summary = await getUserOrdersSummary(req.userId!);
    res.json(summary);
  } catch (err) {
    next(err);
  }
});
```

> 📎 Relacionado con: **backend-standards.md §2 Principios — SRP** y **§3 Patrones — Route Handler / Service Layer**
