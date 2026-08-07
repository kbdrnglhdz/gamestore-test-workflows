## 1. Setup

- [ ] 1.1 Crear rama `feature/test-hook` (5 min)

## 2. Backend

- [ ] 2.1 Crear archivo `backend/src/routes/health.ts` con endpoint GET /api/health (15 min)
- [ ] 2.2 Registrar la ruta en `backend/src/index.ts` con `app.use('/api/health', healthRoutes)` (5 min)

## 3. Testing

- [ ] 3.1 Verificar manualmente que `GET /api/health` retorna `{ success: true, data: { message: "hola mundo" } }` (5 min)
- [ ] 3.2 Verificar que método POST a `/api/health` retorna 405 (5 min)
