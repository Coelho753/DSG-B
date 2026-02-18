import { useMemo, useState } from 'react';
import { api } from '../services/api';

const formatBRL = (n) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(n || 0));

const mockShipping = (zipCode, finalPrice) => {
  const clean = String(zipCode || '').replace(/\D/g, '');
  if (clean.length < 8) return null;
  const price = Number(finalPrice || 0);
  const fee = price > 300 ? 0 : Math.max(9.9, price * 0.06);
  const days = price > 300 ? 3 : 6;
  return { fee: Number(fee.toFixed(2)), days };
};

export default function ProductCardExpandable({ product, onAddToCart }) {
  const [open, setOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [zip, setZip] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const shipping = useMemo(() => mockShipping(zip, product.finalPrice || product.precoFinal || product.preco), [zip, product]);

  const loadReviews = async () => {
    const { data } = await api.get(`/products/${product._id}/reviews`);
    setReviews(data);
  };

  const submitReview = async () => {
    await api.post(`/products/${product._id}/reviews`, { rating, comment });
    setComment('');
    await loadReviews();
  };

  return (
    <>
      <div onClick={() => { setOpen(true); loadReviews(); }} style={{ cursor: 'pointer', border: '1px solid #ddd', padding: 12 }}>
        <img src={product.imagens?.[0]} alt={product.nome} width={180} />
        <h4>{product.nome}</h4>
        <p>{formatBRL(product.finalPrice || product.precoFinal || product.preco)}</p>
      </div>

      {open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'grid', placeItems: 'center', zIndex: 999 }}>
          <div style={{ width: 'min(900px,95vw)', maxHeight: '90vh', overflow: 'auto', background: 'var(--bg,#fff)', color: 'var(--text,#111)', padding: 16 }}>
            <button onClick={() => setOpen(false)}>Fechar</button>
            <img src={product.imagens?.[0]} alt={product.nome} width={320} />
            <h2>{product.nome}</h2>
            <p>{product.descricaoDetalhada || product.descricao}</p>
            <p><b>Preço:</b> {formatBRL(product.finalPrice || product.precoFinal || product.preco)}</p>
            <p><b>Média:</b> {Number(product.avaliacaoMedia || 0).toFixed(1)} ⭐</p>

            <hr />
            <h3>Calcular frete</h3>
            <input value={zip} onChange={(e) => setZip(e.target.value)} placeholder="CEP" />
            {shipping && <p>Frete: {formatBRL(shipping.fee)} • Prazo estimado: {shipping.days} dias</p>}

            <button onClick={() => onAddToCart?.(product)}>Adicionar ao carrinho</button>

            <hr />
            <h3>Avaliações</h3>
            {reviews.map((r) => (
              <div key={r._id} style={{ borderBottom: '1px solid #eee', marginBottom: 8 }}>
                <p><b>{r.userId?.nome || 'Usuário'}</b> • {r.rating} ⭐</p>
                <p>{r.comment}</p>
              </div>
            ))}

            <h4>Avaliar produto</h4>
            <input type="number" min="1" max="5" value={rating} onChange={(e) => setRating(Number(e.target.value))} />
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Comentário" />
            <button onClick={submitReview}>Enviar avaliação</button>
          </div>
        </div>
      )}
    </>
  );
}
