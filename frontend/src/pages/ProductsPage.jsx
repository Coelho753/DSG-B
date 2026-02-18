import { useEffect, useState } from 'react';
import { api } from '../services/api';
import ProductCardExpandable from '../components/ProductCardExpandable';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import { formatCurrency } from '../utils/formatCurrency';

export default function ProductsPage() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [categoria, setCategoria] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('maisRecentes');
  const { add, cart } = useCart();

  const load = async (searchText = q) => {
    try {
      const { data } = await api.get('/products', { params: { search: searchText, categoryId: categoria, status, sort } });
      setItems(data.products || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao carregar produtos');
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      load(q);
    }, 300);

    return () => clearTimeout(timer);
  }, [q, categoria, status, sort]);

  const toggleStatus = async (item) => {
    try {
      await api.put(`/products/${item._id}`, { ativo: !item.ativo });
      toast.success('Status atualizado');
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar status');
    }
  };

  const removeProduct = async (id) => {
    if (!window.confirm('Deseja excluir este produto?')) return;

    try {
      await api.delete(`/products/${id}`);
      toast.success('Produto excluído');
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao excluir produto');
    }
  };

  return (
    <div>
      <h2>Gerenciar Produtos</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input placeholder="Buscar por nome, descrição ou categoria" value={q} onChange={(e) => setQ(e.target.value)} />
        <input placeholder="Categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)} />
        <select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Todos</option><option value="ativo">Ativo</option><option value="inativo">Inativo</option></select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}><option value="precoAsc">Preço ↑</option><option value="precoDesc">Preço ↓</option><option value="maisRecentes">Recentes</option></select>
      </div>
      <div style={{ marginBottom: 8 }}>Itens no carrinho: {cart.items?.reduce((acc, item) => acc + item.quantity, 0) || 0}</div>
      <table width="100%" border="1" cellPadding="6">
        <thead><tr><th>Nome</th><th>Preço</th><th>Status</th><th>Estoque</th><th>Ações</th></tr></thead>
        <tbody>
          {items.map((product) => (
            <tr key={product._id}>
              <td><ProductCardExpandable product={product} onAddToCart={(prod) => add(prod._id, 1)} /></td>
              <td>{formatCurrency(Number(product.finalPrice ?? product.precoFinal ?? product.preco ?? 0))}</td>
              <td>{product.ativo ? 'Ativo' : 'Inativo'}</td>
              <td style={{ color: product.estoqueBaixo ? 'red' : 'inherit' }}>{product.estoque}</td>
              <td>
                <button type="button" onClick={() => toggleStatus(product)}>Toggle</button>
                <button type="button" onClick={() => removeProduct(product._id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
