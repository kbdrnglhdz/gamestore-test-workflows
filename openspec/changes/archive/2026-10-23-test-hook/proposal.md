## Why

Proveer un endpoint simple de verificación ("hola mundo") que permita a desarrolladores y tests confirmar que el servidor backend está operativo sin necesidad de autenticación ni datos de prueba.

## What Changes

- Nuevo endpoint `GET /api/health` que retorna un mensaje "hola mundo"
- Sin autenticación requerida — accesible públicamente
- Sin cambios en frontend, base de datos, ni dependencias externas

## Capabilities

### New Capabilities
- `health-check`: endpoint público de verificación del servidor

### Modified Capabilities
<!-- No existing specs are modified -->

## Impact

- **Backend**: Nueva ruta en `backend/src/routes/` (archivo independiente)
- **Frontend**: Sin cambios
- **Base de datos**: Sin cambios
- **Dependencias externas**: Ninguna — solo usa Express response nativo

## Riesgos

- **Bajo**: Es un endpoint de solo lectura sin efectos secundarios. No expone datos sensibles ni modifica estado.

## Complejidad

Baja
