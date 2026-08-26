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
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui/Table.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { ErrorState } from '../../components/ui/ErrorState.jsx';
import { ConfirmDialog } from '../../components/ui/Modal.jsx';
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

  // Delete Confirmation State
  const [deletingRecord, setDeletingRecord] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const toast = useToast();

  const fetchOutstandingData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/outstanding', {
        params: { search, page, limit: 15 },
      });

      const recordList = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.records)
        ? res.records
        : Array.isArray(res)
        ? res
        : [];

      setRecords(recordList);
      setSummary(res.summary || res.meta?.summary || null);
      setTotalPages(res.pagination?.totalPages || res.meta?.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch outstanding dues:', err);
      setError(err.message || 'Customer outstanding records load nahi ho paaye.');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

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

  const handleConfirmDelete = async () => {
    if (!deletingRecord) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/outstanding/${deletingRecord._id}`);
      toast.success(`${deletingRecord.customerName} ka baaki dues record delete ho gaya!`);
      setDeletingRecord(null);
      fetchOutstandingData();
    } catch (err) {
      toast.error(err.message || 'Record delete karne me error aaya.');
    } finally {
      setDeleteLoading(false);
    }
  };

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
            placeholder="Customer name, phone number, bike, address se search karein..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            onClear={() => {
              setSearch('');
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
        <Card noPadding className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow hover={false}>
                <TableHead>Tareekh (Date)</TableHead>
                <TableHead>Customer Name</TableHead>
                <TableHead>Phone / Mobile</TableHead>
                <TableHead>Bike Name</TableHead>
                <TableHead>Address (Pata)</TableHead>
                <TableHead className="text-right">Baaki Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((r) => (
                <TableRow key={r._id} hover={false}>
                  <TableCell>
                    <span className="font-mono text-xs text-slate-700 font-medium">
                      {formatDate(r.date)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-slate-900">{r.customerName}</div>
                    {r.notes && (
                      <div className="text-[11px] text-slate-400 italic max-w-xs truncate">
                        {r.notes}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
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
                        <MessageSquare className="w-4 h-4" />
                      </a>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-xs text-slate-800 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                      {r.bikeName}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-600 font-medium">
                      {r.address || '—'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 font-mono font-bold text-xs">
                      {formatINR(r.pendingAmount)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
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
                        onClick={() => setDeletingRecord(r)}
                        title="Delete Record"
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

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

      {/* Delete Confirmation Dialog */}
      {deletingRecord && (
        <ConfirmDialog
          isOpen={Boolean(deletingRecord)}
          onClose={() => setDeletingRecord(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Customer Dues Record?"
          message={`Kya aap ${deletingRecord.customerName} (Bike: ${deletingRecord.bikeName}) ke ${formatINR(deletingRecord.pendingAmount)} baaki dues record ko delete karna chahte hain? Pehle se save kiya hua data hamesha ke liye remove ho jayega.`}
          confirmText="Yes, Delete Record"
          cancelText="Cancel"
          variant="danger"
          loading={deleteLoading}
        />
      )}
    </div>
  );
};
