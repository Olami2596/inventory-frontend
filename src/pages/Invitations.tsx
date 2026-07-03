import { useState, useEffect } from 'react';
import { getInvitations, sendInvitation, cancelInvitation } from '../api/invitations';
import { getInvitationStatus } from '../utils/invitationStatus';
import type { Invitation } from '../types/api';
import { getErrorMessage, getFieldErrors } from '../utils/errors';

function Invitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showColdStartMessage, setShowColdStartMessage] = useState<boolean>(false);

  const [email, setEmail] = useState<string>('');
  const [role, setRole] = useState<'admin' | 'staff'>('staff');

  async function fetchInvitations() {
    try {
      const result = await getInvitations();
      setInvitations(result);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => setShowColdStartMessage(true), 5000);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInvitations().finally(() => clearTimeout(timer));
  }, []);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    try {
      await sendInvitation({ email, role });
      setEmail('');
      setRole('staff');
      await fetchInvitations();
    } catch (err) {
      setError(getErrorMessage(err));
      setFieldErrors(getFieldErrors(err));
    }
  }

  async function handleCancel(id: number) {
    if (!window.confirm('Cancel this invitation?')) return;

    try {
      await cancelInvitation(id);
      await fetchInvitations();
    } catch (err) {
      setError(getErrorMessage(err));
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
        {fieldErrors.email && <span>{fieldErrors.email}</span>}

        <select
          value={role}
          onChange={(e) => setRole(e.target.value as 'admin' | 'staff')}
        >
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>
        {fieldErrors.role && <span>{fieldErrors.role}</span>}

        <button type="submit">Send Invitation</button>
      </form>

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