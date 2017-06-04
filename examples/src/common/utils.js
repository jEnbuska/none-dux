export const weekdayAbb= [ 'MA', 'TI', 'KE', 'TO', 'PE', ];
export function range({ from = 0, to, }) {
  const acc = [];
  for (let i= from; i <to; i++) {
    acc.push(i);
  }
  return acc;
}
