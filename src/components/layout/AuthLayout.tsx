import { type ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-semibold tracking-tight">WTF Inventory</h1>
          <p className="text-sm text-ink/60 mt-1">{title}</p>
          {subtitle && <p className="text-xs text-ink/50 mt-1">{subtitle}</p>}
        </div>
        <div className="bg-surface border border-ink/10 rounded-xl p-6">{children}</div>
      </div>
    </div>
  );
}

export default AuthLayout;