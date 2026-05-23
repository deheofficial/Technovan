import type { ReactNode } from 'react';

export function MetricCard({ label, value, hint, icon }: { label: string; value: string; hint: string; icon: ReactNode }) {
  return (
    <div className="panel p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-2xl bg-sand p-3 text-ink">{icon}</div>
        <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Live</span>
      </div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold text-ink">{value}</p>
      <p className="mt-3 text-sm text-slate-500">{hint}</p>
    </div>
  );
}