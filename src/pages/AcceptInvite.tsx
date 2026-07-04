import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { acceptInvitation } from '../api/invitations';
import { useAuthStore } from '../store/auth';
import { getErrorMessage, getFieldErrors } from '../utils/errors';
import AuthLayout from '../components/layout/AuthLayout';

const inputClass =
  'w-full bg-background border border-ink/15 rounded-lg px-3 py-2 text-sm placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors';

function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [name, setName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!token) {
      setError('Missing or invalid invitation token. Please use the link from your email.');
      return;
    }
    if (password !== passwordConfirmation) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { user, token: authToken } = await acceptInvitation(token, {
        name,
        password,
        password_confirmation: passwordConfirmation,
      });
      setAuth(authToken, user);
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
      setFieldErrors(getFieldErrors(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Accept your invitation" subtitle="Set your name and password to get started">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className={inputClass}
          />
          {fieldErrors.name && <p className="text-xs text-danger mt-1">{fieldErrors.name}</p>}
        </div>

        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className={inputClass}
          />
          {fieldErrors.password && (
            <p className="text-xs text-danger mt-1">{fieldErrors.password}</p>
          )}
        </div>

        <div>
          <input
            type="password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            placeholder="Confirm password"
            className={inputClass}
          />
          {fieldErrors.password_confirmation && (
            <p className="text-xs text-danger mt-1">{fieldErrors.password_confirmation}</p>
          )}
        </div>

        {error && (
          <div className="bg-danger/10 border border-danger/20 text-danger rounded-lg p-3 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-accent text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting && (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {isSubmitting ? 'Accepting…' : 'Accept Invitation'}
        </button>
      </form>
    </AuthLayout>
  );
}

export default AcceptInvite;