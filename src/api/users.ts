import apiClient from './client';
import type { User } from '../types/api';

interface RevokeSessionsResponse {
  message: string;
}

export async function getUsers(): Promise<User[]> {
  const response = await apiClient.get<User[]>('/users');
  return response.data;
}

export async function deactivateUser(id: number): Promise<User> {
  const response = await apiClient.patch<User>(`/users/${id}/deactivate`);
  return response.data;
}

export async function reactivateUser(id: number): Promise<User> {
  const response = await apiClient.patch<User>(`/users/${id}/reactivate`);
  return response.data;
}

export async function revokeUserSessions(id: number): Promise<RevokeSessionsResponse> {
  const response = await apiClient.post<RevokeSessionsResponse>(`/users/${id}/revoke-tokens`);
  return response.data;
}