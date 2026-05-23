export type UserRole = 'ADMIN' | 'SALES' | 'MANAGER';

export type QuotationStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'SENT'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  role: UserRole;
  isActive: boolean;
}

export interface Client {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  notes?: string | null;
}

export interface QuotationItem {
  id?: string;
  serviceName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal?: number;
}

export interface QuotationVersion {
  id: string;
  versionLabel: string;
  scopeSummary?: string | null;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;
  approvalRequestedAt?: string | null;
  approvedAt?: string | null;
  items: QuotationItem[];
}

export interface AuditLog {
  id: string;
  action: string;
  message: string;
  createdAt: string;
  user?: User;
}

export interface Project {
  id: string;
  projectCode: string;
  name: string;
  status: string;
  scopeSummary?: string | null;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  title: string;
  status: QuotationStatus;
  expiryDate: string;
  discountAmount: number;
  sstRate: number;
  internalNotes?: string | null;
  termsAndConditions?: string | null;
  publicToken: string;
  clientId: string;
  client: Client;
  owner: User;
  currentVersion?: QuotationVersion | null;
  versions: QuotationVersion[];
  auditLogs: AuditLog[];
  project?: Project | null;
}

export interface DashboardMetrics {
  totalQuotations: number;
  acceptedQuotations: number;
  rejectedQuotations: number;
  pendingApprovals: number;
  revenueForecast: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Template {
  id: string;
  name: string;
  description?: string | null;
  defaultDiscount: number;
  defaultSstRate: number;
  termsAndConditions?: string | null;
  lineItems: QuotationItem[];
}

export interface QuotationFormValues {
  clientId: string;
  title: string;
  expiryDate: string;
  scopeSummary: string;
  discountAmount: number;
  sstRate: number;
  internalNotes: string;
  termsAndConditions: string;
  items: QuotationItem[];
  templateId?: string;
}