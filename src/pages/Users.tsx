import { useState, useEffect } from 'react';
import { UserX, UserCheck, ShieldOff } from 'lucide-react';
import { getUsers, deactivateUser, reactivateUser, revokeUserSessions } from '../api/users';
import { usePermission } from '../hooks/usePermission';
import type { User } from '../types/api';
import { getErrorMessage } from '../utils/errors';

const cardHover =
  'transition-all duration-150 hover:border-accent/40 hover:shadow-md hover:shadow-ink/5 hover:-translate-y-0.5';

function getStatusRailColor(isActive: boolean): string {
  return isActive ? 'border-l-accent' : 'border-l-danger';
}

function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showColdStartMessage, setShowColdStartMessage] = useState<boolean>(false);

  const { canDeactivate, canReactivate, canRevokeSessions } = usePermission();

  async function fetchUsers() {
    try {
      const result = await getUsers();
      setUsers(result);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => setShowColdStartMessage(true), 5000);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers().finally(() => clearTimeout(timer));
  }, []);

  async function handleDeactivate(id: number) {
    if (!window.confirm('Deactivate this user?')) return;

    try {
      await deactivateUser(id);
      await fetchUsers();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleReactivate(id: number) {
    try {
      await reactivateUser(id);
      await fetchUsers();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleRevoke(id: number) {
    if (!window.confirm('Revoke all active sessions for this user?')) return;

    try {
      await revokeUserSessions(id);
      await fetchUsers();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-ink/60">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm">Loading users…</p>
        {showColdStartMessage && (
          <p className="mt-2 text-sm text-warning max-w-xs text-center">
            The server may be waking up from inactivity — this can take up to a minute on the first request.
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight mb-6">Users</h1>

      {error && (
        <div className="bg-danger/10 border border-danger/20 text-danger rounded-xl p-4 text-sm mb-4">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {users.map((user) => {
          const isActive = user.deactivated_at === null;

          return (
            <div
              key={user.id}
              className={`bg-surface border-l-[3px] ${getStatusRailColor(
                isActive
              )} border-y border-r border-ink/10 rounded-lg px-4 py-3 flex items-start justify-between gap-4 ${cardHover}`}
            >
              <div className="space-y-0.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{user.name}</p>
                  {isActive ? (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                      Active
                    </span>
                  ) : (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-danger/10 text-danger">
                      Deactivated
                    </span>
                  )}
                </div>
                <p className="text-sm text-ink/60">{user.email}</p>
                <p className="text-sm text-ink/60 capitalize">{user.role}</p>
              </div>

              <div className="flex gap-2 shrink-0">
                {isActive && canDeactivate(user) && (
                  <button
                    onClick={() => handleDeactivate(user.id)}
                    aria-label="Deactivate user"
                    title="Deactivate"
                    className="p-1.5 rounded-md bg-ink/5 text-ink/60 hover:bg-danger/10 hover:text-danger active:scale-[0.95] transition-all"
                  >
                    <UserX size={14} />
                  </button>
                )}

                {!isActive && canReactivate(user) && (
                  <button
                    onClick={() => handleReactivate(user.id)}
                    aria-label="Reactivate user"
                    title="Reactivate"
                    className="p-1.5 rounded-md bg-ink/5 text-ink/60 hover:bg-accent/10 hover:text-accent active:scale-[0.95] transition-all"
                  >
                    <UserCheck size={14} />
                  </button>
                )}

                {canRevokeSessions(user) && (
                  <button
                    onClick={() => handleRevoke(user.id)}
                    aria-label="Revoke sessions"
                    title="Revoke Sessions"
                    className="p-1.5 rounded-md bg-ink/5 text-ink/60 hover:bg-warning/10 hover:text-warning active:scale-[0.95] transition-all"
                  >
                    <ShieldOff size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Users;