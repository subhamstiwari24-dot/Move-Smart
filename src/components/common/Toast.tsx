import React from 'react';
import { useIncidents } from '../../context/IncidentContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast, hideToast } = useIncidents();

  if (!toast.show) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-[#15803D] flex-shrink-0 mt-0.5" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-[#DC2626] flex-shrink-0 mt-0.5" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-[#EA580C] flex-shrink-0 mt-0.5" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-[#0F766E] flex-shrink-0 mt-0.5" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return 'border-emerald-200 bg-white';
      case 'error':
        return 'border-red-200 bg-white';
      case 'warning':
        return 'border-amber-200 bg-white';
      case 'info':
      default:
        return 'border-teal-200 bg-white';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in slide-in-from-bottom-5 fade-in duration-200">
      <div className={`flex items-start gap-3 p-3.5 rounded-xl shadow-xl border ${getBorderColor()} transition-all`}>
        {getIcon()}
        <div className="flex-1 pr-2">
          <p className="text-xs font-bold text-slate-900 leading-snug">{toast.message}</p>
        </div>
        <button
          onClick={hideToast}
          className="text-slate-400 hover:text-slate-600 transition-colors p-1 -mr-1 -mt-1 rounded-lg hover:bg-slate-100"
          aria-label="Close notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
