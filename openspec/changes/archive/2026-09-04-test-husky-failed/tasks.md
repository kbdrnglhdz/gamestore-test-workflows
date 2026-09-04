## 1. Setup

- [ ] 1.1 Crear rama `feature/test-husky` (5 min)

## 2. Backend

- [ ] 2.1 Crear archivo `backend/src/routes/test-husky.ts` con endpoint GET /api/test-husky (15 min)
- [ ] 2.2 Registrar la ruta en `backend/src/index.ts` con `app.use('/api/test-husky', testHuskyRoutes)` (5 min)

## 3. Testing

- [ ] 3.1 Verificar que `GET /api/test-husky` retorna `{ success: true, data: { message: "Prueba Husky" } }` (5 min)
- [ ] 3.2 Verificar que métodos no-GET a `/api/test-husky` retornan 405 (5 min)
