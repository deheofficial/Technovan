import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../lib/api';
import type { Client } from '../types';

const initialClient = {
  companyName: '',
  contactPerson: '',
  email: '',
  phone: '',
  addressLine1: '',
  city: '',
  country: '',
};

export function ClientsPage() {
  const [form, setForm] = useState(initialClient);
  const queryClient = useQueryClient();
  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => (await api.get<Client[]>('/clients')).data,
  });

  const createClient = useMutation({
    mutationFn: async () => api.post('/clients', form),
    onSuccess: () => {
      setForm(initialClient);
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <section className="panel p-6">
        <h2 className="font-display text-2xl font-bold text-ink">Add client</h2>
        <p className="mt-2 text-sm text-slate-500">Company records link directly to quotations and converted projects.</p>
        <div className="mt-6 space-y-4">
          {Object.entries(form).map(([key, value]) => (
            <input key={key} className="field" placeholder={key.replace(/([A-Z])/g, ' $1')} value={value} onChange={(event) => setForm({ ...form, [key]: event.target.value })} />
          ))}
          <button className="btn-primary w-full" onClick={() => createClient.mutate()}>{createClient.isPending ? 'Saving...' : 'Create client'}</button>
        </div>
      </section>
      <section className="panel p-6">
        <h2 className="font-display text-2xl font-bold text-ink">Client directory</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {clients.map((client) => (
            <article key={client.id} className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
              <p className="font-display text-xl font-bold text-ink">{client.companyName}</p>
              <p className="mt-1 text-sm text-slate-500">{client.contactPerson}</p>
              <p className="mt-4 text-sm text-slate-600">{client.email}</p>
              <p className="text-sm text-slate-600">{client.phone}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}