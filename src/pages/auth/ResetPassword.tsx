import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { resetPassword } from '../../api/auth';
import { getErrorMessage, getFieldErrors } from '../../utils/errors';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState<string>('');
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New Password"
      />
      {fieldErrors.password && <span>{fieldErrors.password}</span>}

      <input
        type="password"
        value={passwordConfirmation}
        onChange={(e) => setPasswordConfirmation(e.target.value)}
        placeholder="Confirm New Password"
      />
      {fieldErrors.password_confirmation && <span>{fieldErrors.password_confirmation}</span>}

      {error && <p>{error}</p>}
      {message && (
        <div>
          <p>{message}</p>
          <Link to="/login">Go to Login</Link>
        </div>
      )}
      <button type="submit">Reset Password</button>
    </form>
  );
}

export default ResetPassword;