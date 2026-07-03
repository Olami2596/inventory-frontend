import type { Invitation } from '../types/api';

export function getInvitationStatus(invitation: Invitation): 'pending' | 'accepted' | 'cancelled' | 'expired' {
  if (invitation.accepted_at) return 'accepted';
  if (invitation.cancelled_at) return 'cancelled';
  if (new Date(invitation.expires_at) <= new Date()) return 'expired';
  return 'pending';
}