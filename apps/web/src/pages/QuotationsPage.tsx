import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { StatusBadge } from '../components/StatusBadge';
import { currency, dateLabel } from '../lib/formatters';
import type { Quotation } from '../types';

export function QuotationsPage() {
  const { data: quotations = [] } = useQuery({
    queryKey: ['quotations'],
    queryFn: async () => (await api.get<Quotation[]>('/quotations')).data,
  });

  return (
    <section className="panel p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink">Quotations</h2>
          <p className="text-sm text-slate-500">Revision history, approval status, and project conversion from one list.</p>
        </div>
        <Link className="btn-primary" to="/quotations/new">Create quotation</Link>
      </div>
      <div className="space-y-4">
        {quotations.map((quotation) => (
          <Link key={quotation.id} to={`/quotations/${quotation.id}`} className="block rounded-3xl border border-slate-200 bg-slate-50/70 p-5 transition hover:border-moss/40 hover:bg-white">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-display text-xl font-bold text-ink">{quotation.quotationNumber}</p>
                <p className="mt-1 text-slate-500">{quotation.client.companyName} • {quotation.title}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={quotation.status} />
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500">{quotation.currentVersion?.versionLabel || 'v1'}</span>
                <span className="font-semibold text-ink">{currency(quotation.currentVersion?.grandTotal || 0)}</span>
                <span className="text-sm text-slate-500">Expires {dateLabel(quotation.expiryDate)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}