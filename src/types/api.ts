export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  company_id: number;
  role: "owner" | "admin" | "staff";
  deactivated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardSummary {
  total_products: number;
  total_categories: number;
  total_suppliers: number;
  total_sale_value: string;
  total_cost_value: string;
  units_sold_this_week: number;
  units_sold_last_week: number;
  units_sold_this_month: number;
  units_sold_last_month: number;
  avg_purchase_quantity: string | null;
  avg_sale_quantity: number;
}

export interface Category {
  id: number;
  company_id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: number;
  company_id: number;
  name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  company_id: number;
  category_id: number;
  supplier_id: number;
  name: string;
  sku: string;
  description: string | null;
  price: string;
  cost: string | null;
  current_stock: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductWithRelations extends Product {
  category: Category;
  supplier: Supplier;
}