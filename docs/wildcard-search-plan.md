# Propuesta de solución: Búsqueda por comodín en catálogo

## 1. Backend — `backend/src/routes/products.ts`

### Agregar parámetro `search` al GET `/api/products/`

En línea 10, agregar `search` a la desestructuración de `req.query`:

```ts
const { page = '1', limit = '10', category, minPrice, maxPrice, sort, search } = req.query;
```

Insertar después del bloque `minPrice/maxPrice` (~línea 31):

```ts
if (search) {
  where.name = { startsWith: search as string };
}
```

Esto genera en SQLite: `WHERE name LIKE 'texto%'` — case-insensitive por default.

**Alternativa:** `contains` en vez de `startsWith` para match en cualquier posición del nombre:
```ts
if (search) {
  where.name = { contains: search as string };
}
```
Genera `WHERE name LIKE '%texto%'`.

## 2. Frontend — `frontend/src/pages/Products.tsx`

| Línea | Cambio |
|-------|--------|
| 23 | Agregar `const [search, setSearch] = useState('');` |
| 29 | Agregar `search` al array de dependencias del `useEffect` |
| 35 | Agregar `if (search) params.search = search;` |
| 63-82 | Agregar `<input type="text">` dentro del `div` de filtros |

Input a agregar en el `div` de filtros:

```tsx
<input
  type="text"
  value={search}
  onChange={e => { setSearch(e.target.value); setPage(1); }}
  placeholder="Buscar por nombre..."
  className="border p-2 rounded flex-1"
/>
```

## 3. Frontend — `frontend/src/services/api.ts`

**Sin cambios.** `api.products.getAll(params)` ya serializa cualquier key via `URLSearchParams`.

## Resumen de cambios

| Archivo | Cambio | Líneas |
|---------|--------|--------|
| `backend/src/routes/products.ts` | Agregar `search` param + `startsWith` filter | ~3 |
| `frontend/src/pages/Products.tsx` | Agregar estado, dependencia, param, e input | ~10 |

**Alcance total:** 2 archivos, ~13 líneas nuevas. Sin cambios en schema, migraciones, seed ni API client.
