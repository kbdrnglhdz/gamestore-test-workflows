import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
  category: string;
}

export const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('');
  const { addItem } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    loadProducts();
  }, [page, category, sort]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 10 };
      if (category) params.category = category;
      if (sort) params.sort = sort;
      
      const data = await api.products.getAll(params);
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Failed to load products', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: number) => {
    if (!user) {
      alert('Please login to add items to cart');
      return;
    }
    await addItem(productId);
    alert('Added to cart!');
  };

  const categories = ['Adventure', 'Action', 'RPG', 'Shooter', 'Sports', 'Fighting', 'Simulation', 'Strategy', 'Racing', 'Puzzle', 'Platformer', 'Horror'];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Products</h1>
      
      <div className="flex gap-4 mb-6">
        <select
          value={category}
          onChange={e => { setCategory(e.target.value); setPage(1); }}
          className="border p-2 rounded"
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        
        <select
          value={sort}
          onChange={e => { setSort(e.target.value); setPage(1); }}
          className="border p-2 rounded"
        >
          <option value="">Sort By</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <div key={product.id} className="border rounded-lg overflow-hidden shadow-lg">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-bold text-lg">{product.name}</h3>
                  <p className="text-gray-600 text-sm">{product.description}</p>
                  <p className="text-blue-600 font-bold mt-2">${product.price}</p>
                  <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                  <button
                    onClick={() => handleAddToCart(product.id)}
                    className="mt-2 w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-4 py-2 rounded ${page === p ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};