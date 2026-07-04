import { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { login } from '../../api/auth';
import { useAuthStore } from '../../store/auth';
import { getErrorMessage, getFieldErrors } from '../../utils/errors';
import AuthLayout from '../../components/layout/AuthLayout';

const inputClass =
  'w-full bg-background border border-ink/15 rounded-lg px-3 py-2 text-sm placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors';

function Login() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const token = useAuthStore((state) => state.token);

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setIsSubmitting(true);
    try {
      const { user, token } = await login(email, password);
      setAuth(token, user);
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
      setFieldErrors(getFieldErrors(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Sign in to your account">
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

        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className={inputClass}
          />
          {fieldErrors.password && <p className="text-xs text-danger mt-1">{fieldErrors.password}</p>}
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
          {isSubmitting ? 'Signing in…' : 'Log In'}
        </button>
      </form>

      <div className="flex items-center justify-between mt-4 text-xs">
        <Link to="/forgot-password" className="text-ink/60 hover:text-accent transition-colors">
          Forgot password?
        </Link>
        <Link to="/register" className="text-accent font-medium hover:opacity-80 transition-opacity">
          Create an account
        </Link>
      </div>
    </AuthLayout>
  );
}

export default Login;