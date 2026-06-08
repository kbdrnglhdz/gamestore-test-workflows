# Sesión 2: Comandos básicos y primer cambio (3 horas)

## Objetivos de la sesión
- Repasar los comandos CLI básicos (`list`, `show`, `validate`).
- Comprender la estructura de un cambio y sus artefactos.
- Crear el cambio `fix-session-timeout` usando `/opsx:propose`.
- Explorar y editar ligeramente los artefactos generados.
- Validar el cambio y verificar su estado.

---

## Actividad 1: Repaso de comandos CLI (30 min)

### 1.1 Listar especificaciones existentes

```bash
openspec list --specs
```

**Salida esperada:**
```
Specs:
  auth     Authentication and session management
  catalog  Product listing and filtering
```

### 1.2 Mostrar contenido de una especificación

```bash
openspec show auth --type spec
openspec show auth --type spec --requirements
openspec show auth --type spec --requirement 1
```

### 1.3 Validar especificaciones

```bash
openspec validate --specs
openspec validate auth --type spec
```

### 1.4 Ver lista de cambios activos (debe estar vacía)

```bash
openspec list --changes
```

**Salida esperada:** `No active changes found.`

---

## Actividad 2: Teoría - Cambios y artefactos (15 min)

Un **Change** es una carpeta en `openspec/changes/<nombre>/` que contiene:

- `proposal.md`: Por qué y qué (intención, alcance, enfoque).
- `specs/`: Deltas (ADDED/MODIFIED/REMOVED) que describen cambios en el comportamiento.
- `design.md`: Cómo (enfoque técnico, decisiones).
- `tasks.md`: Checklist de implementación.

Los **delta specs** usan `## ADDED/MODIFIED/REMOVED Requirements` para indicar cambios.

---

## Actividad 3: Creación del cambio `fix-session-timeout` (30 min)

### 3.1 Ejecutar `/opsx:propose`

En el chat del asistente IA:

```
/opsx:propose fix-session-timeout
```

**Salida esperada:**
```
✓ Created openspec/changes/fix-session-timeout/
  - proposal.md
  - specs/auth/spec.md (delta)
  - design.md
  - tasks.md

Change ready. Run /opsx:apply to implement.
```

### 3.2 Verificar la estructura del cambio

```bash
ls -la openspec/changes/fix-session-timeout/
```

### 3.3 Ver el estado del cambio con CLI

```bash
openspec status --change fix-session-timeout
```

**Salida esperada:**
```
Change: fix-session-timeout
Schema: spec-driven
Progress: 4/4 artifacts complete

[x] proposal
[x] specs
[x] design
[x] tasks
```

### 3.4 Listar cambios activos

```bash
openspec list --changes
```

**Salida esperada:**
```
Active changes:
  fix-session-timeout     Fix session timeout bug
```

---

## Actividad 4: Exploración de artefactos generados (45 min)

### 4.1 Ver el `proposal.md`

```bash
cat openspec/changes/fix-session-timeout/proposal.md
```

### 4.2 Ver el delta spec (cambios en `auth`)

```bash
cat openspec/changes/fix-session-timeout/specs/auth/spec.md
```

### 4.3 Ver el `design.md`

```bash
cat openspec/changes/fix-session-timeout/design.md
```

### 4.4 Ver el `tasks.md`

```bash
cat openspec/changes/fix-session-timeout/tasks.md
```

---

## Actividad 5: Edición manual de artefactos y validación (30 min)

### 5.1 Mejorar el `proposal.md` agregando una sección de "Riesgos"

Abre el archivo con tu editor y agrega al final:

```markdown
## Risks
- Cambiar el TTL puede invalidar tokens existentes.
- Necesitamos migrar sesiones activas o invalidarlas.
```

### 5.2 Validar el cambio después de la edición

```bash
openspec validate fix-session-timeout
```

**Salida esperada:** `✓ change/fix-session-timeout is valid`

### 5.3 Ver el estado detallado en formato JSON (opcional)

```bash
openspec status --change fix-session-timeout --json | jq '.'
```

### 5.4 Ver el cambio en el dashboard interactivo

```bash
openspec view
```

Navega con flechas y selecciona `Changes` → `fix-session-timeout`.
