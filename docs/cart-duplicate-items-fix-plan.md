# Plan de Corrección: Items duplicados en el carrito

## Diagnóstico

**Archivo:** `backend/src/routes/cart.ts:52-60`

Cuando un producto ya existe en el carrito, el código crea una nueva fila `CartItem` en vez de actualizar la existente.

Comportamiento actual:
```
POST /cart/add { productId: 1, quantity: 1 } (x2)
→ CartItem #1: productId=1, quantity=1
→ CartItem #2: productId=1, quantity=1   ← duplicado
```

Comportamiento esperado:
```
POST /cart/add { productId: 1, quantity: 1 } (x2)
→ CartItem #1: productId=1, quantity=2   ← incrementado
```

## Cambios

### 1. Cambiar `create` por `update` en el branch `existingItem`

**Líneas 52-60 en `backend/src/routes/cart.ts`:**

| Actual | Reemplazar con |
|---|---|
| `prisma.cartItem.create({ data: { cartId, productId, quantity } })` | `prisma.cartItem.update({ where: { id: existingItem.id }, data: { quantity: existingItem.quantity + quantity } })` |

### 2. Agregar stock validation

Antes del bloque if/else, validar inventario suficiente:

```ts
const product = await prisma.product.findUnique({ where: { id: productId } });
if (!product || product.stock < (existingItem ? existingItem.quantity + quantity : quantity)) {
  return res.status(400).json({ error: 'Insufficient stock' });
}
```

## Archivos a modificar

- `backend/src/routes/cart.ts` — único cambio necesario

## Post-condiciones

- `GET /cart` devuelve una sola fila por producto con cantidad acumulada
- Productos distintos siguen siendo filas separadas
- No se rompen pruebas manuales con seed data existente
- Se valida stock antes de agregar al carrito

## Excluido de este alcance

- Recalcular precio total al cambiar cantidad (`PUT /cart/item/:itemId`)
- Persistencia del carrito al recargar página (frontend state)
- Limpiar carrito tras checkout
- No validación de formulario en frontend
