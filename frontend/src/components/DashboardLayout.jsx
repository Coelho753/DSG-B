import { Link, Outlet } from 'react-router-dom';

export default function DashboardLayout() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: '100vh' }}>
      <aside style={{ borderRight: '1px solid #eee', padding: 16 }}>
        <h3>Admin</h3>
        <nav style={{ display: 'grid', gap: 8 }}>
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/products">Produtos</Link>
          <Link to="/admin/products/new">Publicar Produto</Link>
          <Link to="/admin/categories">Categorias</Link>
          <Link to="/admin/promotions">Promoções</Link>
          <Link to="/admin/settings">Configurações</Link>
        </nav>
      </aside>
      <main style={{ padding: 20 }}>
        <Outlet />
      </main>
    </div>
  );
}
