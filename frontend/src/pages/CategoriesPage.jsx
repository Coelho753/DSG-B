import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useToast } from '../hooks/useToast';

export default function CategoriesPage() {
  const toast = useToast();
  const [name, setName] = useState('');
  const [categories, setCategories] = useState([]);

  const load = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao carregar categorias');
    }
  };

  useEffect(() => { load(); }, []);

  const create = async (event) => {
    event.preventDefault();
    if (!name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    try {
      await api.post('/categories', { name });
      setName('');
      toast.success('Categoria criada');
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao criar categoria');
    }
  };

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <h2>Categorias</h2>
      <form onSubmit={create} style={{ display: 'flex', gap: 8 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome da categoria" required />
        <button type="submit">Criar</button>
      </form>

      <select style={{ color: '#111', background: '#fff' }}>
        <option value="">Selecione uma categoria</option>
        {categories.map((category) => (
          <option key={category._id} value={category._id}>{category.name}</option>
        ))}
      </select>

      <ul>
        {categories.map((category) => (
          <li key={category._id} style={{ color: '#111' }}>{category.name}</li>
        ))}
      </ul>
    </div>
  );
}
