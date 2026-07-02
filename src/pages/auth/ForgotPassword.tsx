import { useState } from 'react';
import { forgotPassword } from '../../api/auth';

function ForgotPassword() {
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setError(null);

    try {
      const response = await forgotPassword(email);
      setMessage(response.message);
    } catch (err) {
      setError('Something went wrong. Please try again.');
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
      {message && <p>{message}</p>}
      {error && <p>{error}</p>}
      <button type="submit">Send Reset Link</button>
    </form>
  );
}

export default ForgotPassword;