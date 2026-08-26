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
    <div className="bg-[#E0F2FE] text-[#0C4A6E] p-3 sm:px-4 sm:py-3.5 rounded-2xl shadow-md border border-[#BAE6FD] flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-[#0284C7] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
          <CheckSquare className="w-4 h-4" />
        </div>
        <div className="leading-tight">
          <div className="font-extrabold text-sm font-mono text-[#0C4A6E] inline-flex items-center gap-1">
            <span>{selectedCount}</span>
            <span className="text-xs font-normal text-[#0369A1] font-sans">
              selected
            </span>
          </div>
          <p className="text-[11px] text-[#0369A1] hidden sm:block font-medium">
            {entityName} selected across list
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onClear}
          disabled={deleting}
          className="bg-white hover:bg-[#F0F9FF] text-[#0C4A6E] border border-[#BAE6FD] text-xs font-bold px-3 py-1.5 rounded-xl transition-all inline-flex items-center gap-1 shadow-2xs disabled:opacity-50"
        >
          <X className="w-3.5 h-3.5 text-[#0369A1]" />
          <span>Clear</span>
        </button>

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
