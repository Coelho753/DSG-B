import { useCart } from '../hooks/useCart';
import { api } from '../services/api';
import { useToast } from '../hooks/useToast';
import { formatCurrency } from '../utils/formatCurrency';

export default function CartPage() {
  const toast = useToast();
  const { cart, update, remove, clear } = useCart();

  const checkout = async () => {
    try {
      await api.post('/orders/checkout');
      await clear();
      toast.success('Pagamento concluído!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao finalizar pagamento');
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      await update(productId, quantity);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar quantidade');
    }
  };

  const removeItem = async (productId) => {
    try {
      await remove(productId);
      toast.success('Item removido');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao remover item');
    }
  };

  return (
    <div>
      <h2>Carrinho</h2>
      {cart.items?.map((item) => {
        const productId = item.productId?._id || item.productId;
        return (
          <div key={productId} style={{ borderBottom: '1px solid #eee', padding: 8 }}>
            <strong>{item.productId?.nome || item.productId}</strong>
            <p>Unitário: {formatCurrency(Number(item.unitPrice || 0))}</p>
            <input type="number" min="1" step="1" value={item.quantity} onChange={(e) => updateQuantity(productId, Number(e.target.value))} />
            <button type="button" onClick={() => removeItem(productId)}>Remover</button>
          </div>
        );
      })}

      <h3>Subtotal: {formatCurrency(Number(cart.subtotal || 0))}</h3>
      <h3>Total: {formatCurrency(Number(cart.total || 0))}</h3>
      <button type="button" onClick={checkout}>Finalizar pagamento</button>
      <button type="button" onClick={clear}>Limpar carrinho</button>
    </div>
  );
}
