import React from 'react';
import { Trash2, X, CheckSquare } from 'lucide-react';
import { Button } from './Button.jsx';

/**
 * Reusable Mobile-Responsive Bulk Action Bar for multi-selected table rows
 */
export const BulkActionBar = ({
  selectedCount = 0,
  onClear,
  onDelete,
  entityName = 'items',
  deleting = false,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-slate-900 text-white p-3 sm:px-4 sm:py-3.5 rounded-2xl shadow-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-slate-800 text-rose-400 flex items-center justify-center font-bold text-xs shrink-0">
          <CheckSquare className="w-4 h-4" />
        </div>
        <div className="leading-tight">
          <div className="font-extrabold text-sm font-mono text-white inline-flex items-center gap-1">
            <span>{selectedCount}</span>
            <span className="text-xs font-normal text-slate-300 font-sans">
              selected
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            {entityName} selected across list
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClear}
          disabled={deleting}
          className="text-xs text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white px-2.5 py-1.5"
        >
          <X className="w-3.5 h-3.5 mr-1" />
          Clear
        </Button>

        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={onDelete}
          loading={deleting}
          icon={Trash2}
          className="text-xs font-bold shadow-sm px-3 py-1.5"
        >
          <span className="hidden sm:inline">Delete Selected ({selectedCount})</span>
          <span className="sm:hidden">Delete ({selectedCount})</span>
        </Button>
      </div>
    </div>
  );
};
