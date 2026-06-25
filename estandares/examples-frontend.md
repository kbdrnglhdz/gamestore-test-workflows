# Ejemplos BAD vs GOOD — Frontend: React 18 + TypeScript + Vite + Tailwind CSS

Cada ejemplo contrasta un bug real del código con la solución correcta según la documentación oficial.

---

## 1. Tipado débil: `any`

```typescript
// 🚫 BAD: frontend/src/context/CartContext.tsx
// product tipado como any — pierdes type-safety y autocompletado
interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: any;   // ← puedes acceder a product.cualquierCosa sin error en compilación
}

// Uso: error en runtime porque 'name' no existe
cart.items.forEach((item) => {
  console.log(item.product.nme); // ← TS no ataja este typo
});
```

```typescript
// ✅ GOOD: interfaces fuertes
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  category: string;
}

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: Product;   // ← tipo específico
}

// Uso: TypeScript ataja errores en compilación
cart.items.forEach((item) => {
  console.log(item.product.nme);
  // ↑ Error: Property 'nme' does not exist on type 'Product'. Did you mean 'name'?
});
```

> 📎 Relacionado con: **frontend-standards.md §11 Convenciones — Tipado** y **§3 Patrones — API Service Object**

---

## 2. Cart total nunca actualizado

```typescript
// 🚫 BAD: frontend/src/context/CartContext.tsx
// El estado total se declara pero nunca se actualiza — siempre muestra 0
const [total, setTotal] = useState(0);

const refreshCart = async () => {
  try {
    const data = await api.cart.get();
    setCart(data);
    // setTotal(data.total) ?? — no existe, nunca se calcula
  } catch (err) {
    console.error('Failed to refresh cart', err);
  }
};

// En Cart.tsx se usa un workaround:
const localTotal = cart?.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0) ?? 0;
// ↑ el estado total del context no sirve para nada
```

```typescript
// ✅ GOOD: calcular total al refrescar el carrito
const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const refreshCart = async () => {
    try {
      setLoading(true);
      const data = await api.cart.get();
      setCart(data);

      // Calcular total como parte del estado
      if (data?.items) {
        const calculated = data.items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0,
        );
        setTotal(calculated);
      } else {
        setTotal(0);
      }
    } catch (err) {
      console.error('Failed to refresh cart', err);
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo(() => ({
    cart,
    total,      // ← ahora es parte del estado del context
    loading,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    refreshCart,
  }), [cart, total, loading]);

  // ...

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
```

> 📎 Relacionado con: **frontend-standards.md §4 Manejo de Estado — Global — Cart** y **§5 Performance — useMemo**

---

## 3. Error handling inconsistente

```typescript
// 🚫 BAD: frontend/src/services/api.ts
// Algunas funciones tienen try/catch, otras no — comportamiento impredecible
export const api = {
  auth: {
    async login(email: string, password: string) {
      try {                                   // ← tiene try/catch
        const res = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error);
        }
        return res.json();
      } catch (error) {
        if (error instanceof TypeError) {
          throw new Error('Network error');
        }
        throw error;
      }
    },

    async me() {
      const res = await fetchWithAuth('/auth/me');
      const data = await res.json();           // ← sin try/catch: si falla, error no manejado
      return data;
    },

    async logout() {
      await fetchWithAuth('/auth/logout');     // ← sin try/catch
    },
  },
};
```

```typescript
// ✅ GOOD: error handling consistente en todos los métodos
async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  auth: {
    async login(email: string, password: string) {
      try {
        const res = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        return handleResponse<{ token: string; refreshToken: string; user: User }>(res);
      } catch (error) {
        if (error instanceof TypeError) {
          throw new Error('Network error: please check your connection');
        }
        throw error;
      }
    },

    async me() {
      try {
        const res = await fetchWithAuth('/auth/me');
        return handleResponse<User>(res);
      } catch (error) {
        if (error instanceof TypeError) {
          throw new Error('Network error');
        }
        throw error;
      }
    },

    async logout() {
      try {
        const res = await fetchWithAuth('/auth/logout');
        if (!res.ok) throw new Error('Logout failed');
      } catch (error) {
        console.error('Logout error:', error);
        throw error;
      }
    },
  },
};
```

> 📎 Relacionado con: **frontend-standards.md §1 Prácticas — Manejo de errores** y **§7 Data Fetching**

---

## 4. API_URL hardcodeada

```typescript
// 🚫 BAD: frontend/src/services/api.ts
// La URL está hardcodeada — no se puede cambiar sin modificar el código
const API_URL = 'http://localhost:3001/api';

// Si cambia el puerto o se despliega a producción, hay que editar el archivo
```

```typescript
// ✅ GOOD: variable de entorno
const API_URL = import.meta.env.VITE_API_URL || '/api';
```

