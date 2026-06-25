## Context

Endpoint de prueba que retorna "Prueba Husky" para validar integraciones con hooks de git (husky). Sigue el patrón existente de rutas modulares Express en `backend/src/routes/`.

## Goals / Non-Goals

**Goals:**
- Proveer endpoint `GET /api/test-husky` accesible públicamente
- Retornar `{ success: true, data: { message: "Prueba Husky" } }`
- Registrar la ruta en `index.ts`

**Non-Goals:**
- Sin verificación de base de datos ni dependencias externas
- Sin cambios en frontend ni autenticación

## Decisions

| Decisión | Alternativas | Por qué |
|---|---|---|
| Archivo separado `test-husky.ts` en `routes/` | Ruta inline en `index.ts` | Consistencia con rutas existentes |
| Sin autenticación | Usar middleware `authenticate` | Endpoint intencionalmente público para pruebas |
| Sin diagrama de flujo | Solo 1 paso (recibir GET → responder JSON) | Proceso trivial (< 3 pasos) |

## Archivos nuevos y modificados

- **Nuevo**: `backend/src/routes/test-husky.ts`
- **Modificado**: `backend/src/index.ts` (registrar ruta)

## Seguridad y rendimiento

- **Seguridad**: Endpoint público de solo lectura, sin exposición de datos
- **Rendimiento**: Respuesta en ms, sin base de datos

## Risks / Trade-offs

- **Riesgo mínimo**: Endpoint puramente informativo sin efectos secundarios
