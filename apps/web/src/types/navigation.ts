export type ModuleKey =
  | 'overview'
  | 'projects'
  | 'payments'
  | 'dashboard'
  | 'services'
  | 'pricing'
  | 'blog'
  | 'quotation'
  | 'all-projects'
  | 'inquiries'
  | 'change-management';

export type ModuleDefinition = {
  key: ModuleKey;
  label: string;
  icon: string;
  path: string;
  adminOnly?: boolean;
};
