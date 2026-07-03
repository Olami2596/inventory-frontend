import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../api/auth';
import { useAuthStore } from '../../store/auth';
import { getErrorMessage, getFieldErrors } from '../../utils/errors';

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

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

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
      {fieldErrors.company_name && <span>{fieldErrors.company_name}</span>}

      <input
        type="email"
        name="company_email"
        value={formData.company_email}
        onChange={handleChange}
        placeholder="Company Email"
      />
      {fieldErrors.company_email && <span>{fieldErrors.company_email}</span>}

      <input
        type="text"
        name="company_phone"
        value={formData.company_phone}
        onChange={handleChange}
        placeholder="Company Phone"
      />
      {fieldErrors.company_phone && <span>{fieldErrors.company_phone}</span>}

      <input
        type="text"
        name="company_address"
        value={formData.company_address}
        onChange={handleChange}
        placeholder="Company Address (optional)"
      />
      {fieldErrors.company_address && <span>{fieldErrors.company_address}</span>}

      <input
        type="text"
        name="owner_name"
        value={formData.owner_name}
        onChange={handleChange}
        placeholder="Owner Name"
      />
      {fieldErrors.owner_name && <span>{fieldErrors.owner_name}</span>}

      <input
        type="email"
        name="owner_email"
        value={formData.owner_email}
        onChange={handleChange}
        placeholder="Owner Email"
      />
      {fieldErrors.owner_email && <span>{fieldErrors.owner_email}</span>}

      <input
        type="password"
        name="owner_password"
        value={formData.owner_password}
        onChange={handleChange}
        placeholder="Password"
      />
      {fieldErrors.owner_password && <span>{fieldErrors.owner_password}</span>}

      <input
        type="password"
        name="owner_password_confirmation"
        value={formData.owner_password_confirmation}
        onChange={handleChange}
        placeholder="Confirm Password"
      />
      {fieldErrors.owner_password_confirmation && <span>{fieldErrors.owner_password_confirmation}</span>}

      {error && <p>{error}</p>}
      <button type="submit">Register</button>
    </form>
  );
}

export default Register;