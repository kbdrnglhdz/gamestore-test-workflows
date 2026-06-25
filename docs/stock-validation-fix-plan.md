# Propuesta de solución: Validación de stock en checkout

## 1. Backend — `backend/src/routes/orders.ts`

### Validación de stock antes de crear la orden

Insertar después de la línea 24 (`if (!cart || cart.items.length === 0)`), antes del cálculo del total:

```ts
// Validar stock suficiente para cada item
for (const item of cart.items) {
  const product = await prisma.product.findUnique({
    where: { id: item.productId }
  });

  if (!product || product.stock < item.quantity) {
    return res.status(400).json({
      error: `Insufficient stock for "${item.product.name}". Available: ${product?.stock ?? 0}, requested: ${item.quantity}`
    });
  }
}
```

### Decrementar stock después de crear la orden (transaccional)

Envolver `order.create` + `stock.decrement` + `cartItem.deleteMany` en `prisma.$transaction`:

```ts
const order = await prisma.$transaction(async (tx) => {
  // Crear la orden
  const newOrder = await tx.order.create({
    data: {
      userId, total, status: 'pending',
      items: { create: orderItems }
    },
    include: { items: { include: { product: true } } }
  });

  // Descontar stock
  for (const item of cart.items) {
    await tx.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity } }
    });
  }

  // Limpiar carrito
  await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

  return newOrder;
});
```

## 2. Frontend — `frontend/src/pages/Checkout.tsx`

Mejorar manejo de error en `handleSubmit` para mostrar el mensaje del backend:

```ts
} catch (error: any) {
  const message = error?.message || 'Failed to place order';
  alert(message);
}
```

## Resumen de cambios

| Archivo | Cambio | Líneas |
|---------|--------|--------|
| `backend/src/routes/orders.ts` | Validar stock antes de crear orden | ~10 |
| `backend/src/routes/orders.ts` | Envolver en transacción + decrementar stock + limpiar carrito | ~10 |
| `frontend/src/pages/Checkout.tsx` | Propagar mensaje de error del backend | ~3 |

**Alcance total:** 2 archivos, ~23 líneas nuevas. Sin cambios en schema, migraciones ni modelos.
