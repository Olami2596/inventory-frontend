import { useState, useEffect } from 'react';
import { getUsers, deactivateUser, reactivateUser, revokeUserSessions } from '../api/users';
import { usePermission } from '../hooks/usePermission';
import type { User } from '../types/api';
import { getErrorMessage } from '../utils/errors';

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

  return (
    <div>
      <h1>Users</h1>

      {error && <p>{error}</p>}

      {loading ? (
        <div>
          <p>Loading...</p>
          {showColdStartMessage && (
            <p>The server may be waking up from inactivity — this can take up to a minute on the first request.</p>
          )}
        </div>
      ) : (
        <ul>
          {users.map((user) => {
            const isActive = user.deactivated_at === null;

            return (
              <li key={user.id}>
                <strong>{user.name}</strong>
                <span> — {user.email}</span>
                <span> — {user.role}</span>
                <span> — {isActive ? 'Active' : 'Deactivated'}</span>

                {isActive && canDeactivate(user) && (
                  <button onClick={() => handleDeactivate(user.id)}>Deactivate</button>
                )}

                {!isActive && canReactivate(user) && (
                  <button onClick={() => handleReactivate(user.id)}>Reactivate</button>
                )}

                {canRevokeSessions(user) && (
                  <button onClick={() => handleRevoke(user.id)}>Revoke Sessions</button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default Users;