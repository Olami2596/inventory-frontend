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
