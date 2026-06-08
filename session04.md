# Sesión 4: Finalización y archive de `fix-session-timeout` (3 horas)

## Objetivos de la sesión
- Completar las tareas pendientes del frontend para `fix-session-timeout`.
- Validar la estructura del cambio con `openspec validate`.
- Archivar el cambio con `/opsx:archive`, sincronizando los delta specs con los specs principales.
- Verificar que los delta specs se fusionaron correctamente.
- Explorar el cambio archivado en `changes/archive/`.

---

## Actividad 1: Verificación del estado actual (15 min)

### 1.1 Listar cambios activos

```bash
openspec list --changes
```

### 1.2 Ver el progreso de las tareas

```bash
grep "\[ \]" openspec/changes/fix-session-timeout/tasks.md
```

### 1.3 Ver el estado general del cambio

```bash
openspec list --changes
```

**Salida esperada:**
```
Changes:
  fix-session-timeout     ✓ Complete    17m ago
```

---

## Actividad 2: Teoría - `/opsx:archive` y sincronización de deltas (15 min)

- **`/opsx:archive`** finaliza el cambio:
  - Fusiona los delta specs con los specs principales (`openspec/specs/`).
  - Mueve la carpeta del cambio a `openspec/changes/archive/YYYY-MM-DD-<nombre>/`.
  - Pregunta si deseas sincronizar los specs.
- **Sincronización de deltas**: aplica los cambios `ADDED/MODIFIED/REMOVED` al spec principal.

**Flujo:** completar tareas → ejecutar `/opsx:archive` → confirmar sincronización → verificar resultados.

---

## Actividad 3: Completar el frontend (45 min)

*Si el frontend ya se completó en la sesión anterior, salta a la Actividad 4.*

### 3.1 Ejecutar `/opsx:apply` para continuar

```
/opsx:apply fix-session-timeout
```

### 3.2 Verificar que todas las tareas estén completas

```bash
grep "\[ \]" openspec/changes/fix-session-timeout/tasks.md
```

### 3.3 Ver el estado final de las tareas

```bash
openspec list --changes
```

---

## Actividad 4: Archivar el cambio (45 min)

### 4.1 Ejecutar `/opsx:archive`

```
/opsx:archive fix-session-timeout
```

**Interacción esperada:**
```
AI: Archiving fix-session-timeout...

Artifact status:
✓ proposal.md exists
✓ specs/ exists (delta spec found)
✓ design.md exists
✓ tasks.md exists (6/6 tasks complete)

Delta specs: Ready to sync
→ This will modify openspec/specs/auth/spec.md
→ MODIFIED: Session Persistence (15min → 60min)

Continue with archive? (Y/n)
```

Responde: `Y`

```
AI: ✓ Synced delta specs to openspec/specs/auth/spec.md
✓ Moved change to openspec/changes/archive/2026-04-23-fix-session-timeout/

Change archived successfully!
```

### 4.2 Verificar que el cambio ya no está activo

```bash
openspec list --changes
```

**Salida esperada:** `No active changes found.`

### 4.3 Ver el cambio en el archivo

```bash
ls openspec/changes/archive/
```

---

## Actividad 5: Verificar la fusión de specs y el archive (30 min)

### 5.1 Ver el spec principal actualizado

```bash
cat openspec/specs/auth/spec.md | grep -A 20 "Session Persistence"
```

### 5.2 Verificar que otros requirements no se modificaron

```bash
cat openspec/specs/auth/spec.md | grep "### Requirement:"
```

### 5.3 Explorar el contenido del archive

```bash
ls -la openspec/changes/archive/2026-04-23-fix-session-timeout/
cat openspec/changes/archive/2026-04-23-fix-session-timeout/proposal.md | head -10
```

### 5.4 Validar todos los specs después del merge

```bash
openspec validate --specs
```
