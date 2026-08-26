import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck,
  Plus,
  Phone,
  MapPin,
  Edit2,
  Trash2,
  Package,
} from 'lucide-react';
import api from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { SearchInput } from '../../components/ui/Input.jsx';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Pagination,
} from '../../components/ui/Table.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { ErrorState } from '../../components/ui/ErrorState.jsx';
import { TableSkeleton } from '../../components/ui/Skeleton.jsx';
import { ConfirmDialog } from '../../components/ui/Modal.jsx';
import { SupplierModal } from './SupplierModal.jsx';
import { formatPhone } from '../../utils/formatters.js';

export const SupplierListPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [summary, setSummary] = useState({
    totalSuppliers: 0,
    activeSuppliers: 0,
  });
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Modals
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // Delete Supplier Confirmation State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const toast = useToast();

  const fetchSuppliers = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      setFetching(true);
      setError('');
      const res = await api.get('/suppliers', {
        params: {
          search,
          page,
          limit: 15,
        },
      });
      const dataPayload = res.data || res.message || res;
      const suppliersList = Array.isArray(dataPayload)
        ? dataPayload
        : dataPayload.suppliers || res.suppliers || [];
      const summaryData = dataPayload.summary || res.summary || {};
      const paginationData = res.meta || res.pagination || dataPayload.pagination || null;

      setSuppliers(suppliersList);
      setSummary({
        totalSuppliers: summaryData.totalSuppliers || suppliersList.length,
        activeSuppliers: summaryData.activeSuppliers || suppliersList.length,
      });
      setPagination(paginationData);
    } catch (err) {
      console.error('Failed to fetch suppliers:', err);
      setError('Unable to load suppliers list. Please try again.');
    } finally {
      setLoading(false);
      setFetching(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchSuppliers(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuppliers(false);
    }, 150);
    return () => clearTimeout(timer);
  }, [fetchSuppliers]);

  // Handle Delete Supplier
  const handleDeleteSupplier = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/suppliers/${deleteTarget._id}`);
      toast.success(`Supplier '${deleteTarget.name}' deleted successfully.`);
      fetchSuppliers(false);
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete supplier.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suppliers & Vendors"
        subtitle="Spare part suppliers, dukan ke address aur contact details yahan dekhein."
      />

      {/* Sleek Compact Status Card Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 select-none max-w-xl">
        <div className="p-3.5 bg-slate-900 text-white rounded-2xl border border-slate-900 shadow-md flex items-center justify-between h-20">
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-wider opacity-80">Total Suppliers</div>
            <div className="text-xl font-black mt-0.5">{summary.totalSuppliers || suppliers.length}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800 text-orange-400 font-bold">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between h-20">
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Active Vendors</div>
            <div className="text-xl font-black mt-0.5">{summary.activeSuppliers || suppliers.length}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold">
            <Package className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search Bar & Single Add Supplier Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
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
            placeholder="Search by supplier name or phone..."
          />
        </div>

        <Button
          variant="accent"
          size="md"
          icon={Plus}
          onClick={() => {
            setSelectedSupplier(null);
            setSupplierModalOpen(true);
          }}
          className="w-full sm:w-auto shrink-0"
        >
          Add Supplier
        </Button>
      </div>

      {/* Main Table Viewport */}
      <div className="min-h-[420px] relative">
        {loading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : error ? (
          <ErrorState message={error} onRetry={() => fetchSuppliers(true)} />
        ) : suppliers.length === 0 ? (
          <EmptyState
            icon={Truck}
            title="No suppliers found"
            description={
              search
                ? 'No suppliers match your active search filter.'
                : 'Add your first supplier to track spare part vendor contacts.'
            }
            actionText="Add Supplier"
            onAction={() => {
              setSelectedSupplier(null);
              setSupplierModalOpen(true);
            }}
          />
        ) : (
          <div className={`space-y-4 transition-opacity ${fetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <Table>
              <TableHeader>
                <TableRow hover={false}>
                  <TableHead>ID</TableHead>
                  <TableHead>Supplier Name</TableHead>
                  <TableHead>Mobile Phone</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((s) => (
                  <TableRow key={s._id} hover={false}>
                    <TableCell>
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-md">
                        {s.supplierId}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">{s.name}</div>
                      {s.notes && <div className="text-[11px] text-slate-500 truncate max-w-xs">{s.notes}</div>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatPhone(s.phone)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 max-w-xs truncate">
                        {s.address ? (
                          <>
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{s.address}</span>
                          </>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Edit2}
                          onClick={() => {
                            setSelectedSupplier(s);
                            setSupplierModalOpen(true);
                          }}
                          title="Edit Supplier"
                        >
                          Edit
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Trash2}
                          onClick={() => {
                            setDeleteTarget(s);
                            setDeleteDialogOpen(true);
                          }}
                          title="Delete Supplier"
                          className="hover:text-rose-600 hover:bg-rose-50 text-rose-600"
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Pagination pagination={pagination} onPageChange={(newPage) => setPage(newPage)} />
          </div>
        )}
      </div>

      {/* Add / Edit Supplier Modal */}
      <SupplierModal
        isOpen={supplierModalOpen}
        onClose={() => setSupplierModalOpen(false)}
        supplier={selectedSupplier}
        onSuccess={() => fetchSuppliers(false)}
      />

      {/* Delete Supplier Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDeleteSupplier}
        title={`Delete Supplier: ${deleteTarget?.name}?`}
        message={`Are you sure you want to delete '${deleteTarget?.name}' (${deleteTarget?.supplierId})? Click OK to confirm.`}
        confirmText="OK, Delete Supplier"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};
