import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function AdminDashboardPage() {
  const [m, setM] = useState(null);
  useEffect(() => { api.get('/dashboard/metrics').then(({ data }) => setM(data)); }, []);
  if (!m) return <p>Carregando...</p>;
  return (
    <div>
      <h2>Métricas</h2>
      <p>Total de produtos: {m.totalProdutos}</p>
      <p>Produtos ativos: {m.produtosAtivos}</p>
      <p>Produtos com estoque baixo: {m.produtosEstoqueBaixo}</p>
      <p>Vendas do mês: {m.vendasMes}</p>
    </div>
  );
}
