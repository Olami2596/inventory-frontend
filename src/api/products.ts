import apiClient from './client';
import type { Product, ProductWithRelations } from '../types/api';

interface ProductRequest {
  name: string;
  sku: string;
  description?: string | null;
  price: number;
  cost?: number | null;
  category_id: number;
  supplier_id: number;
  image_url?: string | null;
}

export async function getProducts(): Promise<ProductWithRelations[]> {
  const response = await apiClient.get<ProductWithRelations[]>('/products');
  return response.data;
}

export async function getProduct(id: number): Promise<ProductWithRelations> {
  const response = await apiClient.get<ProductWithRelations>(`/products/${id}`);
  return response.data;
}

export async function createProduct(data: ProductRequest): Promise<Product> {
  const response = await apiClient.post<Product>('/products', data);
  return response.data;
}

export async function updateProduct(id: number, data: ProductRequest): Promise<Product> {
  const response = await apiClient.patch<Product>(`/products/${id}`, data);
  return response.data;
}

export async function deleteProduct(id: number): Promise<void> {
  await apiClient.delete(`/products/${id}`);
}