import apiClient from './client';
import type { Invitation, User } from '../types/api';

interface SendInvitationRequest {
  email: string;
  role: 'admin' | 'staff';
}

interface AcceptInvitationRequest {
  name: string;
  password: string;
  password_confirmation: string;
}

interface AcceptInvitationResponse {
  user: User;
  token: string;
}

export async function acceptInvitation(token: string, data: AcceptInvitationRequest): Promise<AcceptInvitationResponse> {
  const response = await apiClient.post<AcceptInvitationResponse>(`/invitations/accept/${token}`, data);
  return response.data;
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