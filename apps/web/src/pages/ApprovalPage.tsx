import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { StatusBadge } from '../components/StatusBadge';
import type { Quotation } from '../types';

export function ApprovalPage() {
  const queryClient = useQueryClient();
  const { data: quotations = [] } = useQuery({
    queryKey: ['pending-approvals'],
    queryFn: async () => (await api.get<Quotation[]>('/quotations?status=PENDING_APPROVAL')).data,
  });

  const approve = useMutation({
    mutationFn: async (quotationId: string) => api.post(`/quotations/${quotationId}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
  });

  return (
    <section className="panel p-6">
      <h2 className="font-display text-2xl font-bold text-ink">Manager approval queue</h2>
      <div className="mt-6 space-y-4">
        {quotations.map((quotation) => (
          <article key={quotation.id} className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-display text-xl font-bold text-ink">{quotation.quotationNumber}</p>
                <p className="text-sm text-slate-500">{quotation.client.companyName} • {quotation.owner.fullName}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={quotation.status} />
                <button className="btn-primary" onClick={() => approve.mutate(quotation.id)}>Approve</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}