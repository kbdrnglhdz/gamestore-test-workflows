## MODIFIED Requirements

### Requirement: User Logout
Users SHALL end their session by logging out of the system.

#### Scenario: Successful logout
- **WHEN** an authenticated user clicks the logout button
- **AND** confirms the logout prompt
- **THEN** the session is terminated
- **AND** tokens are invalidated on the server
- **AND** the user is redirected to the login page

#### Scenario: Post-logout access
- **WHEN** a logged-out user attempts to access a protected resource
- **THEN** the system returns a 401 Unauthorized error

#### Scenario: Logout API failure
- **WHEN** the logout API call fails due to a network error
- **THEN** the user is still logged out locally (tokens cleared, state reset)
- **AND** the user is redirected to the login page
