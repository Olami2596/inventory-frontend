import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';

function NotFound() {
  return (
    <AuthLayout title="Page not found">
      <div className="flex flex-col items-center text-center py-4">
        <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-4">
          <Compass size={24} className="text-accent" />
        </div>
        <p className="font-mono text-4xl font-semibold tracking-tight mb-2">404</p>
        <p className="text-sm text-ink/60 mb-6">
          The page you're looking for doesn't exist or may have moved.
        </p>
        <Link
          to="/dashboard"
          className="w-full bg-accent text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all text-center"
        >
          Go to Dashboard
        </Link>
      </div>
    </AuthLayout>
  );
}

export default NotFound;