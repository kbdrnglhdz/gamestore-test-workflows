import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

const { mockNavigate, mockClearCart, mockCheckout } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockClearCart: vi.fn(),
  mockCheckout: vi.fn(),
}));

vi.mock('../services/api', () => ({
  api: {
    orders: {
      checkout: mockCheckout,
    },
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../context/CartContext', () => ({
  useCart: vi.fn(),
}));

import { useCart } from '../context/CartContext';
import { Checkout } from '../pages/Checkout';

function renderCheckout() {
  return render(
    <BrowserRouter>
      <Checkout />
    </BrowserRouter>,
  );
}

const mockCart = {
  id: 1,
  items: [
    { id: 10, productId: 5, quantity: 2, product: { id: 5, name: 'Game X', price: '29.99' } },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  (useCart as any).mockReturnValue({ cart: mockCart, clearCart: mockClearCart });
});

describe('Checkout page', () => {
  describe('empty cart state', () => {
    it('shows empty message when cart is null', () => {
      (useCart as any).mockReturnValue({ cart: null, clearCart: mockClearCart });

      renderCheckout();

      expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
      expect(screen.getByText('Go to Products')).toBeInTheDocument();
    });

    it('shows empty message when cart has no items', () => {
      (useCart as any).mockReturnValue({
        cart: { id: 1, items: [] },
        clearCart: mockClearCart,
      });

      renderCheckout();

      expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
    });
  });

  describe('checkout form', () => {
    it('renders order summary with cart items', () => {
      renderCheckout();

      expect(screen.getByText('Order Summary')).toBeInTheDocument();
      expect(screen.getByText(/Game X/)).toBeInTheDocument();
    });

    it('renders shipping address and payment fields', () => {
      renderCheckout();

      expect(screen.getByText('Shipping Address')).toBeInTheDocument();
      expect(screen.getByText('Payment Method')).toBeInTheDocument();
      expect(screen.getByText('Place Order')).toBeInTheDocument();
    });
  });

  describe('backend error handling', () => {
    it('displays order.error via alert when backend returns error', async () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      mockCheckout.mockResolvedValue({ error: 'Insufficient stock for "Game X". Available: 0, requested: 2' });
      const user = userEvent.setup();

      renderCheckout();
      await user.click(screen.getByText('Place Order'));

      expect(alertSpy).toHaveBeenCalledWith(
        'Insufficient stock for "Game X". Available: 0, requested: 2',
      );
      expect(mockClearCart).not.toHaveBeenCalled();
      alertSpy.mockRestore();
    });

    it('does not navigate when backend returns error', async () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      mockCheckout.mockResolvedValue({ error: 'Some error' });
      const user = userEvent.setup();

      renderCheckout();
      await user.click(screen.getByText('Place Order'));

      expect(mockNavigate).not.toHaveBeenCalled();
      alertSpy.mockRestore();
    });
  });

  describe('network error handling', () => {
    it('shows error?.message in alert when checkout throws', async () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      mockCheckout.mockRejectedValue(new Error('Network error. Please check your connection.'));
      const user = userEvent.setup();

      renderCheckout();
      await user.click(screen.getByText('Place Order'));

      expect(alertSpy).toHaveBeenCalledWith('Network error. Please check your connection.');
      alertSpy.mockRestore();
    });

    it('shows generic message when thrown error has no message', async () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      mockCheckout.mockRejectedValue({});
      const user = userEvent.setup();

      renderCheckout();
      await user.click(screen.getByText('Place Order'));

      expect(alertSpy).toHaveBeenCalledWith('Failed to place order');
      alertSpy.mockRestore();
    });
  });

  describe('successful checkout', () => {
    it('calls clearCart on success', async () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      mockCheckout.mockResolvedValue({ id: 100, status: 'pending' });
      const user = userEvent.setup();

      renderCheckout();
      await user.click(screen.getByText('Place Order'));

      expect(mockClearCart).toHaveBeenCalledOnce();
      alertSpy.mockRestore();
    });

    it('navigates to /products on success', async () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      mockCheckout.mockResolvedValue({ id: 100, status: 'pending' });
      const user = userEvent.setup();

      renderCheckout();
      await user.click(screen.getByText('Place Order'));

      expect(mockNavigate).toHaveBeenCalledWith('/products');
      alertSpy.mockRestore();
    });
  });
});
