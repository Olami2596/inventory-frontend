import { useAuthStore } from '../store/auth';
import type { User } from '../types/api';

export function usePermission() {
  const user = useAuthStore((state) => state.user);

  function canDeactivate(target: User): boolean {
    if (!user) return false;
    if (user.role === 'owner') return target.role !== 'owner';
    if (user.role === 'admin') return target.role === 'staff';
    return false;
  }

  function canReactivate(target: User): boolean {
    if (!user) return false;
    if (user.role === 'owner') return true;
    if (user.role === 'admin') return target.role === 'staff';
    return false;
  }

  function canRevokeSessions(target: User): boolean {
    // same rule as reactivate per the doc's table
    return canReactivate(target);
  }

  return {
    isOwner: user?.role === 'owner',
    isAdmin: user?.role === 'admin',
    canManageUsers: user?.role === 'owner' || user?.role === 'admin',
    canDeactivate,
    canReactivate,
    canRevokeSessions,
  };
}