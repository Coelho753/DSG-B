export function formatCurrency(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return 'R$ 0,00';
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}
