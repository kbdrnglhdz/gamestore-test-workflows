## ADDED Requirements

### Requirement: Test Husky endpoint
El sistema SHALL proveer un endpoint `GET /api/test-husky` accesible públicamente que retorne un mensaje de prueba.

#### Scenario: Test exitoso
- **WHEN** un cliente envía una solicitud `GET /api/test-husky`
- **THEN** el servidor responde con status `200` y un objeto JSON `{ success: true, data: { message: "Prueba Husky" } }`

#### Scenario: Método no permitido
- **WHEN** un cliente envía una solicitud con método diferente a GET (POST, PUT, DELETE, etc.)
- **THEN** el servidor responde con status `405 Method Not Allowed`
