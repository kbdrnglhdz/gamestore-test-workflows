## Context

Endpoint de verificación simple ("hola mundo") para confirmar que el servidor Express está operativo. No requiere autenticación, base de datos, ni lógica de negocio. Sigue el patrón existente de rutas modulares en `backend/src/routes/`.

## Goals / Non-Goals

**Goals:**
- Proveer endpoint `GET /api/health` accesible públicamente
- Retornar `{ success: true, data: { message: "hola mundo" } }`
- Registrar la ruta en el archivo principal `index.ts`

**Non-Goals:**
- No incluir verificación de base de datos ni dependencias externas
- Sin cambios en frontend
- Sin autenticación ni autorización

## Decisions

| Decisión | Alternativas | Por qué |
|---|---|---|
| Archivo separado `health.ts` en `routes/` | Agregar ruta inline en `index.ts` | Consistencia con rutas existentes; fácil de localizar |
| Sin autenticación | Usar middleware `authenticate` | El endpoint es intencionalmente público para health checks |
| Sin verificación de DB | Hacer ping a SQLite | Mantenerlo simple; es un health check básico, no un readiness probe |

## Archivos nuevos y modificados

- **Nuevo**: `backend/src/routes/health.ts`
- **Modificado**: `backend/src/index.ts` (registrar ruta)

## Seguridad y rendimiento

- **Seguridad**: Endpoint público de solo lectura, sin exposición de datos sensibles
- **Rendimiento**: Sin base de datos ni lógica pesada — respuesta en ms

## Risks / Trade-offs

- **Riesgo mínimo**: Endpoint puramente informativo sin efectos secundarios
