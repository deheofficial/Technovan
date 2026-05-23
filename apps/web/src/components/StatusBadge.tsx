import clsx from 'clsx';
import type { QuotationStatus } from '../types';

const toneMap: Record<QuotationStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  PENDING_APPROVAL: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  SENT: 'bg-sky-100 text-sky-700',
  ACCEPTED: 'bg-moss/15 text-moss',
  REJECTED: 'bg-rose-100 text-rose-700',
  EXPIRED: 'bg-stone-200 text-stone-700',
};

export function StatusBadge({ status }: { status: QuotationStatus }) {
  return (
    <span className={clsx('inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-wide', toneMap[status])}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}