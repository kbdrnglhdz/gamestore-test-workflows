import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">GameStore</Link>
        <div className="flex items-center gap-4">
          <Link to="/products" className="hover:text-gray-300">Products</Link>
          {user ? (
            <>
              <Link to="/cart" className="hover:text-gray-300">
                Cart ({itemCount})
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="hover:text-gray-300">Admin</Link>
              )}
              <span className="text-gray-400">Hi, {user.name}</span>
              <button onClick={async () => { if (window.confirm('Are you sure you want to logout?')) await logout(); }} className="text-red-400 hover:text-red-300">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-gray-300">Login</Link>
              <Link to="/register" className="hover:text-gray-300">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};