```bash
# .env (raíz del frontend)
VITE_API_URL=http://localhost:3001/api
```

```bash
# .env.production
VITE_API_URL=https://api.misitio.com
```

```typescript
// vite.config.ts — proxy para desarrollo
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
```

> 📎 Relacionado con: **frontend-standards.md §1 Prácticas — Configuración** y **§7 Data Fetching — Fetch**

---

## 5. Interfaces duplicadas

```typescript
// 🚫 BAD: misma interfaz definida en múltiples archivos — difícil de mantener

// context/AuthContext.tsx
interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

// pages/Admin.tsx — duplicado con más campos
interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  createdAt: string;  // ← extra que AuthContext no tiene
}

// pages/Products.tsx
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  category: string;
}

// context/CartContext.tsx — product es any porque Product no existe aquí
interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: any;
}
```

```typescript
// ✅ GOOD: frontend/src/types/index.ts — un solo lugar para todas las interfaces
export interface User {
  id: number;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt?: string;   // opcional: no siempre está presente
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  category: string;
}

export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: Product;   // ← usa la interfaz compartida
}

export interface Cart {
  id: number;
  items: CartItem[];
}

export interface Order {
  id: number;
  userId: number;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product: Product;
}
```

```typescript
// context/AuthContext.tsx — importa desde types
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  sessionExpiring: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  extendSession: () => Promise<boolean>;
}
```

```typescript
// pages/Admin.tsx — mismo import
import type { User, Order } from '../types';
```

> 📎 Relacionado con: **frontend-standards.md §11 Convenciones — Tipado** y **§10 Estructura de Proyecto — types/**

---

## 6. Cart no se limpia al checkout

```typescript
// 🚫 BAD: frontend/src/pages/Checkout.tsx
// Después de crear la orden, el carrito en el frontend sigue lleno
const handleCheckout = async () => {
  try {
    setLoading(true);
    const order = await api.orders.checkout({ /* datos */ });
    // No llama a clearCart() — el estado global del carrito sigue mostrando los items
    navigate(`/orders/${order.id}`);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Checkout failed');
  } finally {
    setLoading(false);
  }
};
```

```typescript
// ✅ GOOD: limpiar carrito post-checkout
const handleCheckout = async () => {
  try {
    setLoading(true);
    const order = await api.orders.checkout({ /* datos */ });
    await clearCart();     // ← limpia el estado global del carrito
    navigate(`/orders/${order.id}`);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Checkout failed');
  } finally {
    setLoading(false);
  }
};
```

> 📎 Relacionado con: **frontend-standards.md §4 Manejo de Estado — Global — Cart** y **§8 Autenticación — Logout flow** (mismo patrón: limpiar estado)

---

## 7. Context value sin memo

```typescript
// 🚫 BAD: frontend/src/context/AuthContext.tsx
// Cada vez que AuthProvider se renderiza, se crea un objeto nuevo
// → TODOS los consumidores del context se re-renderizan, aunque nada haya cambiado
<AuthContext.Provider value={{ user, login, logout, loading, sessionExpiring }}>
  {children}
</AuthContext.Provider>

// Componente que consume AuthContext pero solo necesita login:
function LoginButton() {
  const { login } = useAuth();
  return <button onClick={() => login('a@b.com', '123')}>Login</button>;
  // ↑ se re-renderiza aunque solo cambiara loading o sessionExpiring
}
```

```typescript
// ✅ GOOD: memoizar el value para evitar re-renders innecesarios
const login = useCallback(async (email: string, password: string) => {
  try {
    const data = await api.auth.login(email, password);
    setTokens(data.token, data.refreshToken);
    setUser(data.user);
    startProactiveRefresh();
  } catch (error) {
    throw error;
  }
}, []);

const logout = useCallback(async () => {
  try {
    await api.auth.logout();
  } finally {
    clearTokens();
    setUser(null);
    stopProactiveRefresh();
    navigate('/login');
  }
}, [navigate]);

const extendSession = useCallback(async () => {
  try {
    const success = await doRefresh();
    return success;
  } catch {
    return false;
  }
}, []);

const value = useMemo(() => ({
  user,
  login,
  logout,
  loading,
  sessionExpiring,
  extendSession,
}), [user, loading, sessionExpiring]);
// ↑ login/logout/extendSession no están en deps porque son estables (useCallback)

<AuthContext.Provider value={value}>
  {children}
</AuthContext.Provider>

// Ahora LoginButton solo se re-renderiza si login cambia (nunca, porque es useCallback sin deps)
function LoginButton() {
  const { login } = useAuth();
  return <button onClick={() => login('a@b.com', '123')}>Login</button>;
}
```

> 📎 Relacionado con: **frontend-standards.md §5 Performance — useMemo / useCallback** y **§3 Patrones — Context Provider**
