import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const Cart = () => {
  const { cart, updateItem, removeItem, clearCart, loading, total } = useCart();
  const [localTotal] = useState(total); // BUG: Uses stale total that never updates
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>Please login to view your cart.</p>
        <Link to="/login" className="text-blue-600">Login</Link>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Cart</h1>
        <p>Your cart is empty.</p>
        <Link to="/products" className="text-blue-600">Go to Products</Link>
      </div>
    );
  }

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
      
      <div className="bg-white rounded-lg shadow p-4">
        {cart.items.map(item => (
          <div key={item.id} className="flex items-center border-b py-4">
            <img
              src={item.product.image}
              alt={item.product.name}
              className="w-20 h-20 object-cover rounded"
            />
            <div className="ml-4 flex-1">
              <h3 className="font-bold">{item.product.name}</h3>
              <p className="text-gray-600">${item.product.price}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateItem(item.id, item.quantity - 1)}
                className="px-2 py-1 bg-gray-200 rounded"
                disabled={loading}
              >
                -
              </button>
              <span>{item.quantity}</span>
              <button
                onClick={() => updateItem(item.id, item.quantity + 1)}
                className="px-2 py-1 bg-gray-200 rounded"
                disabled={loading}
              >
                +
              </button>
            </div>
            <div className="ml-4 text-right">
              <p className="font-bold">${(parseFloat(item.product.price) * item.quantity).toFixed(2)}</p>
              <button
                onClick={() => removeItem(item.id)}
                className="text-red-600 text-sm"
                disabled={loading}
              >
                Remove
              </button>
            </div>
          </div>
        ))}

        <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between text-xl font-bold">
              <span>Total:</span>
              <span>${localTotal.toFixed(2)}</span>
            </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => clearCart()}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              disabled={loading}
            >
              Clear Cart
            </button>
            <button
              onClick={handleCheckout}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};