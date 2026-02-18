import { useMemo, useState } from 'react';
import { api } from '../services/api';
import { formatCurrency } from '../utils/formatCurrency';
import { useToast } from '../hooks/useToast';

const FALLBACK_IMAGE = 'https://via.placeholder.com/400x300?text=Sem+Imagem';

const mockShipping = (zipCode, finalPrice) => {
  const clean = String(zipCode || '').replace(/\D/g, '');
  if (clean.length < 8) return null;
  const price = Number(finalPrice || 0);
  const fee = price > 300 ? 0 : Math.max(9.9, price * 0.06);
  const days = price > 300 ? 3 : 6;
  return { fee: Math.round(fee * 100) / 100, days };
};

export default function ProductCardExpandable({ product, onAddToCart }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [zip, setZip] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [imageError, setImageError] = useState(false);

  const currentPrice = Number(product.finalPrice ?? product.precoFinal ?? product.preco ?? product.price ?? 0);
  const imageSrc = imageError ? FALLBACK_IMAGE : (product.imageUrl || product.imagens?.[0] || FALLBACK_IMAGE);
  const shipping = useMemo(() => mockShipping(zip, currentPrice), [zip, currentPrice]);

  const loadReviews = async () => {
    try {
      const { data } = await api.get(`/products/${product._id}/reviews`);
      setReviews(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao carregar avaliações');
    }
  };

  const submitReview = async () => {
    try {
      await api.post(`/products/${product._id}/reviews`, { rating, comment });
      setComment('');
      toast.success('Avaliação enviada');
      await loadReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao enviar avaliação');
    }
  };

  const handleAddToCart = async () => {
    try {
      await onAddToCart?.(product);
      toast.success('Produto adicionado ao carrinho');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao adicionar ao carrinho');
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          loadReviews();
        }}
        style={{ cursor: 'pointer', border: '1px solid #ddd', padding: 12, width: '100%', textAlign: 'left', background: 'transparent' }}
      >
        <img
          src={imageSrc}
          onError={() => setImageError(true)}
          alt={product.nome}
          width={220}
          height={160}
          style={{ objectFit: 'cover', borderRadius: 8 }}
        />
        <h4>{product.nome}</h4>
        <p>{formatCurrency(currentPrice)}</p>
      </button>

      {open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'grid', placeItems: 'center', zIndex: 999 }}>
          <div style={{ width: 'min(900px,95vw)', maxHeight: '90vh', overflow: 'auto', background: 'var(--bg,#fff)', color: 'var(--text,#111)', padding: 16 }}>
            <button type="button" onClick={() => setOpen(false)}>Fechar</button>
            <img src={imageSrc} alt={product.nome} width={320} height={240} style={{ objectFit: 'cover' }} onError={() => setImageError(true)} />
            <h2>{product.nome}</h2>
            <p>{product.descricaoDetalhada || product.descricao}</p>
            <p><b>Preço:</b> {formatCurrency(currentPrice)}</p>
            <p><b>Média:</b> {Math.round(Number(product.avaliacaoMedia || 0) * 10) / 10} ⭐</p>

            <hr />
            <h3>Calcular frete</h3>
            <input value={zip} onChange={(e) => setZip(e.target.value)} placeholder="CEP" />
            {shipping && <p>Frete: {formatCurrency(shipping.fee)} • Prazo estimado: {shipping.days} dias</p>}

            <button type="button" onClick={handleAddToCart}>Adicionar ao carrinho</button>

            <hr />
            <h3>Avaliações</h3>
            {reviews.map((review) => (
              <div key={review._id} style={{ borderBottom: '1px solid #eee', marginBottom: 8 }}>
                <p><b>{review.userId?.nome || 'Usuário'}</b> • {review.rating} ⭐</p>
                <p>{review.comment}</p>
              </div>
            ))}

            <h4>Avaliar produto</h4>
            <input type="number" min="1" max="5" value={rating} onChange={(e) => setRating(Number(e.target.value))} />
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Comentário" />
            <button type="button" onClick={submitReview}>Enviar avaliação</button>
          </div>
        </div>
      )}
    </>
  );
}
