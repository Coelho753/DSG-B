import { useMemo, useState } from 'react';
import { api } from '../services/api';
import { useToast } from '../hooks/useToast';

const initial = {
  nome: '',
  descricao: '',
  descricaoDetalhada: '',
  preco: 0,
  precoPromocional: '',
  categoria: '',
  subcategoria: '',
  estoque: 0,
  sku: '',
  marca: '',
  peso: '',
  dimensoes: { largura: '', altura: '', comprimento: '' },
  ativo: true,
  destaque: false,
  variacoes: [{ nome: 'cor', opcoes: [''] }],
};

export default function ProductFormPage() {
  const toast = useToast();
  const [form, setForm] = useState(initial);
  const [files, setFiles] = useState([]);
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, typeof v === 'object' ? JSON.stringify(v) : v));
    files.forEach((f) => data.append('imagens', f));

    try {
      await api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Produto publicado com sucesso');
      setForm(initial);
      setFiles([]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao publicar produto');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, maxWidth: 900 }}>
      <h2>Publicar Produto</h2>
      <input placeholder="Nome do produto" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
      <input placeholder="Descrição curta" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} required />
      <textarea placeholder="Descrição detalhada (rich text html)" value={form.descricaoDetalhada} onChange={(e) => setForm({ ...form, descricaoDetalhada: e.target.value })} />
      <input type="number" step="0.01" placeholder="Preço normal" value={form.preco} onChange={(e) => setForm({ ...form, preco: Number(e.target.value) })} required />
      <input type="number" step="0.01" placeholder="Preço promocional" value={form.precoPromocional} onChange={(e) => setForm({ ...form, precoPromocional: e.target.value })} />
      <input placeholder="Categoria (id)" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} required />
      <input placeholder="Subcategoria (id)" value={form.subcategoria} onChange={(e) => setForm({ ...form, subcategoria: e.target.value })} />
      <input type="number" placeholder="Estoque" value={form.estoque} onChange={(e) => setForm({ ...form, estoque: Number(e.target.value) })} required />
      <input placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
      <input placeholder="Marca" value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} />
      <label><input type="checkbox" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} /> Ativo</label>
      <label><input type="checkbox" checked={form.destaque} onChange={(e) => setForm({ ...form, destaque: e.target.checked })} /> Destaque</label>
      <input multiple type="file" accept="image/*" onChange={(e) => setFiles([...e.target.files])} />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {previews.map((src) => <img key={src} src={src} alt="preview" width={100} />)}
      </div>
      <button type="submit">Salvar</button>
    </form>
  );
}
