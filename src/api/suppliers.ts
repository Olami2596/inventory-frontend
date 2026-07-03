import apiClient from './client';
import type { Supplier } from '../types/api';

interface SupplierRequest {
  name: string;
  contact_name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}

export async function getSuppliers(): Promise<Supplier[]> {
  const response = await apiClient.get<Supplier[]>('/suppliers');
  return response.data;
}

export async function getSupplier(id: number): Promise<Supplier> {
  const response = await apiClient.get<Supplier>(`/suppliers/${id}`);
  return response.data;
}

export async function createSupplier(data: SupplierRequest): Promise<Supplier> {
  const response = await apiClient.post<Supplier>('/suppliers', data);
  return response.data;
}

export async function updateSupplier(id: number, data: SupplierRequest): Promise<Supplier> {
  const response = await apiClient.patch<Supplier>(`/suppliers/${id}`, data);
  return response.data;
}

export async function deleteSupplier(id: number): Promise<void> {
  await apiClient.delete(`/suppliers/${id}`);
}