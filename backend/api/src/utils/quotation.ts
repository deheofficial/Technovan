import crypto from 'crypto';

export interface LineItemInput {
  serviceName: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface CalculatedLineItem extends LineItemInput {
  lineTotal: number;
}

export interface QuotationTotals {
  items: CalculatedLineItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;
}

export const roundCurrency = (value: number) => Number(value.toFixed(2));

export const parseAmount = (value: unknown, fallback = 0) => {
  const parsed = typeof value === 'string' || typeof value === 'number'
    ? Number(value)
    : fallback;

  return Number.isFinite(parsed) ? parsed : fallback;
};

export const calculateQuotationTotals = (
  items: LineItemInput[],
  discountAmount: number,
  sstRate: number,
): QuotationTotals => {
  const normalizedItems = items.map((item) => {
    const quantity = parseAmount(item.quantity, 0);
    const unitPrice = parseAmount(item.unitPrice, 0);
    const lineTotal = roundCurrency(quantity * unitPrice);

    return {
      ...item,
      quantity,
      unitPrice,
      lineTotal,
    };
  });

  const subtotal = roundCurrency(normalizedItems.reduce((total, item) => total + item.lineTotal, 0));
  const normalizedDiscount = roundCurrency(discountAmount);
  const taxableAmount = Math.max(subtotal - normalizedDiscount, 0);
  const taxAmount = roundCurrency(taxableAmount * sstRate);
  const grandTotal = roundCurrency(taxableAmount + taxAmount);

  return {
    items: normalizedItems,
    subtotal,
    discountAmount: normalizedDiscount,
    taxAmount,
    grandTotal,
  };
};

export const buildVersionLabel = (versionNumber: number) => `v${versionNumber}`;

export const buildQuotationNumber = (sequence: number, date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `QT-${year}${month}-${String(sequence).padStart(4, '0')}`;
};

export const buildProjectCode = (sequence: number, date = new Date()) => {
  const year = date.getFullYear();
  return `PRJ-${year}-${String(sequence).padStart(4, '0')}`;
};

export const createPortalToken = () => crypto.randomBytes(24).toString('hex');

export const formatCurrency = (value: number, currency = 'MYR') => {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value);
};