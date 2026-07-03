import apiClient from './client';
import type { TransactionWithRelations } from '../types/api';

interface TransactionRequest {
  product_id: number;
  type: 'purchase' | 'sale' | 'adjustment';
  quantity: number;
  notes?: string | null;
}

export async function getTransactions(): Promise<TransactionWithRelations[]> {
  const response = await apiClient.get<TransactionWithRelations[]>('/transactions');
  return response.data;
}

export async function createTransaction(data: TransactionRequest): Promise<TransactionWithRelations> {
  const response = await apiClient.post<TransactionWithRelations>('/transactions', data);
  return response.data;
}