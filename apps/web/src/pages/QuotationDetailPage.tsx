import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, ExternalLink, FolderKanban, Send, ShieldCheck } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { StatusBadge } from '../components/StatusBadge';
import api from '../lib/api';
import { currency, dateLabel } from '../lib/formatters';
import type { Quotation } from '../types';

export function QuotationDetailPage() {
  const { quotationId = '' } = useParams();
  const queryClient = useQueryClient();

  const { data: quotation } = useQuery({
    queryKey: ['quotation', quotationId],
    queryFn: async () => (await api.get<Quotation>(`/quotations/${quotationId}`)).data,
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['quotation', quotationId] });
    await queryClient.invalidateQueries({ queryKey: ['quotations'] });
    await queryClient.invalidateQueries({ queryKey: ['dashboard-quotations'] });
  };

  const submitApproval = useMutation({ mutationFn: async () => api.post(`/quotations/${quotationId}/submit-approval`), onSuccess: invalidate });
  const approve = useMutation({ mutationFn: async () => api.post(`/quotations/${quotationId}/approve`), onSuccess: invalidate });
  const send = useMutation({ mutationFn: async () => api.post(`/quotations/${quotationId}/send`), onSuccess: invalidate });
  const convert = useMutation({ mutationFn: async () => api.post(`/quotations/${quotationId}/convert-project`), onSuccess: invalidate });

  if (!quotation) {
    return <div className="panel p-6 text-sm text-slate-500">Loading quotation...</div>;
  }

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display text-3xl font-bold text-ink">{quotation.quotationNumber}</h2>
              <StatusBadge status={quotation.status} />
            </div>
            <p className="mt-3 text-slate-500">{quotation.title} • {quotation.client.companyName}</p>
            <p className="mt-2 text-sm text-slate-500">Expires {dateLabel(quotation.expiryDate)} • {quotation.currentVersion?.versionLabel}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="btn-secondary gap-2" onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/quotations/${quotation.id}/pdf`, '_blank')}><Download size={16} /> PDF</button>
            <button className="btn-secondary gap-2" onClick={() => submitApproval.mutate()}><ShieldCheck size={16} /> Submit</button>
            <button className="btn-secondary gap-2" onClick={() => approve.mutate()}><ShieldCheck size={16} /> Approve</button>
            <button className="btn-secondary gap-2" onClick={() => send.mutate()}><Send size={16} /> Send</button>
            <button className="btn-primary gap-2" onClick={() => convert.mutate()}><FolderKanban size={16} /> Convert</button>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="panel p-6">
          <h3 className="font-display text-2xl font-bold text-ink">Current version</h3>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-3">Service</th>
                  <th className="pb-3">Qty</th>
                  <th className="pb-3">Unit</th>
                  <th className="pb-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {quotation.currentVersion?.items.map((item) => (
                  <tr key={`${item.serviceName}-${item.description}`} className="border-b border-slate-100">
                    <td className="py-4">
                      <p className="font-semibold text-ink">{item.serviceName}</p>
                      <p className="text-slate-500">{item.description}</p>
                    </td>
                    <td className="py-4 text-slate-600">{item.quantity}</td>
                    <td className="py-4 text-slate-600">{currency(item.unitPrice)}</td>
                    <td className="py-4 font-medium text-ink">{currency(item.lineTotal || item.quantity * item.unitPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Internal notes</p>
              <p className="mt-2 text-sm text-slate-700">{quotation.internalNotes || 'No internal notes'}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Terms</p>
              <p className="mt-2 text-sm text-slate-700">{quotation.termsAndConditions || 'No terms provided'}</p>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="panel p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Totals</p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between text-slate-500"><span>Subtotal</span><span>{currency(quotation.currentVersion?.subtotal || 0)}</span></div>
              <div className="flex items-center justify-between text-slate-500"><span>Discount</span><span>{currency(quotation.currentVersion?.discountAmount || 0)}</span></div>
              <div className="flex items-center justify-between text-slate-500"><span>SST</span><span>{currency(quotation.currentVersion?.taxAmount || 0)}</span></div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-3 font-display text-lg font-bold text-ink"><span>Total</span><span>{currency(quotation.currentVersion?.grandTotal || 0)}</span></div>
            </div>
          </section>
          <section className="panel p-6">
            <div className="flex items-center justify-between">
              <p className="font-display text-xl font-bold text-ink">Client portal</p>
              <Link className="text-sm font-semibold text-moss" to={`/portal/${quotation.publicToken}`}><ExternalLink size={16} /></Link>
            </div>
            <p className="mt-3 break-all text-sm text-slate-500">/portal/{quotation.publicToken}</p>
          </section>
          <section className="panel p-6">
            <p className="font-display text-xl font-bold text-ink">Audit log</p>
            <div className="mt-4 space-y-4">
              {quotation.auditLogs.slice(0, 6).map((entry) => (
                <div key={entry.id} className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-ink">{entry.message}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{entry.action}</p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}