import { useEffect, useState } from 'react';
import { z } from 'zod';
import { api } from '../services/api';
import { useToast } from '../hooks/useToast';

const schema = z.object({
  title: z.string().min(2),
  discountPercentage: z.number().min(1).max(100),
  productId: z.string().min(24),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
});

const initial = { title: '', discountPercentage: '', productId: '', startDate: '', endDate: '', active: true };

export default function PromotionsPage() {
  const toast = useToast();
  const [form, setForm] = useState(initial);
  const [items, setItems] = useState([]);

  const load = async () => {
    try {
      const { data } = await api.get('/promotions');
      setItems(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao carregar promoções');
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (event) => {
    event.preventDefault();

    const payload = {
      ...form,
      discountPercentage: Number(form.discountPercentage),
    };

    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || 'Dados inválidos');
      return;
    }

    try {
      await api.post('/promotions', payload);
      toast.success('Promoção criada');
      setForm(initial);
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao criar promoção');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Remover promoção?')) return;
    try {
      await api.delete(`/promotions/${id}`);
      toast.success('Promoção removida');
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao remover promoção');
    }
  };

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <h2>Promoções</h2>
      <form onSubmit={submit} style={{ display: 'grid', gap: 8, maxWidth: 520 }}>
        <input placeholder="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <input type="number" min="1" max="100" step="1" placeholder="Desconto (%)" value={form.discountPercentage} onChange={(e) => setForm({ ...form, discountPercentage: e.target.value })} required />
        <input placeholder="ID do produto" value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })} required />
        <input type="datetime-local" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
        <input type="datetime-local" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
        <button type="submit">Criar promoção</button>
      </form>

      {items.map((item) => (
        <div key={item._id} style={{ border: '1px solid #ddd', padding: 8 }}>
          <strong>{item.title}</strong> • {item.discountPercentage}%
          <button type="button" onClick={() => remove(item._id)} style={{ marginLeft: 8 }}>Excluir</button>
        </div>
      ))}
    </div>
  );
}
