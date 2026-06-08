# Sesión 5: Exploración con `/opsx:explore` (3 horas)

## Objetivos de la sesión
- Usar `/opsx:explore` para investigar un problema sin crear un cambio.
- Aprender a hacer preguntas abiertas y específicas a la IA.
- Documentar hallazgos, causas raíz y posibles soluciones.
- Comparar opciones y preparar una recomendación.
- **No se crea ningún cambio**; solo se genera un archivo de investigación.

---

## Actividad 1: Contexto del bug de paginación (15 min)

En la especificación de `catalog` documentamos un bug: la página 2 muestra los mismos productos que la página 1. Vamos a investigar por qué ocurre.

**Verificar el bug manualmente (opcional):**
```bash
curl "http://localhost:3001/api/products?page=1&limit=10"
curl "http://localhost:3001/api/products?page=2&limit=10"
```

**Revisar el spec actual:**
```bash
cat openspec/specs/catalog/spec.md | grep -A 15 "Product Pagination"
```

---

## Actividad 2: Teoría - `/opsx:explore` (15 min)

- **`/opsx:explore`** es para **investigar, no para crear**.
- La IA puede leer archivos, buscar patrones, analizar código y proponer hipótesis.
- No genera artefactos ni carpetas en `changes/`.
- Puedes transicionar a un cambio después con: *"Crea un cambio basado en esta exploración"*.

**Ejemplo de prompt:**
```
/opsx:explore "Investiga por qué la paginación del catálogo devuelve los mismos productos en todas las páginas"
```

---

## Actividad 3: Exploración inicial con la IA (45 min)

### 3.1 Ejecutar exploración básica

En el chat del asistente IA:

```
/opsx:explore "Investiga el bug de paginación en GameStore. El endpoint /api/products?page=2 devuelve los mismos productos que page=1. Analiza el código del backend y encuentra la causa raíz."
```

### 3.2 Capturar hallazgos iniciales

Pide a la IA que resuma:

```
Usuario: Resume en 3 puntos los hallazgos principales.
```

### 3.3 Verificar el código manualmente (confirmación)

```bash
cat backend/src/routes/products.ts | grep -A 10 "const products = await prisma.product.findMany"
```

---

## Actividad 4: Profundización y análisis de alternativas (45 min)

### 4.1 Explorar soluciones posibles

```
Usuario: ¿Cuáles son las posibles soluciones? Compáralas en esfuerzo e impacto.
```

### 4.2 Solicitar un diagrama del flujo actual vs corregido

```
Usuario: Muestra un diagrama de flujo de cómo funciona la paginación ahora y cómo debería funcionar.
```

### 4.3 Identificar otros problemas relacionados

```
/opsx:explore Además del parseo, ¿hay otros problemas de paginación? Revisa el frontend.
```

---

## Actividad 5: Documentación de hallazgos (30 min)

### 5.1 Crear archivo de investigación

```bash
mkdir -p docs/investigations
```

```bash
Crea un archivo pagination-bug.md en docs/investigations unicamente sobre la investigación del bug de la paginación rota.
```

### 5.2 Verificar que el archivo se creó

```bash
cat docs/investigations/pagination-bug.md | head -20
```

---

## Actividad 6: Preparación para cambio futuro (20 min)

### 6.1 Resumir la recomendación ejecutiva

```bash
Crea un archivo pagination-recommendation.md en docs/investigations unicamente sobre la recomendación de solución del bug de la paginación rota.
```

### 6.2 Verificar que el archivo se creó

```bash
cat docs/investigations/pagination-recommendation.md | head -20
```

### 6.3 Verificar que no se creó ningún cambio en OpenSpec

```bash
openspec list --changes
```
