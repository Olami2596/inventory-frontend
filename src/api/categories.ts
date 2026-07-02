import apiClient from './client';
import type { Category } from '../types/api';

interface CategoryRequest {
  name: string;
  description?: string | null;
}

export async function getCategories(): Promise<Category[]> {
  const response = await apiClient.get<Category[]>('/categories');
  return response.data;
}

export async function getCategory(id: number): Promise<Category> {
  const response = await apiClient.get<Category>(`/categories/${id}`);
  return response.data;
}

export async function createCategory(data: CategoryRequest): Promise<Category> {
  const response = await apiClient.post<Category>('/categories', data);
  return response.data;
}

export async function updateCategory(id: number, data: CategoryRequest): Promise<Category> {
  const response = await apiClient.patch<Category>(`/categories/${id}`, data);
  return response.data;
}

export async function deleteCategory(id: number): Promise<void> {
  await apiClient.delete(`/categories/${id}`);
}