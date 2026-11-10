import React, { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: ReactNode;
  accentColor?: 'teal' | 'blue' | 'amber' | 'emerald' | 'rose' | 'indigo' | 'slate';
  onClick?: () => void;
  isActive?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  accentColor = 'teal',
  onClick,
  isActive = false,
}) => {
  const getTheme = () => {
    switch (accentColor) {
      case 'rose':
        return {
          iconBox: 'bg-rose-50 text-rose-700 border-rose-200/60',
          activeRing: 'border-rose-500 ring-2 ring-rose-100',
          hoverBorder: 'hover:border-rose-300',
        };
      case 'amber':
        return {
          iconBox: 'bg-amber-50 text-amber-700 border-amber-200/60',
          activeRing: 'border-amber-500 ring-2 ring-amber-100',
          hoverBorder: 'hover:border-amber-300',
        };
      case 'emerald':
        return {
          iconBox: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
          activeRing: 'border-emerald-500 ring-2 ring-emerald-100',
          hoverBorder: 'hover:border-emerald-300',
        };
      case 'blue':
        return {
          iconBox: 'bg-blue-50 text-blue-700 border-blue-200/60',
          activeRing: 'border-blue-500 ring-2 ring-blue-100',
          hoverBorder: 'hover:border-blue-300',
        };
      case 'indigo':
        return {
          iconBox: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
          activeRing: 'border-indigo-500 ring-2 ring-indigo-100',
          hoverBorder: 'hover:border-indigo-300',
        };
      case 'slate':
        return {
          iconBox: 'bg-slate-100 text-slate-700 border-slate-200',
          activeRing: 'border-slate-500 ring-2 ring-slate-100',
          hoverBorder: 'hover:border-slate-300',
        };
      case 'teal':
      default:
        return {
          iconBox: 'bg-teal-50 text-teal-800 border-teal-200/60',
          activeRing: 'border-teal-600 ring-2 ring-teal-100',
          hoverBorder: 'hover:border-teal-300',
        };
    }
  };

  const theme = getTheme();

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`relative bg-white rounded-xl p-5 border border-slate-200 shadow-xs transition-all duration-150 flex flex-col justify-between ${
        onClick
          ? `cursor-pointer hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${theme.hoverBorder}`
          : ''
      } ${isActive ? theme.activeRing : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={`p-2 rounded-lg border flex-shrink-0 ${theme.iconBox}`}>
          {icon}
        </div>
      </div>

      <div className="mt-3">
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
          {value}
        </div>
        {subtitle && (
          <p className="mt-1 text-xs text-slate-500 font-medium truncate">{subtitle}</p>
        )}
      </div>
    </div>
  );
};
