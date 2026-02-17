import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function ProductsPage() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [categoria, setCategoria] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('maisRecentes');

  const load = async () => {
    const { data } = await api.get('/products', { params: { search: q, categoryId: categoria, status, sort } });
    setItems(data.products || []);
  };

  useEffect(() => { load(); }, []);

  const toggleStatus = async (item) => {
    await api.put(`/products/${item._id}`, { ativo: !item.ativo });
    load();
  };

  return (
    <div>
      <h2>Gerenciar Produtos</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input placeholder="Buscar por nome" value={q} onChange={(e) => setQ(e.target.value)} />
        <input placeholder="Categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)} />
        <select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Todos</option><option value="ativo">Ativo</option><option value="inativo">Inativo</option></select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}><option value="precoAsc">Preço ↑</option><option value="precoDesc">Preço ↓</option><option value="maisRecentes">Recentes</option></select>
        <button onClick={load}>Filtrar</button>
      </div>
      <table width="100%" border="1" cellPadding="6">
        <thead><tr><th>Nome</th><th>Preço</th><th>Status</th><th>Estoque</th><th>Ações</th></tr></thead>
        <tbody>
          {items.map((p) => (
            <tr key={p._id}>
              <td>{p.nome}</td><td>{p.precoFinal}</td><td>{p.ativo ? 'Ativo' : 'Inativo'}</td>
              <td style={{ color: p.estoqueBaixo ? 'red' : 'inherit' }}>{p.estoque}</td>
              <td>
                <button onClick={() => toggleStatus(p)}>Toggle</button>
                <button onClick={() => api.delete(`/products/${p._id}`).then(load)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
