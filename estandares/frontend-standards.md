# Estándares Técnicos — Frontend: React 18 + TypeScript + Vite + Tailwind CSS

## 1. Prácticas Recomendadas

| Práctica | Implementación |
|---|---|
| **Manejo de errores** | Try/catch en llamadas API. Manejo de errores HTTP por status code (400 validación, 401/403 auth, 500 server error). `instanceof TypeError` para errores de red. |
| **Logging** | `console.error` en catches. Sin librería externa de logging. |
| **Validación** | Validación manual en formularios con `useState`. Condiciones `canLogin` antes de submit. Errores mostrados condicionalmente en JSX. |
| **Testing** | `vitest` + `@testing-library/react`. Tests de componentes y páginas. |
| **Seguridad** | Token JWT en `localStorage` con manejo de expiración. Refresh automático antes de expirar. `fetchWithAuth` para requests autenticados. Limpiar tokens en logout. |
| **Configuración** | `VITE_*` env vars. `tsconfig.json` con `strict: true`. API_URL hardcodeada o vía Vite proxy. |

## 2. Principios de Diseño

| Principio | Aplicación |
|---|---|
| **SRP** | Componentes por página y propósito. Contexts separados por dominio (AuthContext, CartContext). Servicio API único (`api.ts`). |
| **OCP** | Composición via children props. Providers anidados. |
| **DIP** | Dependencias inyectadas via Context (`useAuth()`, `useCart()`). API abstraída tras `api` object. |
| **DRY** | `fetchWithAuth` reusable. `setTokens`/`clearTokens` centralizados. API object con métodos por recurso. |
| **KISS** | Sin librerías de estado externas. React Context + useState suficiente. Fetch nativo sin Axios. |

## 3. Patrones de Diseño

| Patrón | Propósito | Implementación |
|---|---|---|
| **Context Provider** | Estado global | `createContext` → `Provider` component → `useContext` hook. Guard: helper lanza error si se usa fuera del provider. |
| **API Service Object** | Abstracción de fetch | Objeto `api` con namespaces (`api.auth.login()`, `api.products.getAll()`, `api.cart.get()`). Fetch nativo con headers automáticos. |
| **fetchWithAuth** | Fetch autenticado | Envía `Authorization: Bearer <token>`. En 401, intenta refresh automático y reintenta. Si refresh falla, redirige a login. |
| **Token Refresh** | Sesión persistente | Decodificar JWT (base64) para obtener `exp`. Schedule: refresh al 80% del lifetime, warning 60s antes, cleanup al expirar. |
| **Composition** | Construcción de UI | Componentes anidados: `<App><AuthProvider><CartProvider><Router><Pages /></Router></CartProvider></AuthProvider></App>`. |

## 4. Manejo de Estado

| Scope | Patrón | Implementación en el proyecto |
|---|---|---|
| **Local** | `useState` | Formularios (Login, Register), filtros de productos, toggles. |
| **Global — Auth** | `createContext` + `useContext` | `AuthContext` maneja: `user`, `loading`, `sessionExpiring`, `login()`, `register()`, `logout()`, `extendSession()`. |
| **Global — Cart** | `createContext` + `useContext` | `CartContext` maneja: `cart`, `loading`, `addItem()`, `updateItem()`, `removeItem()`, `clearCart()`, `refreshCart()`. |
| **Server state** | `useEffect` + fetch | Llamadas a API en `useEffect`. `refreshCart()` en mount. Fetch con cleanup para evitar memory leaks. |
| **Routing** | `react-router-dom` v6 | `useNavigate()` para redirecciones programáticas (ej: login success → `/products`). |

## 5. Performance / Optimización

| Técnica | Implementación |
|---|---|
| **`useMemo`** | Para objetos pasados como value de Context: evita re-renders en todos los consumidores. |
| **`useCallback`** | Para funciones pasadas como value de Context (ej: `login`, `logout`). |
| **Context splitting** | Contexts separados (Auth vs Cart) evita re-renders cruzados. |
| **Debouncing** | No implementado actualmente. Posible mejora para búsqueda de productos. |

## 6. Formularios

| Aspecto | Implementación |
|---|---|
| **Controlled** | `useState` + `value` + `onChange`. Cada campo tiene su propio estado. |
| **Submit** | `handleSubmit(e) { e.preventDefault(); ... }`. Llamada a API, luego navegación o muestra de error. |
| **Validación** | Condicional con estado booleano (ej: `canLogin`). Errores renderizados como `<div className="text-red-500">`. |
| **Loading** | Estado `loading` / `isPending` para deshabilitar botón y mostrar feedback. |
| **Refs** | `useRef` para focus en inputs post-submit o error. Sin `forwardRef` en este proyecto. |

## 7. Data Fetching (API Contract)

