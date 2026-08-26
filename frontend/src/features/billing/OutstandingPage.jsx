import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertCircle,
  Plus,
  Pencil,
  Trash2,
  Phone,
  MessageSquare,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import api from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { KpiCard } from '../../components/ui/KpiCard.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { SearchInput } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Table } from '../../components/ui/Table.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { ErrorState } from '../../components/ui/ErrorState.jsx';
import { OutstandingModal } from './OutstandingModal.jsx';
import { formatPhone, formatDate, formatINR } from '../../utils/formatters.js';

export const OutstandingPage = () => {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const toast = useToast();

  const fetchOutstandingData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/outstanding', {
        params: { search, page, limit: 15 },
      });
      setRecords(res.data || []);
      setSummary(res.meta?.summary || null);
      setTotalPages(res.meta?.pagination?.totalPages || 1);
    } catch (err) {
      setError(err.message || 'Failed to load customer dues records.');
      toast.error('Failed to load customer dues records.');
    } finally {
      setLoading(false);
    }
  }, [search, page, toast]);

  useEffect(() => {
    fetchOutstandingData();
  }, [fetchOutstandingData]);

  const handleOpenAddModal = () => {
    setEditingRecord(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (record) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  const handleDeleteRecord = async (record) => {
    const confirmDelete = window.confirm(
      `Kya aap ${record.customerName} ke ₹${record.pendingAmount} baaki dues record ko delete karna chahte hain?`
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/outstanding/${record._id}`);
      toast.success(`${record.customerName} ka record delete ho gaya!`);
      fetchOutstandingData();
    } catch (err) {
      toast.error(err.message || 'Record delete karne me error aaya.');
    }
  };

  const columns = [
    {
      header: 'Date',
      accessor: 'date',
      render: (r) => (
        <span className="font-mono text-xs text-slate-700 font-medium">
          {formatDate(r.date)}
        </span>
      ),
    },
    {
      header: 'Customer Name',
      accessor: 'customerName',
      render: (r) => (
        <div>
          <div className="font-bold text-slate-900">{r.customerName}</div>
          {r.notes && (
            <div className="text-[11px] text-slate-400 italic max-w-xs truncate">
              {r.notes}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Phone / Mobile',
      accessor: 'mobileNumber',
      render: (r) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-slate-700 font-semibold">
            {formatPhone(r.mobileNumber)}
          </span>
          <a
            href={`https://api.whatsapp.com/send?phone=91${r.mobileNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
            title="Send WhatsApp Message"
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </a>
        </div>
      ),
    },
    {
      header: 'Bike Name',
      accessor: 'bikeName',
      render: (r) => (
        <span className="font-semibold text-xs text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {r.bikeName}
        </span>
      ),
    },
    {
      header: 'Address (Pata)',
      accessor: 'address',
      render: (r) => (
        <span className="text-xs text-slate-600 font-medium">
          {r.address || '—'}
        </span>
      ),
    },
    {
      header: 'Baaki Amount',
      accessor: 'pendingAmount',
      className: 'text-right font-mono font-bold text-xs',
      render: (r) => (
        <span className="text-orange-900 bg-orange-100 px-2.5 py-1 rounded border border-orange-300">
          {formatINR(r.pendingAmount)}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      className: 'text-right',
      render: (r) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            icon={Pencil}
            onClick={() => handleOpenEditModal(r)}
            title="Edit Record"
          />
          <Button
            variant="ghost"
            size="sm"
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            icon={Trash2}
            onClick={() => handleDeleteRecord(r)}
            title="Delete Record"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Outstanding & Dues Register"
        subtitle="Kiske paas kitne paise baaki hain unka manual text record rakhein (Add, Edit, Delete)"
        actions={
          <Button variant="accent" icon={Plus} onClick={handleOpenAddModal}>
            + Naya Baaki / Dues Add Karein
          </Button>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <KpiCard
          title="Kul Baaki Rashi (Total Dues)"
          value={formatINR(summary?.totalPendingAmount ?? 0)}
          icon={AlertCircle}
          variant="danger"
        />
        <KpiCard
          title="Kul Customer Dues Entries"
          value={summary?.totalRecordsCount ?? '—'}
          icon={FileText}
          variant="accent"
        />
      </div>

      {/* Search Bar */}
      <Card noPadding className="p-4">
        <div className="w-full xl:max-w-md">
          <SearchInput
            placeholder="Customer name, phone number, bike ya address search karein..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </Card>

      {/* Table Content */}
      {loading ? (
        <Card className="p-6">
          <Skeleton rows={6} />
        </Card>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchOutstandingData} />
      ) : records.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title={search ? 'Koi matching baaki record nahi mila' : 'Kisi bhi customer ka baaki nahi hai! 🎉'}
          description={
            search
              ? `'${search}' ke naam ya number par koi baaki dues record nahi hai.`
              : 'Naye customer ke baaki dues add karne ke liye upar "+ Naya Baaki / Dues Add Karein" button par click karein.'
          }
          actionLabel={search ? 'Clear Search' : '+ Add New Dues Record'}
          onAction={search ? () => setSearch('') : handleOpenAddModal}
        />
      ) : (
        <Card className="overflow-hidden">
          <Table columns={columns} data={records} />

          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                Page <strong className="text-slate-800">{page}</strong> of{' '}
                <strong className="text-slate-800">{totalPages}</strong>
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <OutstandingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          record={editingRecord}
          onSuccess={fetchOutstandingData}
        />
      )}
    </div>
  );
};
