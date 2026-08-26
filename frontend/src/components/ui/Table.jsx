import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button.jsx';

export const Table = ({ children, className = '' }) => {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 dark:border-[#263449] bg-white dark:bg-[#172033] shadow-2xs transition-colors duration-200">
      <table className={`w-full text-left text-sm text-slate-600 dark:text-slate-300 ${className}`}>{children}</table>
    </div>
  );
};

export const TableHeader = ({ children }) => {
  return (
    <thead className="bg-[#F8FAFC] dark:bg-[#111827] border-b border-slate-200 dark:border-[#263449] text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
      {children}
    </thead>
  );
};

export const TableBody = ({ children }) => {
  return <tbody className="divide-y divide-slate-100 dark:divide-[#263449]">{children}</tbody>;
};

export const TableRow = ({ children, onClick, className = '', hover = true }) => {
  return (
    <tr
      onClick={onClick}
      className={`transition-colors ${hover ? 'hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]' : ''} ${
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
  return <td className={`px-4 py-3.5 whitespace-nowrap text-slate-800 dark:text-slate-200 ${className}`}>{children}</td>;
};

export const TableHeadCheckbox = ({ checked, onChange }) => {
  return (
    <th className="w-10 px-3 py-3.5 whitespace-nowrap text-center">
      <input
        type="checkbox"
        checked={Boolean(checked)}
        onChange={onChange}
        className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer bg-white dark:bg-slate-800"
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
        className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer bg-white dark:bg-slate-800"
      />
    </td>
  );
};

export const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, totalRecords } = pagination;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-[#263449] bg-slate-50/50 dark:bg-[#111827]/50 rounded-b-2xl text-xs text-slate-500 dark:text-slate-400">
      <div>
        Showing page <span className="font-extrabold text-slate-700 dark:text-slate-200">{page}</span> of{' '}
        <span className="font-extrabold text-slate-700 dark:text-slate-200">{totalPages}</span> ({totalRecords} total items)
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
