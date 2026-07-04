import { useState, type ReactNode } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FolderTree, Truck, Package, ArrowLeftRight,
  Mail, Users as UsersIcon, Moon, Sun, LogOut, ShieldOff,
  ChevronLeft, ChevronRight, Menu, X,
} from 'lucide-react';
import { logout } from '../../api/auth';
import { revokeMySessions } from '../../api/users';
import { useAuthStore } from '../../store/auth';
import { usePermission } from '../../hooks/usePermission';
import { useDarkMode } from '../../hooks/useDarkMode';
import HelpModal, { HelpButton } from '../HelpModal';
import { pageHelp } from '../../utils/pageHelp';

interface LayoutProps {
  children: ReactNode;
}

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
}

function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const { canManageUsers, canManageStructure } = usePermission();
  const { isDark, toggleDark } = useDarkMode();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  const currentHelp = pageHelp[location.pathname];

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

  async function handleRevokeMySessions() {
    if (!window.confirm('This will log you out of all devices, including this one. Continue?')) return;
    try {
      await revokeMySessions();
    } catch {
      // best-effort — user gets logged out locally regardless of outcome
    } finally {
      clearAuth();
      navigate('/login');
    }
  }

  const navItems: NavItem[] = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/categories', label: 'Categories', icon: FolderTree },
    { to: '/suppliers', label: 'Suppliers', icon: Truck },
    { to: '/products', label: 'Products', icon: Package },
    { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
    ...(canManageUsers ? [{ to: '/invitations', label: 'Invitations', icon: Mail }] : []),
    ...(canManageUsers ? [{ to: '/users', label: 'Users', icon: UsersIcon }] : []),
  ];

  const baseLinkClass = 'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors';
  const linkClass = `${baseLinkClass} text-ink/70 hover:bg-accent/10 hover:text-accent`;

  return (
    <div className="bg-background text-ink min-h-screen">
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-ink/10 bg-surface">
        <h1 className="font-display text-lg font-semibold">WTF Inventory</h1>
        <button onClick={() => setSidebarOpen(true)} className="p-2">
          <Menu size={20} />
        </button>
      </div>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-ink/50 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-surface border-r border-ink/10 flex flex-col transform transition-all duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 ${desktopCollapsed ? 'md:w-16' : 'md:w-64'} w-64`}
      >
        <div className="px-4 py-6 flex items-center justify-between">
          {!desktopCollapsed && (
            <h1 className="font-display text-xl font-semibold tracking-tight md:block hidden">
              WTF Inventory
            </h1>
          )}
          <h1 className="font-display text-xl font-semibold tracking-tight md:hidden">
            WTF Inventory
          </h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded hover:bg-accent/10 hover:text-accent transition-colors md:hidden"
          >
            <X size={18} />
          </button>
          <button
            onClick={() => setDesktopCollapsed((prev) => !prev)}
            className="hidden md:flex p-1 rounded hover:bg-accent/10 hover:text-accent transition-colors"
          >
            {desktopCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${baseLinkClass} ${
                  isActive
                    ? 'bg-accent/10 text-accent'
                    : 'text-ink/70 hover:bg-accent/10 hover:text-accent'
                }`
              }
              onClick={() => setSidebarOpen(false)}
              title={desktopCollapsed ? label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              <span className={desktopCollapsed ? 'md:hidden' : ''}>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-6 space-y-1 border-t border-ink/10">
          <button onClick={toggleDark} className={`${linkClass} w-full`} title={desktopCollapsed ? 'Toggle theme' : undefined}>
            {isDark ? <Sun size={18} className="shrink-0" /> : <Moon size={18} className="shrink-0" />}
            <span className={desktopCollapsed ? 'md:hidden' : ''}>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button onClick={handleLogout} className={`${linkClass} w-full`} title={desktopCollapsed ? 'Log out' : undefined}>
            <LogOut size={18} className="shrink-0" />
            <span className={desktopCollapsed ? 'md:hidden' : ''}>Log Out</span>
          </button>
          <button onClick={handleRevokeMySessions} className={`${linkClass} w-full`} title={desktopCollapsed ? 'Log out everywhere' : undefined}>
            <ShieldOff size={18} className="shrink-0" />
            <span className={desktopCollapsed ? 'md:hidden' : ''}>Log Out Everywhere</span>
          </button>
        </div>
      </aside>

      <div className={desktopCollapsed ? 'md:ml-16' : 'md:ml-64'}>
        {currentHelp && (
          <div className="flex justify-end px-6 pt-4">
            <HelpButton onClick={() => setShowHelp(true)} />
          </div>
        )}
        <main className="p-6">{children}</main>
      </div>

      {showHelp && currentHelp && (
        <HelpModal title={currentHelp.title} onClose={() => setShowHelp(false)}>
          <p>{currentHelp.description}</p>
          <ul className="list-disc list-inside space-y-1">
            {currentHelp.everyone.map((item) => (
              <li key={item}>{item}</li>
            ))}
            {canManageStructure && currentHelp.managers?.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </HelpModal>
      )}
    </div>
  );
}

export default Layout;