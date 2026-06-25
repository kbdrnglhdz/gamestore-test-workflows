## Why

Los endpoints de productos (`/api/products`) no tienen protección contra abuso. Cualquier cliente puede hacer solicitudes ilimitadas, lo que permite scraping masivo, denegación de servicio (especialmente por el bug N+1 en GET /) o creación/eliminación masiva de productos. Implementar rate limiting protege la disponibilidad del API y previene uso malicioso.

## What Changes

- Crear middleware de rate limiting reutilizable (`rateLimiter.ts`)
- Aplicar rate limiting diferenciado a cada endpoint de products según su naturaleza (público/lectura vs autenticado/escritura)
- Respuesta estándar `429 Too Many Requests` con cuerpo JSON informativo
- Headers de rate limit estándar (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After`)

## Capabilities

### New Capabilities
- `rate-limiting`: Protección contra abuso mediante límites de requests por ventana de tiempo, diferenciado por tipo de endpoint

### Modified Capabilities

- `catalog`: Se agregan requisitos de rate limiting a los endpoints del catálogo de productos

## Impact

- **Backend**: Nuevo middleware `src/middleware/rateLimiter.ts`, modificación de `src/routes/products.ts`, nueva dependencia `express-rate-limit`
- **Frontend**: Sin cambios
- **DB**: Sin migración
- **Tests**: Se agregan tests de rate limiting; tests existentes requieren mock del limiter

## Dependencias externas

- `express-rate-limit` — middleware Express para rate limiting (ninguna alternativa considerada, es el estándar de facto en el ecosistema Express)

## Riesgos

| Riesgo | Mitigación |
|--------|------------|
| Tests existentes fallan por límites agresivos | Mockear `express-rate-limit` en tests actuales para que sea no-op |
| Límites muy restrictivos afectan UX (usuario legítimo recibe 429) | Comenzar con límites conservadores (30 GET/min, 15 write/min) y ajustar basado en monitoreo |
| Rate limit en memoria no escala horizontalmente | Aceptable para el alcance del workshop. Futura mejora: migrar a `rate-limit-redis` |

## Complejidad

**Baja** — Implementación directa con middleware Express estándar. No requiere cambios en lógica de negocio ni base de datos.
