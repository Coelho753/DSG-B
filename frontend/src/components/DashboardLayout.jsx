import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const submitSearch = (event) => {
    event.preventDefault();
    navigate(`/admin/products?q=${encodeURIComponent(search)}`);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: '100vh' }}>
      <aside style={{ borderRight: '1px solid #eee', padding: 16 }}>
        <h3>Admin</h3>
        <form onSubmit={submitSearch} style={{ marginBottom: 12 }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar produtos" />
        </form>
        <nav style={{ display: 'grid', gap: 8 }}>
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/products">Produtos</Link>
          <Link to="/admin/products/new">Publicar Produto</Link>
          <Link to="/admin/categories">Categorias</Link>
          <Link to="/admin/promotions">Promoções</Link>
          <Link to="/admin/settings">Configurações</Link>
          <Link to="/cart">Carrinho</Link>
        </nav>
      </aside>
      <main style={{ padding: 20 }}>
        <Outlet />
      </main>
    </div>
  );
}
