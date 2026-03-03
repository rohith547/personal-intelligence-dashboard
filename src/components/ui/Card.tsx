import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}

export default function Card({ children, className = '', title, subtitle, action }: CardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            {title && <h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>}
            {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={title || action ? 'px-5 pb-5' : 'p-5'}>{children}</div>
    </div>
  );
}
