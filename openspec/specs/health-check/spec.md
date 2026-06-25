# health-check Specification

## Purpose
TBD - created by archiving change test-hook. Update Purpose after archive.
## Requirements
### Requirement: Health check endpoint
El sistema SHALL proveer un endpoint `GET /api/health` accesible públicamente que retorne un mensaje de verificación.

#### Scenario: Health check exitoso
- **WHEN** un cliente envía una solicitud `GET /api/health`
- **THEN** el servidor responde con status `200` y un objeto JSON `{ success: true, data: { message: "hola mundo" } }`

#### Scenario: Método no permitido
- **WHEN** un cliente envía una solicitud `POST /api/health` (o cualquier método que no sea GET)
- **THEN** el servidor responde con status `405 Method Not Allowed`

