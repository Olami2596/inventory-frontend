import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { acceptInvitation } from '../api/invitations';
import { useAuthStore } from '../store/auth';

function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [name, setName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

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
      setError('Failed to accept invitation. The link may be expired or invalid.');
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
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <input
        type="password"
        value={passwordConfirmation}
        onChange={(e) => setPasswordConfirmation(e.target.value)}
        placeholder="Confirm password"
      />
      {error && <p>{error}</p>}
      <button type="submit">Accept Invitation</button>
    </form>
  );
}

export default AcceptInvite;