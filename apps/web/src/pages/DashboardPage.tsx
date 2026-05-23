import { BarChart3, BriefcaseBusiness, CircleCheckBig, Clock4 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { currency } from '../lib/formatters';
import type { DashboardMetrics, Quotation } from '../types';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';

export function DashboardPage() {
  const { data: metrics } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => (await api.get<DashboardMetrics>('/dashboard/metrics')).data,
  });

  const { data: quotations = [] } = useQuery({
    queryKey: ['dashboard-quotations'],
    queryFn: async () => (await api.get<Quotation[]>('/quotations')).data,
  });

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total quotations" value={String(metrics?.totalQuotations ?? 0)} hint="All revisions and active opportunities" icon={<BarChart3 size={18} />} />
        <MetricCard label="Accepted" value={String(metrics?.acceptedQuotations ?? 0)} hint="Ready for delivery conversion" icon={<CircleCheckBig size={18} />} />
        <MetricCard label="Pending approvals" value={String(metrics?.pendingApprovals ?? 0)} hint="Waiting on manager gate" icon={<Clock4 size={18} />} />
        <MetricCard label="Revenue forecast" value={currency(metrics?.revenueForecast ?? 0)} hint="Approved, sent, and accepted pipeline" icon={<BriefcaseBusiness size={18} />} />
      </section>

      <section className="panel p-6">
        <div className="mb-6">
          <h2 className="font-display text-2xl font-bold text-ink">Recent quotations</h2>
          <p className="text-sm text-slate-500">Track the last movement across sales and approval workflow.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-3">Quote</th>
                <th className="pb-3">Client</th>
                <th className="pb-3">Version</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {quotations.slice(0, 6).map((quotation) => (
                <tr key={quotation.id} className="border-b border-slate-100">
                  <td className="py-4">
                    <p className="font-semibold text-ink">{quotation.quotationNumber}</p>
                    <p className="text-slate-500">{quotation.title}</p>
                  </td>
                  <td className="py-4 text-slate-600">{quotation.client.companyName}</td>
                  <td className="py-4 text-slate-600">{quotation.currentVersion?.versionLabel || 'v1'}</td>
                  <td className="py-4 font-medium text-ink">{currency(quotation.currentVersion?.grandTotal || 0)}</td>
                  <td className="py-4"><StatusBadge status={quotation.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}