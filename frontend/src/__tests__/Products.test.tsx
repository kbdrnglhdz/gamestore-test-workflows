import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

const { mockGetAll } = vi.hoisted(() => ({
  mockGetAll: vi.fn(),
}));

vi.mock('../services/api', () => ({
  api: {
    products: {
      getAll: mockGetAll,
    },
  },
}));

vi.mock('../context/CartContext', () => ({
  useCart: vi.fn(),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Products } from '../pages/Products';

const sampleProducts = [
  { id: 1, name: 'Zelda: Breath of the Wild', price: '59.99', category: 'Adventure', description: 'Epic adventure', image: '/img1.jpg', stock: 10 },
  { id: 2, name: 'Call of Duty', price: '49.99', category: 'Shooter', description: 'FPS', image: '/img2.jpg', stock: 5 },
  { id: 3, name: 'Age of Empires', price: '29.99', category: 'Strategy', description: 'RTS', image: '/img3.jpg', stock: 3 },
];

function renderProducts() {
  return render(
    <BrowserRouter>
      <Products />
    </BrowserRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  (useCart as any).mockReturnValue({ addItem: vi.fn() });
  (useAuth as any).mockReturnValue({ user: { id: 1, email: 'user@test.com', name: 'User', role: 'user' } });
  mockGetAll.mockResolvedValue({ products: sampleProducts, total: 3, page: 1, totalPages: 1 });
});

describe('Products page - search', () => {
  it('renders search input with placeholder', async () => {
    renderProducts();

    expect(screen.getByPlaceholderText('Search products...')).toBeInTheDocument();
  });

  it('calls API with search param when user types', async () => {
    renderProducts();
    const user = userEvent.setup();
    const input = screen.getByPlaceholderText('Search products...');

    await user.type(input, 'zel');

    expect(mockGetAll).toHaveBeenCalledWith(expect.objectContaining({ search: 'zel' }));
  });

  it('calls API without search param when input is empty', async () => {
    renderProducts();
    const user = userEvent.setup();
    const input = screen.getByPlaceholderText('Search products...');

    await user.type(input, 'zel');
    await user.clear(input);

    const calls = mockGetAll.mock.calls;
    const lastCall = calls[calls.length - 1][0];
    expect(lastCall).not.toHaveProperty('search');
  });

  it('resets to page 1 when search changes', async () => {
    renderProducts();
    const user = userEvent.setup();

    mockGetAll.mockResolvedValue({ products: sampleProducts, total: 3, page: 2, totalPages: 3 });

    const input = screen.getByPlaceholderText('Search products...');
    await user.type(input, 'zel');

    const searchCalls = mockGetAll.mock.calls.filter((c: any) => c[0].search === 'zel');
    const lastSearchCall = searchCalls[searchCalls.length - 1][0];
    expect(lastSearchCall.page).toBe(1);
  });
});
