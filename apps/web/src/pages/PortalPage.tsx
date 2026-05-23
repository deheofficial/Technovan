import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import api from '../lib/api';
import { currency } from '../lib/formatters';
import type { Quotation } from '../types';

export function PortalPage() {
  const { token = '' } = useParams();
  const queryClient = useQueryClient();
  const { data: quotation } = useQuery({
    queryKey: ['portal-quotation', token],
    queryFn: async () => (await api.get<Quotation>(`/quotations/portal/${token}`)).data,
  });

  const respond = useMutation({
    mutationFn: async (decision: 'accept' | 'reject') => api.post(`/quotations/portal/${token}/respond`, { decision }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portal-quotation', token] }),
  });

  if (!quotation) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Loading quotation...</div>;
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl items-center px-4 py-10">
      <div className="panel w-full p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Client portal</p>
        <h1 className="mt-4 font-display text-4xl font-bold text-ink">{quotation.quotationNumber}</h1>
        <p className="mt-2 text-slate-500">{quotation.client.companyName} • {quotation.title}</p>
        <div className="mt-8 space-y-4">
          {quotation.currentVersion?.items.map((item) => (
            <div key={`${item.serviceName}-${item.description}`} className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-ink">{item.serviceName}</p>
                  <p className="text-sm text-slate-500">{item.description}</p>
                </div>
                <p className="font-semibold text-ink">{currency(item.lineTotal || item.quantity * item.unitPrice)}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6 font-display text-2xl font-bold text-ink">
          <span>Total</span>
          <span>{currency(quotation.currentVersion?.grandTotal || 0)}</span>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <button className="btn-primary" onClick={() => respond.mutate('accept')}>Accept quotation</button>
          <button className="btn-secondary" onClick={() => respond.mutate('reject')}>Reject quotation</button>
        </div>
      </div>
    </div>
  );
}