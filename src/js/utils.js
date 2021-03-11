export function formatAmount(value) {
  return Number(value).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}
