import { useEffect, useState } from 'react';
import { api } from '../services/api';

export function useCart() {
  const [cart, setCart] = useState({ items: [], subtotal: 0, total: 0 });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/cart');
      setCart(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const add = async (productId, quantity = 1) => {
    const { data } = await api.post('/cart/add', { productId, quantity });
    setCart(data);
    return data;
  };

  const update = async (productId, quantity) => {
    const { data } = await api.put('/cart/update', { productId, quantity });
    setCart(data);
    return data;
  };

  const remove = async (productId) => {
    const { data } = await api.delete('/cart/remove', { data: { productId } });
    setCart(data);
    return data;
  };

  const clear = async () => {
    const { data } = await api.delete('/cart/clear');
    setCart(data);
    return data;
  };

  useEffect(() => { load(); }, []);

  return { cart, loading, load, add, update, remove, clear };
}
