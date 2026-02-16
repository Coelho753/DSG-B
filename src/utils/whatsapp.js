const WHATSAPP_NUMBER = '+5511965474023';

const generateWhatsAppLink = (order) => {
  const produtosTxt = order.produtos
    .map((item) => `${item.nome || item.product?.nome || 'Produto'} ${item.quantidade}x Subtotal: R$ ${item.subtotal.toFixed(2)}`)
    .join('\n');

  const endereco = order.enderecoEntrega || {};
  const enderecoTxt = `${endereco.rua || ''} ${endereco.numero || ''} ${endereco.complemento || ''} ${endereco.bairro || ''} ${endereco.cidade || ''} - ${endereco.estado || ''} ${endereco.cep || ''}`.trim();

  const message = `Olá, gostaria de finalizar a compra:\nProdutos:\n${produtosTxt}\nTotal: R$ ${order.valorTotal.toFixed(2)}\nEndereço: ${enderecoTxt}`;

  return `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
};

module.exports = {
  generateWhatsAppLink,
};
