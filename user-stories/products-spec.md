# Especificación: Alta de nuevo producto en el catálogo

## Historia de usuario

**Como** administrador de la tienda (rol `admin`)
**Quiero** registrar un nuevo videojuego en el catálogo con sus atributos (nombre, descripción, precio, imagen, stock, categoría)
**Para** que los clientes puedan verlo, filtrarlo y comprarlo desde la tienda.

---

## Criterios de aceptación

### CA-1: Creación exitosa con campos obligatorios

**Dado** que el administrador accede al panel de administración (`/admin`) y presiona "Nuevo producto"
**Cuando** completa todos los campos obligatorios:
| Campo | Tipo | Obligatorio | Validación |
|-------|------|-------------|------------|
| `name` | `string` | Sí | 1-200 caracteres, no vacío |
| `description` | `string` | Sí | 1-2000 caracteres |
| `price` | `number` | Sí | > 0, máximo 2 decimales |
| `image` | `string` | Sí | URL válida (http/https) |
| `stock` | `number` | Sí | Entero >= 0 |
| `category` | `string` | Sí | Debe pertenecer a la lista de categorías |

**Entonces** el sistema:
- Guarda el producto en la base de datos con `id` autoincremental y `createdAt`
- El precio se almacena como `Float` (no como `String`)
- Redirige/muestra la lista de productos actualizada
- Muestra mensaje de éxito: "Producto creado correctamente"

---

### CA-2: Validación de precio (numérico)

**Dado** que el administrador ingresa un precio no numérico (ej. `"gratis"`, `"doce"`) o negativo (`-10`)
**Cuando** presiona guardar
**Entonces** el sistema responde con `400 Bad Request` y el mensaje `"price must be a positive number"`. El formulario en frontend muestra el error en el campo correspondiente.

> **Nota técnica**: Esto requiere cambiar el tipo `price` de `String` a `Float` en Prisma, crear una migración, y actualizar la lógica de comparación en filtros y ordenamientos.

---

### CA-3: Validación de stock

**Dado** que el administrador ingresa un stock no entero (ej. `10.5`) o negativo (`-1`)
**Cuando** presiona guardar
**Entonces** el sistema responde con `400 Bad Request` y el mensaje `"stock must be a non-negative integer"`.

---

### CA-4: Solo administradores pueden crear productos

**Dado** que un usuario autenticado con rol `user` intenta acceder a `POST /api/products`
**Cuando** realiza la petición con un token JWT válido pero con `role: "user"`
**Entonces** el sistema responde con `403 Forbidden` y el mensaje `"Admin access required"`.

> **Nota técnica**: Implementar middleware `requireAdmin` que verifique `req.userRole === 'admin'`. Aplica también a `PUT /:id` y `DELETE /:id`.

---

### CA-5: Validación de categoría

**Dado** que el administrador selecciona/envía una categoría no válida (ej. `"Indie"` cuando no está en la lista)
**Cuando** presiona guardar
**Entonces** el sistema responde con `400 Bad Request` y el mensaje `"Invalid category. Allowed: Adventure, Action, RPG, Shooter, Sports, Fighting, Simulation, Strategy, Racing, Puzzle, Platformer, Horror"`.

> El frontend debe usar un `<select>` con las categorías predefinidas para evitar errores de tipeo.

---

### CA-6: Validación de URL de imagen

**Dado** que el administrador ingresa una URL de imagen inválida (ej. `"no-es-url"`, o ruta local `/images/game.jpg`)
**Cuando** presiona guardar
**Entonces** el sistema responde con `400 Bad Request` y el mensaje `"image must be a valid URL (http/https)"`.

> **Nota técnica**: Rutas absolutas a localhost (`http://localhost:3001/...`) deben ser reemplazadas por rutas relativas o subidas a un servicio de imágenes. Para este spec, aceptar URLs http/https válidas.

---

### CA-7: Manejo de errores del servidor

**Dado** que ocurre un error inesperado en el servidor (ej. caída de base de datos)
**Cuando** el administrador intenta guardar un producto
**Entonces** el sistema responde con `500 Internal Server Error` y un mensaje genérico `"An unexpected error occurred"` (sin exponer detalles internos).

---

## API Contract

### `POST /api/products`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request body:**
```json
{
  "name": "Zelda: Tears of the Kingdom",
  "description": "Aventura épica en el reino de Hyrule...",
  "price": 59.99,
  "image": "https://example.com/zelda.jpg",
  "stock": 100,
  "category": "Adventure"
}
```

**Response `201 Created`:**
```json
{
  "id": 51,
  "name": "Zelda: Tears of the Kingdom",
  "description": "Aventura épica en el reino de Hyrule...",
  "price": 59.99,
  "image": "https://example.com/zelda.jpg",
  "stock": 100,
  "category": "Adventure",
  "createdAt": "2026-06-09T12:00:00.000Z"
}
```

**Response `400 Bad Request`:**
```json
{
  "error": "price must be a positive number"
}
```

