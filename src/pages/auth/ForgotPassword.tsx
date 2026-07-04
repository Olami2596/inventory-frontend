import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../api/auth';
import { getErrorMessage, getFieldErrors } from '../../utils/errors';
import AuthLayout from '../../components/layout/AuthLayout';

const inputClass =
  'w-full bg-background border border-ink/15 rounded-lg px-3 py-2 text-sm placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors';

function ForgotPassword() {
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setFieldErrors({});
    setIsSubmitting(true);
    try {
      const response = await forgotPassword(email);
      setMessage(response.message);
    } catch (err) {
      setError(getErrorMessage(err));
      setFieldErrors(getFieldErrors(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
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

        {message && (
          <div className="bg-accent/10 border border-accent/20 text-accent rounded-lg p-3 text-sm">
            {message}
          </div>
        )}

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
          {isSubmitting ? 'Sending…' : 'Send Reset Link'}
        </button>
      </form>

      <div className="flex items-center justify-center mt-4 text-xs">
        <Link to="/login" className="text-ink/60 hover:text-accent transition-colors">
          Back to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}

export default ForgotPassword;