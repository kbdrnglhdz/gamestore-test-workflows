# Sesión 1: Setup y documentación inicial (3 horas)

## Objetivos de la sesión
- Instalar OpenSpec globalmente.
- Inicializar OpenSpec en el proyecto GameStore.
- Crear las primeras especificaciones (`auth` y `catalog`) documentando el comportamiento actual (con bugs).
- Validar que las especificaciones sean correctas.

---

## Actividad 1: Verificación de requisitos (10 min)

Abre una terminal en la raíz del proyecto `gamestore-workshop` y ejecuta:

```bash
node --version
npm --version
pwd
ls -la
```

---

## Actividad 2: Instalación global de OpenSpec (15 min)

```bash
npm install -g @fission-ai/openspec@latest
openspec --version
```

**Salida esperada:** `0.5.0` o superior.

---

## Actividad 3: Inicialización de OpenSpec (30 min)

### 3.1 Ejecutar `openspec init`

```bash
openspec init
```

Responde de la siguiente manera:

1. **Selecciona las herramientas de IA:** marca `claude`, `cursor` y `opencode`. Presiona Enter.
2. **¿Configurar un esquema por defecto?** Responde `Y`.
3. **Selecciona el esquema:** elige `spec-driven`.
4. **¿Habilitar workflow expandido?** Responde `N`.
5. **¿Crear archivo de configuración?** Responde `Y` y acepta valores por defecto.

### 3.2 Verificar la estructura

```bash
ls -la openspec/
```

Debes ver:
```
openspec/
├── config.yaml
├── specs/
│   └── .gitkeep
└── changes/
    └── .gitkeep
```

### 3.3 Verificar skills

```bash
ls .opencode/command/ | grep opsx
```

---

## Actividad 4: Crear especificaciones (75 min)

### 4.1 Crear directorio `auth`

```bash
mkdir -p openspec/specs/auth
```

### 4.2 Crear archivo `spec.md` para autenticación

```bash
cat > openspec/specs/auth/spec.md << 'EOF'
# Auth Specification

## Purpose
Authentication and session management for GameStore.

## Requirements

### Requirement: User Login
Users SHALL authenticate with email and password to access the system.

#### Scenario: Valid credentials
- **WHEN** a user submits the login form with email "test@example.com" and password "secret"
- **THEN** a JWT access token is returned
- **AND** a refresh token is stored in HTTP-only cookie

#### Scenario: Invalid credentials
- **WHEN** a user submits the login form with invalid email or password
- **THEN** an error message "Invalid credentials" is displayed
- **AND** no tokens are issued

### Requirement: Session Persistence
Users SHALL maintain their session for 15 minutes after login.

#### Scenario: Session timeout
- **WHEN** 15 minutes pass without any request from an authenticated user
- **THEN** the session expires
- **AND** the user must log in again

**KNOWN BUG:** Session expires after 15 minutes regardless of user activity.
**KNOWN BUG:** Refresh token never renews automatically.

### Requirement: Password Storage
Users SHALL have their passwords stored securely.

#### Scenario: Password hashing on registration
- **WHEN** a new user registers with a password
- **THEN** the password is stored as a hashed value

#### Scenario: Password verification on login
- **WHEN** a user provides the correct password during login
- **THEN** the system verifies the hash matches before granting access

**KNOWN BUG:** Passwords are stored in plain text in the database.
**VIOLATION:** This does NOT follow security best practices.

### Requirement: User Logout
Users SHALL end their session by logging out of the system.

#### Scenario: Successful logout
- **WHEN** an authenticated user clicks the logout button
- **THEN** the session is terminated
- **AND** tokens are invalidated

#### Scenario: Post-logout access
- **WHEN** a logged-out user attempts to access a protected resource
- **THEN** the system returns a 401 Unauthorized error
EOF
```

### 4.3 Crear directorio `catalog`

```bash
mkdir -p openspec/specs/catalog
```

### 4.4 Crear `spec.md` para catálogo

```bash
cat > openspec/specs/catalog/spec.md << 'EOF'
# Catalog Specification

## Purpose
Product listing, filtering, and pagination for GameStore.

## Requirements

### Requirement: Product Pagination
Users SHALL browse products in pages of 10 items.

#### Scenario: First page
- **WHEN** a user requests page 1
- **THEN** products 1-10 are returned

#### Scenario: Second page
- **WHEN** a user requests page 2
- **THEN** products 11-20 are returned

**KNOWN BUG:** Page 2 returns the same products as page 1.

### Requirement: Price Filter
Users SHALL filter products by price range.

#### Scenario: Filter by price range
- **WHEN** a user applies a price filter between 10 and 30
- **THEN** products with prices 15 and 25 are shown

#### Scenario: Sort by price ascending
- **WHEN** a user selects "Price: Low to High"
- **THEN** products are ordered from lowest to highest price

#### Scenario: Sort by price descending
- **WHEN** a user selects "Price: High to Low"
- **THEN** products are ordered from highest to lowest price

**KNOWN BUG:** Price filter orders products alphabetically instead of numerically.

### Requirement: Product Images
Users SHALL view product images correctly.

#### Scenario: Display product image
- **WHEN** a user views a product in the catalog
- **THEN** the product image is displayed from the backend URL

#### Scenario: Broken image fallback
- **WHEN** a product image URL is not accessible
- **THEN** a fallback placeholder image is shown

**KNOWN BUG:** Product images use absolute local paths instead of relative or CDN URLs, causing broken images in production.
EOF
```

### 4.5 Verificar archivos

```bash
ls -la openspec/specs/auth/
ls -la openspec/specs/catalog/
cat openspec/specs/auth/spec.md | head -10
cat openspec/specs/catalog/spec.md | head -10
```

---

## Actividad 5: Validación y exploración (20 min)

### 5.1 Validar todas las especificaciones

```bash
openspec validate --specs
```

### 5.2 Validar una específica

```bash
openspec validate auth --type spec
openspec validate catalog --type spec
```

### 5.3 Listar especificaciones

```bash
openspec list --specs
```

**Salida esperada:**
```
Specs:
  auth     Authentication and session management
  catalog  Product listing and filtering
```

### 5.4 Mostrar contenido

```bash
openspec show auth --type spec
openspec show catalog --type spec --requirements
```

### 5.5 Dashboard interactivo (opcional)

```bash
openspec view
```
