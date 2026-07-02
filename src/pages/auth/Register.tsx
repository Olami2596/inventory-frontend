import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../api/auth';
import { useAuthStore } from '../../store/auth';

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

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    try {
      const { user, token } = await register({
        ...formData,
        company_address: formData.company_address || undefined,
      });
      setAuth(token, user);
      navigate('/dashboard');
    } catch (err) {
      setError('Registration failed. Please check your details and try again.');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="company_name"
        value={formData.company_name}
        onChange={handleChange}
        placeholder="Company Name"
      />
      <input
        type="email"
        name="company_email"
        value={formData.company_email}
        onChange={handleChange}
        placeholder="Company Email"
      />
      <input
        type="text"
        name="company_phone"
        value={formData.company_phone}
        onChange={handleChange}
        placeholder="Company Phone"
      />
      <input
        type="text"
        name="company_address"
        value={formData.company_address}
        onChange={handleChange}
        placeholder="Company Address (optional)"
      />
      <input
        type="text"
        name="owner_name"
        value={formData.owner_name}
        onChange={handleChange}
        placeholder="Owner Name"
      />
      <input
        type="email"
        name="owner_email"
        value={formData.owner_email}
        onChange={handleChange}
        placeholder="Owner Email"
      />
      <input
        type="password"
        name="owner_password"
        value={formData.owner_password}
        onChange={handleChange}
        placeholder="Password"
      />
      <input
        type="password"
        name="owner_password_confirmation"
        value={formData.owner_password_confirmation}
        onChange={handleChange}
        placeholder="Confirm Password"
      />
      {error && <p>{error}</p>}
      <button type="submit">Register</button>
    </form>
  );
}

export default Register;