import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PageHeader = ({
  title,
  subtitle,
  breadcrumbs = [],
  action,
  actions,
  className = '',
}) => {
  return (
    <div className={`mb-6 md:mb-8 ${className}`}>
      {/* Breadcrumb Navigation */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {crumb.to && !isLast ? (
                  <Link
                    to={crumb.to}
                    className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-medium hover:underline"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={isLast ? 'text-slate-900 dark:text-slate-100 font-semibold' : ''}>
                    {crumb.label}
                  </span>
                )}
                {!isLast && <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      {/* Main Header Content */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-6 rounded-full bg-[#4F46E5] dark:bg-[#6366F1] inline-block" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
              {title}
            </h1>
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 pl-4">
              {subtitle}
            </p>
          )}
        </div>
        {(action || actions) && (
          <div className="flex items-center gap-2.5 flex-wrap flex-shrink-0">
            {action || actions}
          </div>
        )}
      </div>
    </div>
  );
};
