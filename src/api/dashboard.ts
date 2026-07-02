import apiClient from './client';
import type { DashboardSummary } from '../types/api';

export async function getDashboard(): Promise<DashboardSummary> {
  const response = await apiClient.get<DashboardSummary>('/dashboard');
  return response.data;
}