**Response `401 Unauthorized`** (sin token o token inválido):
```json
{
  "error": "No token provided"
}
```

**Response `403 Forbidden`** (token válido pero no es admin):
```json
{
  "error": "Admin access required"
}
```

---

## Diseño de UI (Frontend)

### Ubicación
El formulario se agrega en `frontend/src/pages/Admin.tsx`, en una nueva sección "Products" debajo de las secciones existentes de "Orders" y "Users".

### Flujo
1. Admin navega a `/admin`
2. Ve las cards de stats, tabla de órdenes, tabla de usuarios, y una nueva sección "Products" con:
   - Lista de productos (tabla con columnas: ID, Name, Price, Stock, Category, Actions)
   - Botón "➕ New Product" que abre un modal o expande un formulario
3. El formulario contiene:
   - `name`: input text
   - `description`: textarea
   - `price`: input number (step=0.01, min=0)
   - `image`: input text (placeholder: "https://...")
   - `stock`: input number (step=1, min=0)
   - `category`: select con opciones predefinidas
   - Botones: "Save" (submit) y "Cancel" (cierra el formulario)

### Validación client-side (antes de enviar)
- `name`: required, maxLength 200
- `description`: required, maxLength 2000
- `price`: required, type=number, min=0.01
- `image`: required, pattern URL
- `stock`: required, type=number, step=1, min=0
- `category`: required, debe estar en lista

Los errores se muestran como texto rojo debajo de cada campo.

### Loading / Success / Error states
- **Loading**: Botón "Save" se deshabilita y muestra "Saving..."
- **Success**: Toast o alerta "Producto creado correctamente", formulario se resetea/cierra, tabla se recarga
- **Error**: Mensaje de error del backend se muestra en la parte superior del formulario

---

## Definición de listo (DoD)

- [ ] Backend: **Migración de base de datos** — campo `price` cambiado de `String` a `Float` en Prisma + migración SQLite aplicada
- [ ] Backend: **Middleware `requireAdmin`** creado y aplicado a todas las rutas de producto (POST, PUT, DELETE)
- [ ] Backend: **Validaciones** implementadas en `POST /api/products` para todos los campos (formato, tipos, rangos)
- [ ] Backend: **Prisma seed** actualizado para usar `price` como `Float`
- [ ] Backend: **Rutas GET** (listar y detalle) actualizadas para que el filtro/orden por precio funcione numéricamente
- [ ] Frontend: **Formulario de creación** en Admin.tsx con todos los campos validados client-side
- [ ] Frontend: **Feedback visual** para loading, success, error states
- [ ] Frontend: **Tabla de productos** en Admin.tsx que se actualiza tras crear
- [ ] Prueba manual: Crear 3 productos con datos válidos — persisten y aparecen en la lista
- [ ] Prueba manual: Intentar crear con precio inválido — error 400
- [ ] Prueba manual: Intentar crear con token de usuario no-admin — error 403
- [ ] Prueba manual: Verificar que `GET /api/products?sort=price_asc` ordena numéricamente

---

## Tareas técnicas (orden sugerido)

### 1. Backend — Esquema y migración
- Editar `backend/prisma/schema.prisma`: cambiar `price String` → `price Float`
- Ejecutar `npm run prisma:migrate --name change-price-to-float`
- Actualizar `backend/prisma/seed.ts`: cambiar valores `price` a `Float`
- Regenerar Prisma client: `npm run prisma:generate`

### 2. Backend — Middleware requireAdmin
- Crear `requireAdmin` en `backend/src/middleware/auth.ts`
- Aplicar a rutas protegidas en `products.ts` y `admin.ts`

### 3. Backend — Validaciones en POST /api/products
- Validar tipos, rangos, formato URL, categoría permitida
- Responder con `400` y mensaje descriptivo

### 4. Backend — Fix filtros GET
- Actualizar `products.ts` GET / para que `price` compare numéricamente (ya no es string)
- Corregir bug `skip: 0` (usar la variable `skip`)

### 5. Frontend — Formulario en Admin.tsx
- Agregar sección "Products" con tabla y botón "New Product"
- Crear estado local para formulario, loading, error
- Consumir `api.products.create()` y recargar lista

### 6. Frontend — Feedback y validaciones
- Agregar validación client-side
- Manejar estados loading / success / error

---

## Preguntas resueltas (vs historia original)

| Pregunta original | Decisión |
|---|---|
| ¿Se permitirá editar un producto? | Sí, ya existe `PUT /:id`. Requiere `requireAdmin`. Mismo spec aplica. |
| ¿Código de barras? | No aplica (es tienda de videojuegos, no almacén). |
| ¿Bajas de producto? | Para este spec no se implementa borrado lógico. `DELETE /:id` existe pero queda fuera del alcance. |
| ¿Atributos opcionales (peso, volumen)? | No aplican. El modelo actual es suficiente. |
| ¿SKU? | No aplica. El identificador es `id` autoincremental. |
