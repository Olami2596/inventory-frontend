import apiClient from './client';
import type { Invitation } from '../types/api';

interface SendInvitationRequest {
  email: string;
  role: 'admin' | 'staff';
}

export async function getInvitations(): Promise<Invitation[]> {
  const response = await apiClient.get<Invitation[]>('/invitations');
  return response.data;
}

export async function sendInvitation(data: SendInvitationRequest): Promise<Invitation> {
  const response = await apiClient.post<Invitation>('/invitations', data);
  return response.data;
}

export async function cancelInvitation(id: number): Promise<Invitation> {
  const response = await apiClient.patch<Invitation>(`/invitations/${id}/cancel`);
  return response.data;
}