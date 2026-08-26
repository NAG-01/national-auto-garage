import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarClock, Layers } from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { Badge } from '../ui/Badge.jsx';
import { PageHeader } from './PageHeader.jsx';

export const ModulePlaceholder = ({
  moduleName,
  phaseNumber,
  description,
  breadcrumbs = [],
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        title={moduleName}
        subtitle={`Scheduled for development in Phase ${phaseNumber}`}
        breadcrumbs={breadcrumbs}
      />

      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-4 border border-orange-100 shadow-2xs">
          <CalendarClock className="w-7 h-7" />
        </div>

        <div className="flex justify-center mb-2">
          <Badge variant="accent" size="sm">
            Phase {phaseNumber} Roadmap
          </Badge>
        </div>

        <h3 className="text-xl font-bold text-slate-900 tracking-tight mt-2">{moduleName} Module</h3>
        <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
          {description ||
            `The ${moduleName} business logic and UI will be implemented progressively in Phase ${phaseNumber} per the approved roadmap.`}
        </p>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="primary"
            size="md"
            icon={Layers}
            onClick={() => navigate('/design-system')}
          >
            Explore Phase 2 Design System
          </Button>
        </div>
      </div>
    </div>
  );
};
