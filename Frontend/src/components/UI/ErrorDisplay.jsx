import { AlertCircle, X } from 'lucide-react';

export function ErrorDisplay({ error, onClose }) {
  if (!error) return null;

  return (
    <div className="mx-4 mt-4 flex items-center justify-between gap-3 rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-100 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-2">
        <AlertCircle size={18} />
        <span className="font-medium">{error}</span>
      </div>
      {onClose && (
        <button 
          onClick={onClose}
          className="rounded-lg p-1 hover:bg-red-100 transition-colors"
          aria-label="Dismiss error"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
