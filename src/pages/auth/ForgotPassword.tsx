import { useState } from 'react';
import { forgotPassword } from '../../api/auth';
import { getErrorMessage, getFieldErrors } from '../../utils/errors';

function ForgotPassword() {
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setFieldErrors({});

    try {
      const response = await forgotPassword(email);
      setMessage(response.message);
    } catch (err) {
      setError(getErrorMessage(err));
      setFieldErrors(getFieldErrors(err));
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      {fieldErrors.email && <span>{fieldErrors.email}</span>}

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}
      <button type="submit">Send Reset Link</button>
    </form>
  );
}

export default ForgotPassword;