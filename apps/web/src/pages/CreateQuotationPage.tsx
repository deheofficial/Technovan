import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuotationBuilder } from '../components/QuotationBuilder';
import api from '../lib/api';
import type { Client, Quotation, QuotationFormValues, Template } from '../types';

const createInitialForm = (): QuotationFormValues => ({
  clientId: '',
  title: '',
  expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString().slice(0, 16),
  scopeSummary: '',
  discountAmount: 0,
  sstRate: 0.06,
  internalNotes: '',
  termsAndConditions: 'Payment due within 14 days. Scope changes will be quoted separately.',
  items: [{ serviceName: '', description: '', quantity: 1, unitPrice: 0 }],
});

export function CreateQuotationPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [values, setValues] = useState<QuotationFormValues>(createInitialForm());

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => (await api.get<Client[]>('/clients')).data,
  });
  const { data: templates = [] } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => (await api.get<Template[]>('/quotations/templates')).data,
  });

  const normalizedClients = useMemo(() => clients.map((client) => ({ id: client.id, companyName: client.companyName })), [clients]);

  const createQuotation = useMutation({
    mutationFn: async () => (await api.post<Quotation>('/quotations', {
      ...values,
      expiryDate: new Date(values.expiryDate).toISOString(),
    })).data,
    onSuccess: (quotation) => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-quotations'] });
      navigate(`/quotations/${quotation.id}`);
    },
  });

  return <QuotationBuilder values={values} clients={normalizedClients} templates={templates} onChange={setValues} onSubmit={() => createQuotation.mutate()} submitLabel="Save as draft" busy={createQuotation.isPending} />;
}