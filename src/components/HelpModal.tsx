import { type ReactNode, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface HelpButtonProps {
  onClick: () => void;
}

export function HelpButton({ onClick }: HelpButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Help"
      title="Help"
      className="p-1.5 rounded-md bg-ink/5 text-ink/60 hover:bg-accent/10 hover:text-accent active:scale-[0.95] transition-all"
    >
      <HelpCircle size={16} />
    </button>
  );
}

interface HelpModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

function HelpModal({ title, onClose, children }: HelpModalProps) {
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-ink/50 flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface border border-ink/10 rounded-xl p-6 max-w-md w-full"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded hover:bg-ink/5 text-ink/60 hover:text-ink transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="text-sm text-ink/70 space-y-3">{children}</div>
      </div>
    </div>
  );
}

export default HelpModal;