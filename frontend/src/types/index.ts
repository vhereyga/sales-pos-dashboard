export type UserRole = 'ADMIN' | 'STAFF';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  invoiceNo: string;
  customerId?: string | null;
  customer?: Customer | null;
  userId: string;
  user?: User;
  totalAmount: number;
  createdAt: string;
  items?: SaleItem[];
  _count?: {
    items: number;
  };
}

export interface DashboardSummary {
  totalSales: number;
  transactionCount: number;
  productCount: number;
  customerCount: number;
}

export interface SalesTrendItem {
  date: string;
  totalSales: number;
  count: number;
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Array<{ field?: string; message: string }>;
}
