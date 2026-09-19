import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'blue' | 'amber' | 'purple' | 'slate' | 'rose';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'blue',
  className = '',
  icon,
}) => {
  const variantStyles = {
    emerald: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60',
    blue: 'bg-blue-950/60 text-blue-400 border-blue-800/60',
    amber: 'bg-amber-950/60 text-amber-400 border-amber-800/60',
    purple: 'bg-purple-950/60 text-purple-400 border-purple-800/60',
    slate: 'bg-slate-800 text-slate-300 border-slate-700',
    rose: 'bg-rose-950/60 text-rose-400 border-rose-800/60',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="w-3.5 h-3.5">{icon}</span>}
      {children}
    </span>
  );
};
