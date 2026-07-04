import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { resetPassword } from '../../api/auth';
import { getErrorMessage, getFieldErrors } from '../../utils/errors';
import AuthLayout from '../../components/layout/AuthLayout';

const inputClass =
  'w-full bg-background border border-ink/15 rounded-lg px-3 py-2 text-sm placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState<string>('');
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setFieldErrors({});

    if (!token) {
      setError('Missing or invalid reset token. Please use the link from your email.');
      return;
    }
    if (password !== passwordConfirmation) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await resetPassword({
        token,
        password,
        password_confirmation: passwordConfirmation,
      });
      setMessage(response.message);
    } catch (err) {
      setError(getErrorMessage(err));
      setFieldErrors(getFieldErrors(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Set a new password">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New Password"
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
            placeholder="Confirm New Password"
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

        {message && (
          <div className="bg-accent/10 border border-accent/20 text-accent rounded-lg p-3 text-sm">
            <p>{message}</p>
            <Link to="/login" className="font-medium underline hover:opacity-80 transition-opacity">
              Go to Login
            </Link>
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
          {isSubmitting ? 'Resetting…' : 'Reset Password'}
        </button>
      </form>
    </AuthLayout>
  );
}

export default ResetPassword;