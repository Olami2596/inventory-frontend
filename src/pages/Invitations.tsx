import { useState, useEffect } from 'react';
import { Ban } from 'lucide-react';
import { getInvitations, sendInvitation, cancelInvitation } from '../api/invitations';
import { getInvitationStatus } from '../utils/invitationStatus';
import type { Invitation } from '../types/api';
import { getErrorMessage, getFieldErrors } from '../utils/errors';

const inputClass =
  'w-full bg-background border border-ink/15 rounded-lg px-3 py-2 text-sm placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors';

const selectClass =
  'w-full bg-background border border-ink/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors appearance-none cursor-pointer';

const cardHover =
  'transition-all duration-150 hover:border-accent/40 hover:shadow-md hover:shadow-ink/5 hover:-translate-y-0.5';

type InvitationStatus = 'pending' | 'accepted' | 'cancelled' | 'expired';

function getStatusBadgeClass(status: InvitationStatus): string {
  switch (status) {
    case 'pending':
      return 'bg-warning/10 text-warning';
    case 'accepted':
      return 'bg-accent/10 text-accent';
    case 'cancelled':
      return 'bg-ink/10 text-ink/60';
    case 'expired':
      return 'bg-danger/10 text-danger';
  }
}

function getStatusRailColor(status: InvitationStatus): string {
  switch (status) {
    case 'pending':
      return 'border-l-warning';
    case 'accepted':
      return 'border-l-accent';
    case 'cancelled':
      return 'border-l-ink/20';
    case 'expired':
      return 'border-l-danger';
  }
}

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-ink/60">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm">Loading invitations…</p>
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
      <h1 className="font-display text-2xl font-semibold tracking-tight mb-6">Invitations</h1>

      {error && (
        <div className="bg-danger/10 border border-danger/20 text-danger rounded-xl p-4 text-sm mb-4">
          {error}
        </div>
      )}

      <div className="bg-surface border border-ink/10 rounded-xl p-5 mb-6">
        <form onSubmit={handleCreate} className="space-y-3">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className={inputClass}
            />
            {fieldErrors.email && <p className="text-xs text-danger mt-1">{fieldErrors.email}</p>}
          </div>

          <div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'admin' | 'staff')}
              className={selectClass}
            >
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
            {fieldErrors.role && <p className="text-xs text-danger mt-1">{fieldErrors.role}</p>}
          </div>

          <button
            type="submit"
            className="bg-accent text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Send Invitation
          </button>
        </form>
      </div>

      <div className="space-y-2">
        {invitations.map((invitation) => {
          const status = getInvitationStatus(invitation);

          return (
            <div
              key={invitation.id}
              className={`bg-surface border-l-[3px] ${getStatusRailColor(
                status
              )} border-y border-r border-ink/10 rounded-lg px-4 py-3 flex items-start justify-between gap-4 ${cardHover}`}
            >
              <div className="space-y-0.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{invitation.email}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusBadgeClass(status)}`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-ink/60 capitalize">{invitation.role}</p>
              </div>

              {status === 'pending' && (
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleCancel(invitation.id)}
                    aria-label="Cancel invitation"
                    title="Cancel"
                    className="p-1.5 rounded-md bg-ink/5 text-ink/60 hover:bg-danger/10 hover:text-danger active:scale-[0.95] transition-all"
                  >
                    <Ban size={14} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Invitations;