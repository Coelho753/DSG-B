const WHATSAPP_NUMBER = '+5511965474023';

const toMoney = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(2) : '0.00';
};

const generateWhatsAppLink = (order) => {
  const produtosTxt = (order.produtos || [])
    .map((item) => `${item.nome || item.product?.nome || 'Produto'} ${item.quantidade || 0}x Subtotal: R$ ${toMoney(item.subtotal)}`)
    .join('\n');

  const endereco = order.enderecoEntrega || {};
  const enderecoTxt = `${endereco.rua || ''} ${endereco.numero || ''} ${endereco.complemento || ''} ${endereco.bairro || ''} ${endereco.cidade || ''} - ${endereco.estado || ''} ${endereco.cep || ''}`.trim();

  const message = `Olá, gostaria de finalizar a compra:\nProdutos:\n${produtosTxt}\nTotal: R$ ${toMoney(order.valorTotal)}\nEndereço: ${enderecoTxt}`;

  return `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
};

module.exports = {
  generateWhatsAppLink,
};
