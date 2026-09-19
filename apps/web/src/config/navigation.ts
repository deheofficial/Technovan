import type { ModuleDefinition } from '../types/navigation';

export const primaryNavigation: ModuleDefinition[] = [
  { key: 'overview', label: 'Overview', icon: '⌁', path: '/' },
  { key: 'projects', label: 'My Projects', icon: '□', path: '/dashboard/projects' },
  { key: 'payments', label: 'Payments', icon: '▣', path: '/dashboard/payments' },
];

export const adminNavigation: ModuleDefinition[] = [
  { key: 'dashboard', label: 'Dashboard', icon: '⌁', path: '/admin/overview', adminOnly: true },
  { key: 'services', label: 'Services', icon: '⚙', path: '/admin/services', adminOnly: true },
  { key: 'pricing', label: 'Pricing', icon: '$', path: '/admin/pricing', adminOnly: true },
  { key: 'blog', label: 'Blog', icon: '▤', path: '/admin/blog', adminOnly: true },
  { key: 'quotation', label: 'Quotation', icon: '▤', path: '/admin/quotation', adminOnly: true },
  { key: 'all-projects', label: 'All Projects', icon: '▤', path: '/admin/projects', adminOnly: true },
  { key: 'inquiries', label: 'Inquiries', icon: '✉', path: '/admin/inquiries', adminOnly: true },
  { key: 'change-management', label: 'Change Management', icon: '↻', path: '/admin/change-management', adminOnly: true },
];
