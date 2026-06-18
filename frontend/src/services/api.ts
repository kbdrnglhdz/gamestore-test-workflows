const API_URL = 'http://localhost:3001/api';

let authToken = localStorage.getItem('token');
let refreshToken = localStorage.getItem('refreshToken');

export const setTokens = (token: string, refresh: string) => {
  authToken = token;
  refreshToken = refresh;
  localStorage.setItem('token', token);
  localStorage.setItem('refreshToken', refresh);
};

export const clearTokens = () => {
  authToken = null;
  refreshToken = null;
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
};

export const getToken = () => authToken;

const decodeToken = (token: string): { exp: number; iat: number } | null => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
};

let refreshPromise: Promise<boolean> | null = null;
let refreshTimeout: ReturnType<typeof setTimeout> | null = null;
let expiryWarningTimeout: ReturnType<typeof setTimeout> | null = null;
let expiryTimeout: ReturnType<typeof setTimeout> | null = null;

type SessionCallbacks = {
  onExpiryWarning: () => void;
  onSessionExpired: () => void;
};

let sessionCallbacks: SessionCallbacks | null = null;

export const setSessionCallbacks = (callbacks: SessionCallbacks) => {
  sessionCallbacks = callbacks;
};

export const clearSessionCallbacks = () => {
  sessionCallbacks = null;
};

const doRefresh = async (): Promise<boolean> => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        setTokens(data.token, data.refreshToken);
        return true;
      } else {
        clearTokens();
        return false;
      }
    } catch {
      clearTokens();
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

const stopScheduledRefresh = () => {
  if (refreshTimeout) clearTimeout(refreshTimeout);
  if (expiryWarningTimeout) clearTimeout(expiryWarningTimeout);
  if (expiryTimeout) clearTimeout(expiryTimeout);
  refreshTimeout = null;
  expiryWarningTimeout = null;
  expiryTimeout = null;
};

const scheduleTokenRefresh = () => {
  if (!authToken) return;
  stopScheduledRefresh();

  const decoded = decodeToken(authToken);
  if (!decoded) return;

  const now = Date.now();
  const expMs = decoded.exp * 1000;
  const iatMs = decoded.iat * 1000;
  const lifetime = expMs - iatMs;

  const refreshDelay = Math.max(0, iatMs + lifetime * 0.8 - now);
  const warningDelay = Math.max(0, expMs - now - 60000);
  const expiryDelay = Math.max(0, expMs - now);

  if (refreshDelay <= 0) {
    doRefresh().then(success => {
      if (success) scheduleTokenRefresh();
    });
    return;
  }

  refreshTimeout = setTimeout(async () => {
    const success = await doRefresh();
    if (success) {
      scheduleTokenRefresh();
    }
  }, refreshDelay);

  expiryWarningTimeout = setTimeout(() => {
    sessionCallbacks?.onExpiryWarning();
  }, warningDelay);

  expiryTimeout = setTimeout(() => {
    if (sessionCallbacks) {
      clearTokens();
      sessionCallbacks.onSessionExpired();
    }
  }, expiryDelay);
};

export const startProactiveRefresh = () => {
  scheduleTokenRefresh();
};

export const stopProactiveRefresh = () => {
  stopScheduledRefresh();
};

export const extendSession = async (): Promise<boolean> => {
  const success = await doRefresh();
  if (success) {
    scheduleTokenRefresh();
  }
  return success;
};

const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const headers: any = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  let response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

  if (response.status === 401 && refreshToken) {
    const refreshed = await doRefresh();

    if (refreshed) {
      headers['Authorization'] = `Bearer ${authToken}`;
      response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    } else {
      clearTokens();
      window.location.href = '/login';
    }
  }

  return response;
};

export const api = {
  auth: {
    register: async (data: any) => {
      try {
        const response = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const json = await response.json();
        if (!response.ok) {
          throw new Error(json.error || 'Registration failed');
        }
        return json;
      } catch (err: any) {
        if (err instanceof TypeError) {
          throw new Error('Network error. Please check your connection.');
        }
        throw err;
      }
    },
    login: async (data: any) => {
      try {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const json = await response.json();
        if (!response.ok) {
          throw new Error(json.error || 'Login failed');
        }
        return json;
      } catch (err: any) {
        if (err instanceof TypeError) {
          throw new Error('Network error. Please check your connection.');
        }
        throw err;
      }
    },
    me: async () => {
      try {
        const response = await fetchWithAuth('/auth/me');
        const json = await response.json();
        if (!response.ok) {
          throw new Error(json.error || 'Failed to fetch user');
        }
        return json;
      } catch (err: any) {
        if (err instanceof TypeError) {
          throw new Error('Network error. Please check your connection.');
        }
        throw err;
      }
    },
    logout: async () => {
      await fetchWithAuth('/auth/logout', { method: 'POST' });
    }
  },
  products: {
    getAll: async (params = {}) => {
      const query = new URLSearchParams(params as any).toString();
      return fetchWithAuth(`/products?${query}`).then(r => r.json());
    },
    getById: async (id: number) => fetchWithAuth(`/products/${id}`).then(r => r.json()),
    create: async (data: any) => fetchWithAuth('/products', { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
    update: async (id: number, data: any) => fetchWithAuth(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }).then(r => r.json()),
    delete: async (id: number) => fetchWithAuth(`/products/${id}`, { method: 'DELETE' }).then(r => r.json())
  },
  cart: {
    get: async () => fetchWithAuth('/cart').then(r => r.json()),
    addItem: async (productId: number, quantity = 1) => fetchWithAuth('/cart/add', { method: 'POST', body: JSON.stringify({ productId, quantity }) }).then(r => r.json()),
    updateItem: async (itemId: number, quantity: number) => fetchWithAuth(`/cart/item/${itemId}`, { method: 'PUT', body: JSON.stringify({ quantity }) }).then(r => r.json()),
    removeItem: async (itemId: number) => fetchWithAuth(`/cart/item/${itemId}`, { method: 'DELETE' }).then(r => r.json()),
    clear: async () => fetchWithAuth('/cart/clear', { method: 'DELETE' }).then(r => r.json())
  },
  orders: {
    checkout: async (data: any) => fetchWithAuth('/orders/checkout', { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
    getAll: async () => fetchWithAuth('/orders').then(r => r.json()),
    getById: async (id: number) => fetchWithAuth(`/orders/${id}`).then(r => r.json())
  },
  admin: {
    getUsers: async () => fetchWithAuth('/admin/users').then(r => r.json()),
    getOrders: async () => fetchWithAuth('/admin/orders').then(r => r.json()),
    updateOrderStatus: async (id: number, status: string) => fetchWithAuth(`/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }).then(r => r.json()),
    getStats: async () => fetchWithAuth('/admin/stats').then(r => r.json())
  }
};
