const dayjs = require('dayjs');

const calculateFinalPrice = (product) => {
  const precoOriginal = Number(product.preco || 0);
  const promocao = product.promocao || {};

  const now = dayjs();
  const withinStart = !promocao.dataInicio || now.isAfter(dayjs(promocao.dataInicio)) || now.isSame(dayjs(promocao.dataInicio));
  const withinEnd = !promocao.dataFim || now.isBefore(dayjs(promocao.dataFim)) || now.isSame(dayjs(promocao.dataFim));

  const promocaoAtiva = Boolean(promocao.ativa && withinStart && withinEnd);

  let precoFinal = precoOriginal;
  let descontoPercentualCalculado = 0;

  if (promocaoAtiva) {
    if (promocao.tipo === 'percentual') {
      descontoPercentualCalculado = Number(promocao.valor || 0);
      precoFinal = precoOriginal - (precoOriginal * descontoPercentualCalculado) / 100;
    } else if (promocao.tipo === 'fixo') {
      precoFinal = Number(promocao.valor || precoOriginal);
      descontoPercentualCalculado = precoOriginal > 0 ? ((precoOriginal - precoFinal) / precoOriginal) * 100 : 0;
    }
  }

  if (precoFinal < 0) precoFinal = 0;

  return {
    precoOriginal,
    precoFinal: Number(precoFinal.toFixed(2)),
    descontoPercentualCalculado: Number(descontoPercentualCalculado.toFixed(2)),
    promocaoAtiva,
  };
};

module.exports = {
  calculateFinalPrice,
};
