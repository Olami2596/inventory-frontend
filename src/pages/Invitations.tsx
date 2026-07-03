import { useState, useEffect } from 'react';
import { getInvitations, sendInvitation, cancelInvitation } from '../api/invitations';
import { getInvitationStatus } from '../utils/invitationStatus';
import type { Invitation } from '../types/api';

function Invitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState<string>('');
  const [role, setRole] = useState<'admin' | 'staff'>('staff');

  async function fetchInvitations() {
    try {
      const result = await getInvitations();
      setInvitations(result);
    } catch (err) {
      setError('Failed to load invitations.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInvitations();
  }, []);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    try {
      await sendInvitation({ email, role });
      setEmail('');
      setRole('staff');
      await fetchInvitations();
    } catch (err) {
      setError('Failed to send invitation.');
    }
  }

  async function handleCancel(id: number) {
    if (!window.confirm('Cancel this invitation?')) return;

    try {
      await cancelInvitation(id);
      await fetchInvitations();
    } catch (err) {
      setError('Failed to cancel invitation.');
    }
  }

  return (
    <div>
      <h1>Invitations</h1>

      <form onSubmit={handleCreate}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as 'admin' | 'staff')}
        >
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit">Send Invitation</button>
      </form>

      {error && <p>{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {invitations.map((invitation) => {
            const status = getInvitationStatus(invitation);

            return (
              <li key={invitation.id}>
                <strong>{invitation.email}</strong>
                <span> — {invitation.role}</span>
                <span> — {status}</span>

                {status === 'pending' && (
                  <button onClick={() => handleCancel(invitation.id)}>Cancel</button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default Invitations;