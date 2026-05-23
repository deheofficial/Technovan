import { Plus, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { currency } from '../lib/formatters';
import type { QuotationFormValues, QuotationItem, Template } from '../types';

interface QuotationBuilderProps {
  values: QuotationFormValues;
  clients: Array<{ id: string; companyName: string }>;
  templates: Template[];
  onChange: (values: QuotationFormValues) => void;
  onSubmit: () => void;
  submitLabel: string;
  busy?: boolean;
}

const blankItem = (): QuotationItem => ({
  serviceName: '',
  description: '',
  quantity: 1,
  unitPrice: 0,
});

export function QuotationBuilder({ values, clients, templates, onChange, onSubmit, submitLabel, busy }: QuotationBuilderProps) {
  const totals = useMemo(() => {
    const subtotal = values.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const taxable = Math.max(subtotal - values.discountAmount, 0);
    const taxAmount = taxable * values.sstRate;
    return {
      subtotal,
      taxAmount,
      grandTotal: taxable + taxAmount,
    };
  }, [values.discountAmount, values.items, values.sstRate]);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="panel p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-600">
            Client
            <select className="field" value={values.clientId} onChange={(event) => onChange({ ...values, clientId: event.target.value })}>
              <option value="">Select client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>{client.companyName}</option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm text-slate-600">
            Template
            <select
              className="field"
              value={values.templateId || ''}
              onChange={(event) => {
                const template = templates.find((entry) => entry.id === event.target.value);
                onChange({
                  ...values,
                  templateId: event.target.value || undefined,
                  items: template?.lineItems?.length ? template.lineItems : values.items,
                  termsAndConditions: template?.termsAndConditions || values.termsAndConditions,
                  discountAmount: Number(template?.defaultDiscount ?? values.discountAmount),
                  sstRate: Number(template?.defaultSstRate ?? values.sstRate),
                });
              }}
            >
              <option value="">No template</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>{template.name}</option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm text-slate-600 md:col-span-2">
            Quotation title
            <input className="field" value={values.title} onChange={(event) => onChange({ ...values, title: event.target.value })} />
          </label>
          <label className="space-y-2 text-sm text-slate-600">
            Expiry date
            <input className="field" type="datetime-local" value={values.expiryDate} onChange={(event) => onChange({ ...values, expiryDate: event.target.value })} />
          </label>
          <label className="space-y-2 text-sm text-slate-600">
            SST rate
            <input className="field" type="number" min="0" max="1" step="0.01" value={values.sstRate} onChange={(event) => onChange({ ...values, sstRate: Number(event.target.value) })} />
          </label>
          <label className="space-y-2 text-sm text-slate-600">
            Discount amount
            <input className="field" type="number" min="0" step="0.01" value={values.discountAmount} onChange={(event) => onChange({ ...values, discountAmount: Number(event.target.value) })} />
          </label>
          <label className="space-y-2 text-sm text-slate-600 md:col-span-2">
            Scope summary
            <textarea className="field min-h-[120px]" value={values.scopeSummary} onChange={(event) => onChange({ ...values, scopeSummary: event.target.value })} />
          </label>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">Line items</h2>
            <p className="text-sm text-slate-500">Dynamic builder with live calculations.</p>
          </div>
          <button className="btn-secondary gap-2" onClick={() => onChange({ ...values, items: [...values.items, blankItem()] })}>
            <Plus size={16} />
            Add line
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {values.items.map((item, index) => (
            <div key={`${item.serviceName}-${index}`} className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
              <div className="grid gap-3 md:grid-cols-[1.2fr_1.4fr_120px_140px_48px]">
                <input className="field" placeholder="Service name" value={item.serviceName} onChange={(event) => {
                  const nextItems = [...values.items];
                  nextItems[index] = { ...item, serviceName: event.target.value };
                  onChange({ ...values, items: nextItems });
                }} />
                <input className="field" placeholder="Description" value={item.description} onChange={(event) => {
                  const nextItems = [...values.items];
                  nextItems[index] = { ...item, description: event.target.value };
                  onChange({ ...values, items: nextItems });
                }} />
                <input className="field" type="number" min="1" value={item.quantity} onChange={(event) => {
                  const nextItems = [...values.items];
                  nextItems[index] = { ...item, quantity: Number(event.target.value) };
                  onChange({ ...values, items: nextItems });
                }} />
                <input className="field" type="number" min="0" step="0.01" value={item.unitPrice} onChange={(event) => {
                  const nextItems = [...values.items];
                  nextItems[index] = { ...item, unitPrice: Number(event.target.value) };
                  onChange({ ...values, items: nextItems });
                }} />
                <button className="inline-flex h-12 items-center justify-center rounded-2xl border border-rose-200 bg-white text-rose-500" onClick={() => onChange({ ...values, items: values.items.filter((_, currentIndex) => currentIndex !== index) })}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-600">
            Internal notes
            <textarea className="field min-h-[120px]" value={values.internalNotes} onChange={(event) => onChange({ ...values, internalNotes: event.target.value })} />
          </label>
          <label className="space-y-2 text-sm text-slate-600">
            Terms and conditions
            <textarea className="field min-h-[120px]" value={values.termsAndConditions} onChange={(event) => onChange({ ...values, termsAndConditions: event.target.value })} />
          </label>
        </div>
      </section>

      <aside className="panel h-fit p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Live totals</p>
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between text-sm text-slate-500"><span>Subtotal</span><span>{currency(totals.subtotal)}</span></div>
          <div className="flex items-center justify-between text-sm text-slate-500"><span>Discount</span><span>{currency(values.discountAmount)}</span></div>
          <div className="flex items-center justify-between text-sm text-slate-500"><span>SST</span><span>{currency(totals.taxAmount)}</span></div>
          <div className="flex items-center justify-between border-t border-slate-200 pt-4 font-display text-xl font-bold text-ink"><span>Grand total</span><span>{currency(totals.grandTotal)}</span></div>
        </div>
        <button className="btn-primary mt-8 w-full" disabled={busy} onClick={onSubmit}>{busy ? 'Saving...' : submitLabel}</button>
      </aside>
    </div>
  );
}