| Aspecto | Implementación |
|---|---|
| **Fetch** | Fetch nativo. `fetch(API_URL + endpoint)`. `API_URL = 'http://localhost:3001/api'`. |
| **Auth headers** | `Authorization: Bearer <token>` agregado por `fetchWithAuth`. |
| **Refresh automático** | En 401, `doRefresh()` renueva token y reintenta. Deduplicación con `refreshPromise`. |
| **Token storage** | `localStorage` (token + refreshToken). También en memoria (let variables). |
| **Paginación** | Parámetros `?page=1&limit=20` en GET products. |
| **Errores HTTP** | 400 → error de validación. 401 → redirect a login. 500 → mensaje genérico. |

## 8. Autenticación

| Aspecto | Implementación |
|---|---|
| **Login flow** | `POST /auth/login` → `{ token, refreshToken }` → `setTokens()` → `setUser()` → navegar a `/products`. |
| **Register flow** | `POST /auth/register` → mismo que login. |
| **Logout** | `POST /auth/logout` → `clearTokens()` → `setUser(null)` → navegar a `/login`. |
| **Session refresh** | `scheduleTokenRefresh()`: calcula tiempos desde `exp` del JWT. Refresh automático al 80% del tiempo de vida. |
| **Session warning** | Callback `onExpiryWarning` 60s antes de expirar. UI muestra toast "sesión por expirar". |
| **Hydration** | En mount: si hay token, llama a `GET /auth/me` para poblar `user`. |

## 9. Estilos (Tailwind CSS)

| Aspecto | Implementación |
|---|---|
| **Enfoque** | Utility-first. Sin archivos CSS modulares. Clases directamente en JSX. |
| **Layout** | Flexbox (`flex`, `justify-*`, `items-*`) y Grid (`grid`, `grid-cols-*`). |
| **Responsive** | Prefijos `sm:`, `md:`, `lg:`, `xl:` para breakpoints. |
| **Estado** | Clases condicionales: `disabled:opacity-50`, `hover:bg-blue-600`. |
| **Theming** | Colores default de Tailwind. Sin tema oscuro implementado. |

## 10. Estructura de Proyecto

```
frontend/
├── src/
│   ├── main.tsx                 # Entry point, renderiza <App />
│   ├── App.tsx                  # Providers (AuthProvider, CartProvider) + Router + Routes
│   ├── index.css                # Directivas Tailwind (@tailwind base/components/utilities)
│   ├── context/
│   │   ├── AuthContext.tsx      # AuthProvider + useAuth() + User interface
│   │   └── CartContext.tsx      # CartProvider + useCart() + Cart/CartItem interfaces
│   ├── services/
│   │   └── api.ts               # fetchWithAuth, api object, token management, refresh scheduling
│   ├── components/
│   │   ├── Navbar.tsx           # Navegación con auth condicional
│   │   └── SessionTimeoutToast.tsx  # Toast de sesión próxima a expirar
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Products.tsx
│   │   ├── Cart.tsx
│   │   ├── Checkout.tsx
│   │   └── Admin.tsx
│   └── __tests__/
│       ├── Products.test.tsx
│       └── Checkout.test.tsx
├── package.json                 # react 18, react-router-dom 6, tailwindcss 3, vite 5, vitest
├── tailwind.config.js
├── vite.config.ts
└── tsconfig.json                # strict: true
```

## 11. Convenciones de Código

| Aspecto | Convención |
|---|---|
| **Nomenclatura** | `camelCase` funciones/vars, `PascalCase` componentes/contexts, `UPPER_SNAKE` constantes |
| **Tipado** | Interfaces inline en cada archivo. Evitar `any` (excepto `CartItem.product` — bug conocido). |
| **Context** | Nombre en PascalCase + `Provider` suffix. Hook helper con guard: `export const useAuth = () => { const ctx = useContext(AuthContext); if (!ctx) throw new Error(...); return ctx; }`. |
| **API** | Métodos nombrados como `recurso.accion`: `api.products.getAll(params)`, `api.cart.addItem(productId, quantity)`. |
| **Tokens** | `localStorage` keys: `'token'`, `'refreshToken'`. Variables en memoria como fallback. |
| **Testing** | `@testing-library/react` con `vitest`. Testear render + comportamiento. |

---

## 12. Ejemplos BAD vs GOOD

Ver [`examples-frontend.md`](./examples-frontend.md) para ejemplos contrastantes de cada bug conocido en el frontend, con la solución correcta según los estándares documentados arriba.

| # | Ejemplo | Secciones relacionadas |
|---|---------|----------------------|
| 1 | Tipado débil (`any`) → interfaces fuertes | §11 Tipado, §3 API Service Object |
| 2 | Cart total nunca actualizado → calcular en refresh | §4 Cart, §5 useMemo |
| 3 | Error handling inconsistente → patrón uniforme | §1 Manejo de errores, §7 Data Fetching |
| 4 | API_URL hardcodeada → env vars | §1 Configuración, §7 Fetch |
| 5 | Interfaces duplicadas → types/ compartido | §11 Tipado, §10 types/ |
| 6 | Cart no se limpia en checkout → clearCart() | §4 Cart, §8 Logout flow |
| 7 | Context sin memo → useMemo/useCallback | §5 useMemo/useCallback, §3 Context Provider |
