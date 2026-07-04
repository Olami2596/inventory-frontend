import { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { register } from '../../api/auth';
import { useAuthStore } from '../../store/auth';
import { getErrorMessage, getFieldErrors } from '../../utils/errors';
import AuthLayout from '../../components/layout/AuthLayout';

const inputClass =
  'w-full bg-background border border-ink/15 rounded-lg px-3 py-2 text-sm placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors';

interface RegisterFormData {
  company_name: string;
  company_email: string;
  company_phone: string;
  company_address: string;
  owner_name: string;
  owner_email: string;
  owner_password: string;
  owner_password_confirmation: string;
}

function Register() {
  const [formData, setFormData] = useState<RegisterFormData>({
    company_name: '',
    company_email: '',
    company_phone: '',
    company_address: '',
    owner_name: '',
    owner_email: '',
    owner_password: '',
    owner_password_confirmation: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const token = useAuthStore((state) => state.token);

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (formData.owner_password !== formData.owner_password_confirmation) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { user, token } = await register({
        ...formData,
        company_address: formData.company_address || undefined,
      });
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
    <AuthLayout title="Create your company account">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="text"
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
            placeholder="Company Name"
            className={inputClass}
          />
          {fieldErrors.company_name && (
            <p className="text-xs text-danger mt-1">{fieldErrors.company_name}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <input
              type="email"
              name="company_email"
              value={formData.company_email}
              onChange={handleChange}
              placeholder="Company Email"
              className={inputClass}
            />
            {fieldErrors.company_email && (
              <p className="text-xs text-danger mt-1">{fieldErrors.company_email}</p>
            )}
          </div>

          <div>
            <input
              type="text"
              name="company_phone"
              value={formData.company_phone}
              onChange={handleChange}
              placeholder="Company Phone"
              className={inputClass}
            />
            {fieldErrors.company_phone && (
              <p className="text-xs text-danger mt-1">{fieldErrors.company_phone}</p>
            )}
          </div>
        </div>

        <div>
          <input
            type="text"
            name="company_address"
            value={formData.company_address}
            onChange={handleChange}
            placeholder="Company Address (optional)"
            className={inputClass}
          />
          {fieldErrors.company_address && (
            <p className="text-xs text-danger mt-1">{fieldErrors.company_address}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <input
              type="text"
              name="owner_name"
              value={formData.owner_name}
              onChange={handleChange}
              placeholder="Owner Name"
              className={inputClass}
            />
            {fieldErrors.owner_name && (
              <p className="text-xs text-danger mt-1">{fieldErrors.owner_name}</p>
            )}
          </div>

          <div>
            <input
              type="email"
              name="owner_email"
              value={formData.owner_email}
              onChange={handleChange}
              placeholder="Owner Email"
              className={inputClass}
            />
            {fieldErrors.owner_email && (
              <p className="text-xs text-danger mt-1">{fieldErrors.owner_email}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <input
              type="password"
              name="owner_password"
              value={formData.owner_password}
              onChange={handleChange}
              placeholder="Password"
              className={inputClass}
            />
            {fieldErrors.owner_password && (
              <p className="text-xs text-danger mt-1">{fieldErrors.owner_password}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              name="owner_password_confirmation"
              value={formData.owner_password_confirmation}
              onChange={handleChange}
              placeholder="Confirm Password"
              className={inputClass}
            />
            {fieldErrors.owner_password_confirmation && (
              <p className="text-xs text-danger mt-1">{fieldErrors.owner_password_confirmation}</p>
            )}
          </div>
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
          {isSubmitting ? 'Creating account…' : 'Register'}
        </button>
      </form>

      <div className="flex items-center justify-center mt-4 text-xs">
        <Link to="/login" className="text-ink/60 hover:text-accent transition-colors">
          Already have an account? <span className="text-accent font-medium">Sign in</span>
        </Link>
      </div>
    </AuthLayout>
  );
}

export default Register;