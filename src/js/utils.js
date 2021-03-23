export function formatAmount(value) {
  return Math.round(Number(value)).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}
