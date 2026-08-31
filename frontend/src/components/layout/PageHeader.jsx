import React, { useEffect, useState } from 'react';
import { ChevronRight, HelpCircle, BookOpen, CheckCircle2, Lightbulb, X, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PAGE_HELP_GUIDES } from '../../config/pageHelpGuides.js';
import { Modal } from '../ui/Modal.jsx';

export const PageHeader = ({
  title,
  subtitle,
  breadcrumbs = [],
  action,
  actions,
  className = '',
  showHelp = true,
}) => {
  const [showHelpModal, setShowHelpModal] = useState(false);

  useEffect(() => {
    if (title) {
      document.title = `${title} | National Auto Garage`;
    }
    return () => {
      document.title = 'National Auto Garage';
    };
  }, [title]);

  const guide = PAGE_HELP_GUIDES[title] || {
    title: `${title} Guide`,
    summary: `${title} page ko use karne ki step-by-step jankari.`,
    steps: [
      `Form inputs me details bharein aur Submit button dabayein.`,
      `Table list me records ko search, filter, ya delete karein.`,
    ],
    tips: [
      `Sleek design aur 100% fast performance ke saath data manage karein.`,
    ],
  };

  return (
    <>
      <div className={`bg-white/85 backdrop-blur-2xl border border-white/90 p-5 sm:p-6 rounded-3xl shadow-md shadow-slate-200/40 mb-6 ${className}`}>
        {/* Breadcrumb Navigation */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-2.5 flex items-center gap-1.5 text-xs text-slate-500 font-bold">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={idx}>
                  {crumb.to && !isLast ? (
                    <Link
                      to={crumb.to}
                      className="hover:text-[#0284C7] transition-colors font-bold hover:underline"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className={isLast ? 'text-slate-900 font-extrabold' : ''}>
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-6 rounded-full bg-gradient-to-b from-[#0284C7] to-blue-600 inline-block shrink-0 shadow-xs" />
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                {title}
              </h1>
            </div>
            {subtitle && (
              <p className="text-xs text-slate-600 font-medium mt-1 pl-4.5 max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2.5 flex-wrap flex-shrink-0">
            {showHelp && (
              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                title="Page Usage Instructions & Help"
                className="px-3.5 py-2 rounded-2xl bg-sky-50/90 text-[#0284C7] hover:bg-[#0284C7] hover:text-white border border-sky-200/80 transition-all flex items-center gap-1.5 text-xs font-black uppercase tracking-wider shadow-2xs active:scale-95 group cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                <span>How to Use</span>
              </button>
            )}
            {action || actions}
          </div>
        </div>
      </div>

      {/* Interactive Page Help Modal */}
      <Modal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        title={guide.title || `${title} Operating Guide`}
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-sky-50/90 border border-sky-200/80 text-[#0C4A6E] text-xs font-medium leading-relaxed flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-[#0284C7] shrink-0 mt-0.5" />
            <div>
              <span className="font-black block text-slate-900 text-xs mb-0.5 uppercase tracking-wider">Page Overview</span>
              {guide.summary}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#0284C7]" /> Step-by-Step Instructions:
            </h4>
            <ul className="space-y-2">
              {guide.steps?.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium bg-slate-50/90 p-3 rounded-2xl border border-slate-200/80">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {guide.tips && guide.tips.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Helpful Tips:
              </h4>
              <ul className="space-y-1">
                {guide.tips.map((tip, idx) => (
                  <li key={idx} className="text-xs text-slate-600 font-medium pl-4 relative before:content-['•'] before:absolute before:left-1 before:text-[#0284C7]">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <Link
              to="/help"
              onClick={() => setShowHelpModal(false)}
              className="text-xs font-bold text-[#0284C7] hover:underline flex items-center gap-1"
            >
              Open Full System Manual & User Guide
            </Link>
            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
