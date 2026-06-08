# Sesión 3: Implementación con `/opsx:apply` (3 horas)

## Objetivos de la sesión
- Implementar las tareas del cambio `fix-session-timeout` usando `/opsx:apply`.
- Comprender cómo la IA actualiza `tasks.md` automáticamente.
- Manejar una interrupción simulada y retomar la implementación.
- Verificar el progreso con `openspec status`.
- Dejar el cambio parcialmente implementado (backend completado, frontend pendiente) para retomar en la Sesión 4.

---

## Actividad 1: Repaso y verificación del cambio (15 min)

### 1.1 Verificar que el cambio existe y está listo

```bash
openspec list --changes
openspec status --change fix-session-timeout
```

**Salida esperada:**
```
Change: fix-session-timeout
Progress: 4/4 artifacts complete
[x] proposal
[x] specs
[x] design
[x] tasks
```

### 1.2 Revisar las tareas pendientes

```bash
cat openspec/changes/fix-session-timeout/tasks.md
```

---

## Actividad 2: Teoría - Cómo funciona `/opsx:apply` (15 min)

- `/opsx:apply` lee `tasks.md` y detecta las tareas incompletas (las que no tienen `[x]`).
- Implementa una tarea por vez, marcándola como completada.
- Si se interrumpe, al volver a ejecutar `apply` retoma desde donde quedó.
- Puedes especificar el nombre del cambio si hay múltiples: `/opsx:apply fix-session-timeout`.

**Flujo:**
```
/opsx:apply
→ Tarea 1.1: implementa → marca [x]
→ Tarea 1.2: implementa → marca [x]
→ (interrupción)
/opsx:apply
→ Tarea 1.3: implementa → marca [x]
```

---

## Actividad 3: Implementación del backend (60 min)

### 3.1 Ejecutar `/opsx:apply` por primera vez

En el chat del asistente IA:

```
/opsx:apply fix-session-timeout
```

Observa cómo la IA lee `tasks.md`, identifica la primera tarea incompleta, modifica el código fuente y marca la tarea como `[x]`.

### 3.2 Verificar el progreso después de cada tarea (opcional)

```bash
cat openspec/changes/fix-session-timeout/tasks.md | grep -E "\[ \]|\[x\]"
```

### 3.3 Continuar la implementación (si se interrumpió)

Vuelve a ejecutar:

```
/opsx:apply fix-session-timeout
```

### 3.4 Al finalizar el backend, verificar que las tareas 1.x están completas

```bash
grep -A 10 "## 1. Backend" openspec/changes/fix-session-timeout/tasks.md
```

**Salida esperada:**
```
## 1. Backend
- [x] 1.1 Agregar campo `lastActivity` al modelo de sesión
- [x] 1.2 Modificar middleware para actualizar `lastActivity`
- [x] 1.3 Cambiar TTL del refresh token a 60 minutos
- [x] 1.4 Implementar endpoint `/api/auth/refresh`
```

---

## Actividad 4: Simulación de interrupción y verificación (15 min)

### 4.1 Verificar el estado actual

```bash
openspec list
```

---

## Actividad 5: Implementación del frontend (opcional, 45 min)

*Esta actividad se puede realizar si hay tiempo. Si no, se deja pendiente para la Sesión 4.*

### 5.1 Continuar con `/opsx:apply`

```
/opsx:apply fix-session-timeout
```

### 5.2 Verificar que todas las tareas están completas

```bash
openspec view
```

---

## Actividad 6: Verificación final y cierre (20 min)

### 6.1 Validar el cambio

```bash
openspec validate fix-session-timeout
```

### 6.2 Hacer un commit del progreso (opcional)

```bash
git add .
git commit -m "WIP: fix-session-timeout - backend completed"
```

### 6.3 Registrar las tareas pendientes para la siguiente sesión

```bash
echo "Tareas pendientes para la Sesión 4:" > pending.md
grep "\[ \]" openspec/changes/fix-session-timeout/tasks.md >> pending.md
cat pending.md
```
