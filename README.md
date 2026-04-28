# GameStore

E-commerce de videojuegos con bugs intencionales para workshop de OpenSpec.

## Estructura del Proyecto

```
gamestore/
├── backend/         # Node.js + Express + TypeScript
│   ├── src/
│   ├── prisma/
│   └── package.json
├── frontend/        # React + Vite + TailwindCSS
│   ├── src/
│   └── package.json
└── README.md
```

## Requisitos

- Node.js 18+
- npm o yarn

## Instalación

### Backend

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

El servidor backend corre en `http://localhost:3001`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend corre en `http://localhost:5173`

## Usuarios de Prueba

| Email | Password | Rol |
|-------|----------|-----|
| admin@gamestore.com | admin123 | admin |
| user1@test.com | pass123 | user |
| user2@test.com | pass123 | user |
| user3@test.com | pass123 | user |
| user4@test.com | pass123 | user |

## Bugs Intencionales Incluidos

### Autenticación
- El refresh token no se renueva correctamente
- La sesión expira después de 15 minutos
- Las contraseñas se almacenan en texto plano

### Catálogo
- La paginación está rota (página 2 muestra los mismos productos)
- El filtro por precio ordena alfabéticamente
- Las imágenes usan rutas absolutas a localhost

### Carrito
- Los items duplicados se suman en lugar de incrementar cantidad
- El carrito se pierde al recargar la página
- No hay validación de stock
- El precio total no se actualiza cuando cambia la cantidad

### Checkout
- No hay validación de formulario en el frontend
- No hay confirmación de pago
- Las órdenes se crean aunque el stock sea insuficiente

### Administración
- Cualquier usuario autenticado puede acceder al panel de admin

## Notas

- No usar Docker Compose
- Código incluye comentarios `// FIXME:` y `// TODO:` en los lugares problemáticos
- La base de datos SQLite se crea automáticamente en `backend/prisma/dev.db`# gamestore-workshop
