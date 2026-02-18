import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { useToast } from '../hooks/useToast';

const initial = {
  nome: '',
  descricao: '',
  descricaoDetalhada: '',
  preco: '',
  cost: '',
  estoque: '',
  categoria: '',
  imageUrl: '',
  ativo: true,
};

export default function ProductFormPage() {
  const toast = useToast();
  const [form, setForm] = useState(initial);
  const [files, setFiles] = useState([]);
  const [categories, setCategories] = useState([]);

  const localPreviews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Erro ao carregar categorias');
      }
    };

    loadCategories();
  }, [toast]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.imageUrl && files.length === 0) {
      toast.error('Informe imageUrl ou envie uma foto');
      return;
    }

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    files.forEach((file) => data.append('imagens', file));

    try {
      await api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Produto publicado com sucesso');
      setForm(initial);
      setFiles([]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao publicar produto');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, maxWidth: 900 }}>
      <h2>Publicar Produto</h2>
      <input placeholder="Nome do produto" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
      <input placeholder="Descrição curta" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} required />
      <textarea placeholder="Descrição detalhada" value={form.descricaoDetalhada} onChange={(e) => setForm({ ...form, descricaoDetalhada: e.target.value })} />

      <input type="number" step="0.01" min="0" placeholder="Preço normal" value={form.preco} onChange={(e) => setForm({ ...form, preco: e.target.value })} required />
      <input type="number" step="0.01" min="0" placeholder="Custo" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} required />
      <input type="number" step="1" min="0" placeholder="Estoque" value={form.estoque} onChange={(e) => setForm({ ...form, estoque: e.target.value })} required />

      <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} required style={{ color: '#111', background: '#fff' }}>
        <option value="">Selecione a categoria</option>
        {categories.map((category) => (
          <option key={category._id} value={category._id}>{category.name || category.nome}</option>
        ))}
      </select>

      <input placeholder="URL da imagem" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
      <input multiple type="file" accept="image/*" onChange={(e) => setFiles([...(e.target.files || [])])} />

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {form.imageUrl && <img src={form.imageUrl} alt="preview-url" width={100} height={100} style={{ objectFit: 'cover' }} />}
        {localPreviews.map((preview) => <img key={preview} src={preview} alt="preview-upload" width={100} height={100} style={{ objectFit: 'cover' }} />)}
      </div>

      <label><input type="checkbox" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} /> Ativo</label>
      <button type="submit">Salvar</button>
    </form>
  );
}
