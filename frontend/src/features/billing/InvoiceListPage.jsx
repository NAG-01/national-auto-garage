import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Plus, Eye, Trash2, Phone } from 'lucide-react';
import api from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { SearchInput, Select } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Pagination,
} from '../../components/ui/Table.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import { TableSkeleton } from '../../components/ui/Skeleton.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { ErrorState } from '../../components/ui/ErrorState.jsx';
import { ConfirmDialog } from '../../components/ui/Modal.jsx';
import { BillCreateModal } from './BillCreateModal.jsx';
import { BillPreviewModal } from './BillPreviewModal.jsx';
import { formatPhone, formatDate, formatINR, formatRegNumber } from '../../utils/formatters.js';

export const InvoiceListPage = () => {
  const [bills, setBills] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Modals State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  // Delete Bill Confirmation State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const toast = useToast();

  const fetchBills = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    setFetching(true);
    setError(null);
    try {
      const res = await api.get('/invoices', {
        params: { search, paymentStatus: statusFilter, page, limit: 15 },
      });
      const dataPayload = res.data || res;
      const billsList = Array.isArray(dataPayload)
        ? dataPayload
        : dataPayload.invoices || res.invoices || [];
      const paginationData = res.meta?.pagination || res.pagination || null;

      setBills(billsList);
      setPagination(paginationData);
    } catch (err) {
      console.error('Failed to fetch bills:', err);
      setError(err.message || 'Failed to load bills list.');
    } finally {
      setLoading(false);
      setFetching(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    fetchBills(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBills(false);
    }, 150);
    return () => clearTimeout(timer);
  }, [fetchBills]);

  // Handle Delete Bill
  const handleDeleteBill = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/invoices/${deleteTarget._id}`);
      toast.success('Bill deleted successfully.');
      fetchBills(false);
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete bill.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const [isNewGeneration, setIsNewGeneration] = useState(false);

  const handleBillCreated = (createdBill) => {
    fetchBills(false);
    setSelectedBill(createdBill);
    setIsNewGeneration(true);
    setPreviewModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bills & Invoices"
        subtitle="Customer ke bill banayein, PDF receipt download karein aur WhatsApp par bhejenn."
      />

      {/* Filter, Search & Single Create Bill Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
          <div className="w-full sm:w-80">
            <SearchInput
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              onClear={() => {
                setSearch('');
                setPage(1);
              }}
              placeholder="Search Bill No, Customer, Phone..."
            />
          </div>
        </div>

        <Button
          variant="accent"
          size="md"
          icon={Plus}
          onClick={() => setCreateModalOpen(true)}
          className="w-full sm:w-auto shrink-0 whitespace-nowrap"
        >
          Create New Bill
        </Button>
      </div>

      {/* Main Table Viewport */}
      <div className="min-h-[420px] relative">
        {loading ? (
          <TableSkeleton rows={6} cols={7} />
        ) : error ? (
          <ErrorState message={error} onRetry={() => fetchBills(true)} />
        ) : bills.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No bills found"
            description={
              search || statusFilter
                ? 'No bills match your active search or payment status filter.'
                : 'Create your first bill invoice for a customer.'
            }
            actionText="Create New Bill"
            onAction={() => setCreateModalOpen(true)}
          />
        ) : (
          <div className={`space-y-4 transition-opacity ${fetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <Table>
              <TableHeader>
                <TableRow hover={false}>
                  <TableHead>Bill No.</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer Name & Phone</TableHead>
                  <TableHead>Bike / Number Plate</TableHead>
                  <TableHead className="text-right">Grand Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills.map((b) => {
                  const billNo = b.billNumber || b.invoiceId || 'INV-0000';
                  const custName = b.customerName || b.customerId?.name || 'Customer';
                  const phone = b.mobileNumber || b.customerId?.mobileNumber || '';
                  const bike = b.bikeName || b.vehicleId?.bikeName || '';
                  const regNo = b.bikeNumber || b.vehicleId?.registrationNumber || '';

                  return (
                    <TableRow key={b._id} hover={false}>
                      <TableCell>
                        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                          {billNo}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 font-mono">
                        {formatDate(b.billDate || b.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">{custName}</div>
                        {phone && (
                          <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{formatPhone(phone)}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-slate-800 text-xs">{bike || '—'}</div>
                        {regNo && (
                          <span className="font-mono text-[10px] font-bold text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
                            {formatRegNumber(regNo)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-mono font-extrabold text-slate-900 text-xs sm:text-sm">
                          {formatINR(b.grandTotal || b.totalAmount || 0)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Eye}
                            onClick={() => {
                              setSelectedBill(b);
                              setIsNewGeneration(false);
                              setPreviewModalOpen(true);
                            }}
                            title="View / Print PDF Bill"
                          >
                            View Bill
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Trash2}
                            onClick={() => {
                              setDeleteTarget(b);
                              setDeleteDialogOpen(true);
                            }}
                            title="Delete Bill"
                            className="hover:text-rose-600 hover:bg-rose-50 text-rose-600"
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <Pagination pagination={pagination} onPageChange={(newPage) => setPage(newPage)} />
          </div>
        )}
      </div>

      {/* Create Bill Modal */}
      <BillCreateModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleBillCreated}
      />

      {/* PDF & WhatsApp Action Modal */}
      <BillPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        bill={selectedBill}
        isNewGeneration={isNewGeneration}
      />

      {/* Delete Bill Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDeleteBill}
        title={`Delete Bill: ${deleteTarget?.billNumber || deleteTarget?.invoiceId}?`}
        message={`Are you sure you want to delete bill '${deleteTarget?.billNumber || deleteTarget?.invoiceId}'? Click OK to confirm.`}
        confirmText="OK, Delete Bill"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};
