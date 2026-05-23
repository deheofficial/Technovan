import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import type { Client, Project, Quotation, User } from '../types';
import { currency } from '../lib/formatters';
import { StatusBadge } from '../components/StatusBadge';

type TabKey = 'users' | 'clients' | 'quotations' | 'projects';

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: 'users', label: 'Users' },
  { key: 'clients', label: 'Clients' },
  { key: 'quotations', label: 'Quotations' },
  { key: 'projects', label: 'Projects' },
];

export function DataTablePage() {
  const [activeTab, setActiveTab] = useState<TabKey>('quotations');

  const usersQuery = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => (await api.get<User[]>('/auth/users')).data,
  });

  const clientsQuery = useQuery({
    queryKey: ['clients-table'],
    queryFn: async () => (await api.get<Client[]>('/clients')).data,
  });

  const quotationsQuery = useQuery({
    queryKey: ['quotations-table'],
    queryFn: async () => (await api.get<Quotation[]>('/quotations')).data,
  });

  const projectsQuery = useQuery({
    queryKey: ['projects-table'],
    queryFn: async () => (await api.get<Project[]>('/projects')).data,
  });

  return (
    <section className="panel p-6">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-ink">Data Tables</h2>
        <p className="text-sm text-slate-500">Live records from API endpoints for quick operational checks.</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 rounded-2xl bg-slate-100 p-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${activeTab === tab.key ? 'bg-white text-ink shadow-sm' : 'text-slate-500 hover:text-ink'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'users' && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-3">Name</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Active</th>
              </tr>
            </thead>
            <tbody>
              {(usersQuery.data || []).map((user) => (
                <tr key={user.id} className="border-b border-slate-100">
                  <td className="py-3 font-medium text-ink">{user.fullName}</td>
                  <td className="py-3 text-slate-600">{user.email}</td>
                  <td className="py-3 text-slate-600">{user.role}</td>
                  <td className="py-3 text-slate-600">{user.isActive ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {usersQuery.error && <p className="mt-4 text-sm text-rose-500">Users table requires admin access.</p>}
        </div>
      )}

      {activeTab === 'clients' && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-3">Company</th>
                <th className="pb-3">Contact</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Phone</th>
              </tr>
            </thead>
            <tbody>
              {(clientsQuery.data || []).map((client) => (
                <tr key={client.id} className="border-b border-slate-100">
                  <td className="py-3 font-medium text-ink">{client.companyName}</td>
                  <td className="py-3 text-slate-600">{client.contactPerson}</td>
                  <td className="py-3 text-slate-600">{client.email}</td>
                  <td className="py-3 text-slate-600">{client.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'quotations' && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-3">Number</th>
                <th className="pb-3">Client</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Version</th>
                <th className="pb-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              {(quotationsQuery.data || []).map((quotation) => (
                <tr key={quotation.id} className="border-b border-slate-100">
                  <td className="py-3 font-medium text-ink">{quotation.quotationNumber}</td>
                  <td className="py-3 text-slate-600">{quotation.client.companyName}</td>
                  <td className="py-3"><StatusBadge status={quotation.status} /></td>
                  <td className="py-3 text-slate-600">{quotation.currentVersion?.versionLabel || 'v1'}</td>
                  <td className="py-3 text-slate-600">{currency(quotation.currentVersion?.grandTotal || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-3">Code</th>
                <th className="pb-3">Name</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Scope</th>
              </tr>
            </thead>
            <tbody>
              {(projectsQuery.data || []).map((project) => (
                <tr key={project.id} className="border-b border-slate-100">
                  <td className="py-3 font-medium text-ink">{project.projectCode}</td>
                  <td className="py-3 text-slate-600">{project.name}</td>
                  <td className="py-3 text-slate-600">{project.status}</td>
                  <td className="py-3 text-slate-600">{project.scopeSummary || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}