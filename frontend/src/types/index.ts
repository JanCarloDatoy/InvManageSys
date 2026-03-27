export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  sku: string;
  barcode?: string;
  category: Category | null;
  supplier?: Supplier;
  unit_price: number;
  cost_price: number;
  quantity_in_stock: number;
  reorder_level: number;
  max_stock_level: number;
  unit_of_measurement: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  is_low_stock?: boolean;
  stock_value?: number;
}

export interface Supplier {
  id: number;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postal_code: string;
  tax_id: string;
  payment_terms: string;
  is_active: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
  total_products?: number;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postal_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SaleItem {
  id: number;
  sale: number;
  product: Product;
  quantity: number;
  unit_price: number;
  discount_percentage: number;
  total_price: number;
}

export interface Sale {
  id: number;
  invoice_number: string;
  customer: Customer | null;
  customer_name: string | null;
  salesperson: User | null;
  salesperson_name: string | null;
  sale_date: string;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  payment_method: 'cash' | 'card' | 'bank_transfer' | 'check';
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  notes: string;
  items: SaleItem[];
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalSuppliers: number;
  totalCustomers: number;
  totalSales: number;
  lowStockProducts: number;
  recentSales: Sale[];
  topProducts: Product[];
  monthlyRevenue: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  count?: number;
}

export interface PaginationParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
