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
        <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-1.5 text-xs text-[#0369A1]">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {crumb.to && !isLast ? (
                  <Link
                    to={crumb.to}
                    className="hover:text-[#0C4A6E] transition-colors font-medium hover:underline"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={isLast ? 'text-[#0C4A6E] font-semibold' : ''}>
                    {crumb.label}
                  </span>
                )}
                {!isLast && <ChevronRight className="w-3.5 h-3.5 text-[#7DD3FC] flex-shrink-0" />}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      {/* Main Header Content */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-6 rounded-full bg-[#0284C7] inline-block" />
            <h1 className="text-xl sm:text-2xl font-black text-[#0C4A6E] tracking-tight">
              {title}
            </h1>
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[#0369A1] font-medium mt-1 pl-4">
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
