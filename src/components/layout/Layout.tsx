import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../api/auth';
import { useAuthStore } from '../../store/auth';
import { usePermission } from '../../hooks/usePermission';

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const { canManageUsers } = usePermission();

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // even if the API call fails (e.g. token already expired), still clear local auth
    } finally {
      clearAuth();
      navigate('/login');
    }
  }

  return (
    <div>
      <nav>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/categories">Categories</Link>
        <Link to="/suppliers">Suppliers</Link>
        <Link to="/products">Products</Link>
        <Link to="/transactions">Transactions</Link>
        {canManageUsers && <Link to="/invitations">Invitations</Link>}
        {canManageUsers && <Link to="/users">Users</Link>}
        <button onClick={handleLogout}>Log Out</button>
      </nav>

      <main>{children}</main>
    </div>
  );
}

export default Layout;