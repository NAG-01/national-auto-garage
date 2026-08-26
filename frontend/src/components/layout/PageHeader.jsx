import React, { useEffect } from 'react';
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
  useEffect(() => {
    if (title) {
      document.title = `${title} | National Auto Garage`;
    }
    return () => {
      document.title = 'National Auto Garage';
    };
  }, [title]);

  return (
    <div className={`bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs mb-5 ${className}`}>
      {/* Breadcrumb Navigation */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-1.5 text-xs text-slate-500">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {crumb.to && !isLast ? (
                  <Link
                    to={crumb.to}
                    className="hover:text-slate-900 transition-colors font-medium hover:underline"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={isLast ? 'text-slate-900 font-semibold' : ''}>
                    {crumb.label}
                  </span>
                )}
                {!isLast && <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      {/* Main Header Content */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-5 rounded-full bg-[#0284C7] inline-block shrink-0" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {title}
            </h1>
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 font-medium mt-1 pl-3.5">
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
