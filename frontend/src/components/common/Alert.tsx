import React from 'react';
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-react';

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  message,
  onClose,
}) => {
  const styles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error: 'bg-rose-50 border-rose-200 text-rose-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 mr-3 flex-shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 mr-3 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />,
  };

  return (
    <div className={`border rounded-lg p-4 mb-4 flex items-start justify-between ${styles[type]}`}>
      <div className="flex items-start">
        {icons[type]}
        <div>
          {title && <h4 className="text-sm font-semibold mb-0.5">{title}</h4>}
          <p className="text-sm leading-relaxed">{message}</p>
        </div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-slate-400 hover:text-slate-600 transition-colors p-1"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
