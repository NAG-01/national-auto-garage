import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Bike, Plus, Eye, Edit2, Trash2, Phone, MapPin } from 'lucide-react';
import api from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { SearchInput } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Pagination,
} from '../../components/ui/Table.jsx';
import { TableSkeleton } from '../../components/ui/Skeleton.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { ErrorState } from '../../components/ui/ErrorState.jsx';
import { ConfirmDialog } from '../../components/ui/Modal.jsx';
import { CustomerModal } from './CustomerModal.jsx';
import { formatPhone } from '../../utils/formatters.js';

export const CustomerListPage = () => {
  const [customers, setCustomers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Delete Customer Confirmation State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  const fetchCustomers = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    setFetching(true);
    setError(null);
    try {
      const res = await api.get('/customers', {
        params: { search, page, limit: 15 },
      });
      const dataPayload = res.data || res;
      const customersList = Array.isArray(dataPayload)
        ? dataPayload
        : dataPayload.customers || res.customers || [];
      const summaryData = res.meta?.summary || dataPayload.summary || {};
      const paginationData = res.meta?.pagination || res.pagination || null;

      setCustomers(customersList);
      setSummary(summaryData);
      setPagination(paginationData);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
      setError(err.message || 'Failed to load customer records.');
    } finally {
      setLoading(false);
      setFetching(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchCustomers(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers(false);
    }, 150);
    return () => clearTimeout(timer);
  }, [fetchCustomers]);

  // Handle Delete Customer
  const handleDeleteCustomer = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/customers/${deleteTarget._id}`);
      toast.success(`Customer '${deleteTarget.name}' deleted successfully.`);
      fetchCustomers(false);
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete customer.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers Directory"
        subtitle="Manage garage customer phone numbers, registered bikes, and history."
      />

      {/* Sleek Compact Status Card Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 select-none max-w-2xl">
        <div className="p-3.5 bg-slate-900 text-white rounded-2xl border border-slate-900 shadow-md flex items-center justify-between h-20">
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-wider opacity-80">Total Customers</div>
            <div className="text-xl font-black mt-0.5">{summary?.activeCustomers ?? customers.length}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800 text-orange-400 font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between h-20">
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Customers with Bikes</div>
            <div className="text-xl font-black mt-0.5">{summary?.customersWithBikes ?? customers.length}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between h-20">
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Total Registered Bikes</div>
            <div className="text-xl font-black mt-0.5">{summary?.totalBikes ?? 0}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 font-bold">
            <Bike className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search Bar & Single Add Customer Button */}
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
            placeholder="Search customer name or phone..."
          />
        </div>

        <Button
          variant="accent"
          size="md"
          icon={Plus}
          onClick={() => {
            setSelectedCustomer(null);
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto shrink-0"
        >
          Add Customer
        </Button>
      </div>

      {/* Main Table Viewport */}
      <div className="min-h-[420px] relative">
        {loading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : error ? (
          <ErrorState message={error} onRetry={() => fetchCustomers(true)} />
        ) : customers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No customers found"
            description={
              search
                ? 'No customers match your active search filter.'
                : 'Add your first customer to manage registered bikes and service history.'
            }
            actionText="Add Customer"
            onAction={() => {
              setSelectedCustomer(null);
              setIsModalOpen(true);
            }}
          />
        ) : (
          <div className={`space-y-4 transition-opacity ${fetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <Table>
              <TableHeader>
                <TableRow hover={false}>
                  <TableHead>Customer ID</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Mobile Phone</TableHead>
                  <TableHead>Bikes Registered</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((c) => (
                  <TableRow key={c._id} hover={false}>
                    <TableCell>
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-md">
                        {c.customerId}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">{c.name}</div>
                      {c.notes && <div className="text-[11px] text-slate-500 truncate max-w-xs">{c.notes}</div>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatPhone(c.mobileNumber)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.bikeCount > 0 ? 'accent' : 'neutral'} className="gap-1">
                        <Bike className="w-3 h-3" />
                        <span>{c.bikeCount || 0} {c.bikeCount === 1 ? 'Bike' : 'Bikes'}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 max-w-xs truncate">
                        {c.address ? (
                          <>
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{c.address}</span>
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
                          icon={Eye}
                          onClick={() => navigate(`/customers/${c._id}`)}
                          title="View Customer Profile & Bikes"
                        >
                          View Profile
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Edit2}
                          onClick={() => {
                            setSelectedCustomer(c);
                            setIsModalOpen(true);
                          }}
                          title="Edit Customer"
                        >
                          Edit
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Trash2}
                          onClick={() => {
                            setDeleteTarget(c);
                            setDeleteDialogOpen(true);
                          }}
                          title="Delete Customer"
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

      {/* Add / Edit Customer Modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customer={selectedCustomer}
        onSuccess={() => fetchCustomers(false)}
      />

      {/* Delete Customer Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDeleteCustomer}
        title={`Delete Customer: ${deleteTarget?.name}?`}
        message={`Are you sure you want to delete '${deleteTarget?.name}' (${deleteTarget?.customerId})? Click OK to confirm.`}
        confirmText="OK, Delete Customer"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};
