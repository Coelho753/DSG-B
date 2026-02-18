import { useCart } from '../hooks/useCart';
import { api } from '../services/api';

export default function CartPage() {
  const { cart, update, remove, clear } = useCart();

  const checkout = async () => {
    await api.post('/orders/checkout');
    await clear();
    window.alert('Pagamento concluído!');
  };

  return (
    <div>
      <h2>Carrinho</h2>
      {cart.items?.map((item) => (
        <div key={item.productId?._id || item.productId} style={{ borderBottom: '1px solid #eee', padding: 8 }}>
          <strong>{item.productId?.nome || item.productId}</strong>
          <p>Unitário: R$ {Number(item.unitPrice || 0).toFixed(2)}</p>
          <input type="number" min="1" value={item.quantity} onChange={(e) => update(item.productId?._id || item.productId, Number(e.target.value))} />
          <button onClick={() => remove(item.productId?._id || item.productId)}>Remover</button>
        </div>
      ))}

      <h3>Subtotal: R$ {Number(cart.subtotal || 0).toFixed(2)}</h3>
      <h3>Total: R$ {Number(cart.total || 0).toFixed(2)}</h3>
      <button onClick={checkout}>Finalizar pagamento</button>
      <button onClick={clear}>Limpar carrinho</button>
    </div>
  );
}
