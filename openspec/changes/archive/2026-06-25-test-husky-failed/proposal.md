## Why

Proveer un endpoint simple de prueba que permita verificar que el servidor backend responde correctamente con el mensaje "Prueba Husky", útil para validar integraciones con hooks de git (husky).

## What Changes

- Nuevo endpoint `GET /api/test-husky` que retorna el mensaje "Prueba Husky"
- Sin autenticación requerida — accesible públicamente
- Sin cambios en frontend, base de datos, ni dependencias externas

## Capabilities

### New Capabilities
- `test-husky`: endpoint público de prueba para validar hooks de git

### Modified Capabilities
<!-- No existing specs are modified -->

## Impact

- **Backend**: Nueva ruta en `backend/src/routes/test-husky.ts`
- **Frontend**: Sin cambios
- **Base de datos**: Sin cambios
- **Dependencias externas**: Ninguna

## Riesgos

- **Bajo**: Endpoint de solo lectura, sin efectos secundarios ni exposición de datos

## Complejidad

Baja
