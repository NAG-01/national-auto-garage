import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button.jsx';

export const Table = ({ children, className = '' }) => {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-[#BAE6FD] bg-white shadow-2xs">
      <table className={`w-full text-left text-sm text-[#0C4A6E] ${className}`}>{children}</table>
    </div>
  );
};

export const TableHeader = ({ children }) => {
  return (
    <thead className="bg-[#F0F9FF] border-b border-[#BAE6FD] text-xs font-extrabold text-[#0C4A6E] uppercase tracking-wider">
      {children}
    </thead>
  );
};

export const TableBody = ({ children }) => {
  return <tbody className="divide-y divide-[#E0F2FE]">{children}</tbody>;
};

export const TableRow = ({ children, onClick, className = '', hover = true }) => {
  return (
    <tr
      onClick={onClick}
      className={`transition-colors ${hover ? 'hover:bg-[#F0F9FF]' : ''} ${
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
  return <td className={`px-4 py-3.5 whitespace-nowrap text-[#0C4A6E] font-medium ${className}`}>{children}</td>;
};

export const TableHeadCheckbox = ({ checked, onChange }) => {
  return (
    <th className="w-10 px-3 py-3.5 whitespace-nowrap text-center">
      <input
        type="checkbox"
        checked={Boolean(checked)}
        onChange={onChange}
        className="w-4 h-4 rounded border-[#7DD3FC] text-[#0284C7] focus:ring-[#0284C7] cursor-pointer bg-white"
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
        className="w-4 h-4 rounded border-[#7DD3FC] text-[#0284C7] focus:ring-[#0284C7] cursor-pointer bg-white"
      />
    </td>
  );
};

export const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, totalRecords } = pagination;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-[#BAE6FD] bg-[#F0F9FF] rounded-b-2xl text-xs text-[#0369A1]">
      <div>
        Showing page <span className="font-extrabold text-[#0C4A6E]">{page}</span> of{' '}
        <span className="font-extrabold text-[#0C4A6E]">{totalPages}</span> ({totalRecords} total items)
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
