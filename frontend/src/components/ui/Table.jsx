import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button.jsx';

export const Table = ({ children, className = '' }) => {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs">
      <table className={`w-full text-left text-sm text-slate-900 ${className}`}>{children}</table>
    </div>
  );
};

export const TableHeader = ({ children }) => {
  return (
    <thead className="bg-slate-50 border-b border-slate-200 text-xs font-extrabold text-slate-700 uppercase tracking-wider">
      {children}
    </thead>
  );
};

export const TableBody = ({ children }) => {
  return <tbody className="divide-y divide-slate-100">{children}</tbody>;
};

export const TableRow = ({ children, onClick, className = '', hover = true }) => {
  return (
    <tr
      onClick={onClick}
      className={`transition-colors ${hover ? 'hover:bg-slate-50/80' : ''} ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </tr>
  );
};

export const TableHead = ({ children, className = '' }) => {
  return <th className={`px-4 py-3.5 whitespace-nowrap ${className}`}>{children}</th>;
};

export const TableCell = ({ children, className = '' }) => {
  return <td className={`px-4 py-3.5 whitespace-nowrap text-slate-900 font-medium ${className}`}>{children}</td>;
};

export const TableHeadCheckbox = ({ checked, onChange }) => {
  return (
    <th className="w-10 px-3 py-3.5 whitespace-nowrap text-center">
      <input
        type="checkbox"
        checked={Boolean(checked)}
        onChange={onChange}
        className="w-4 h-4 rounded border-slate-300 text-[#0284C7] focus:ring-[#0284C7] cursor-pointer bg-white"
      />
    </th>
  );
};

export const TableCellCheckbox = ({ checked, onChange }) => {
  return (
    <td className="w-10 px-3 py-3.5 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
      <input
        type="checkbox"
        checked={Boolean(checked)}
        onChange={onChange}
        className="w-4 h-4 rounded border-slate-300 text-[#0284C7] focus:ring-[#0284C7] cursor-pointer bg-white"
      />
    </td>
  );
};

export const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, totalRecords } = pagination;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50 rounded-b-2xl text-xs text-slate-600">
      <div>
        Showing page <span className="font-extrabold text-slate-900">{page}</span> of{' '}
        <span className="font-extrabold text-slate-900">{totalPages}</span> ({totalRecords} total items)
      </div>
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          icon={ChevronLeft}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};
