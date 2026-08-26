import React from 'react';
import { Trash2, X, CheckSquare } from 'lucide-react';
import { Button } from './Button.jsx';

/**
 * Reusable Bulk Action Bar for multi-selected table rows
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
    <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-800 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-slate-800 text-rose-400 flex items-center justify-center font-bold text-xs">
          <CheckSquare className="w-4 h-4" />
        </div>
        <div>
          <span className="font-extrabold text-sm font-mono text-white">
            {selectedCount}
          </span>{' '}
          <span className="text-xs text-slate-300 font-medium">
            {entityName} selected
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClear}
          disabled={deleting}
          className="text-xs text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white"
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
          className="text-xs font-bold shadow-sm"
        >
          Delete Selected ({selectedCount})
        </Button>
      </div>
    </div>
  );
};
