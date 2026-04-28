export type UserRole = 'ADMIN' | 'CUSTOMER' | 'SUPPORT';
export type ProjectStatus = 'PENDING' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  company?: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Pricing {
  id: string;
  name: string;
  price: number;
  currency: string;
  description?: string;
  features: string[];
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  pricingId: string;
  pricing?: Pricing;
  userId: string;
  user?: User;
  budget?: number;
  deadline?: Date;
  files: string[];
  notes?: string;
  messages?: Message[];
  payments?: Payment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: string;
  transactionId?: string;
  projectId: string;
  project?: Project;
  userId: string;
  user?: User;
  invoiceUrl?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  content: string;
  projectId: string;
  project?: Project;
  userId: string;
  user?: User;
  createdAt: Date;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  userId?: string;
  user?: User;
  isRead: boolean;
  responded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

export interface APIResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
