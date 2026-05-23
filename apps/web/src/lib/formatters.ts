export const currency = (value: number, code = 'MYR') => {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: code,
  }).format(value || 0);
};

export const dateLabel = (value?: string | null) => {
  if (!value) return 'Not set';
  return new Date(value).toLocaleDateString();
};