import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { acceptInvitation } from '../api/invitations';
import { useAuthStore } from '../store/auth';
import { getErrorMessage, getFieldErrors } from '../utils/errors';

function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [name, setName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Full name"
      />
      {fieldErrors.name && <span>{fieldErrors.name}</span>}

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      {fieldErrors.password && <span>{fieldErrors.password}</span>}

      <input
        type="password"
        value={passwordConfirmation}
        onChange={(e) => setPasswordConfirmation(e.target.value)}
        placeholder="Confirm password"
      />
      {fieldErrors.password_confirmation && <span>{fieldErrors.password_confirmation}</span>}

      {error && <p>{error}</p>}
      <button type="submit">Accept Invitation</button>
    </form>
  );
}

export default AcceptInvite;