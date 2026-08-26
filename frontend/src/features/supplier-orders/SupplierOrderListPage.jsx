import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Plus,
  Truck,
  Edit2,
  Trash2,
  MessageSquare,
  Phone,
} from 'lucide-react';
import api from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { SearchInput, Select } from '../../components/ui/Input.jsx';
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
import { SupplierOrderModal } from './SupplierOrderModal.jsx';
import { formatDate } from '../../utils/formatters.js';

export const SupplierOrderListPage = () => {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [page, setPage] = useState(1);

  // Modals & Action Dialogs
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Delete Order Confirmation State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const toast = useToast();

  const fetchSuppliers = async () => {
    try {
      const res = await api.get('/suppliers?status=ACTIVE&limit=100');
      setSuppliers(res.data?.suppliers || res.suppliers || []);
    } catch (err) {
      console.error('Failed to load suppliers:', err);
    }
  };

  const fetchOrders = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      setFetching(true);
      setError('');
      const res = await api.get('/supplier-orders', {
        params: {
          search,
          supplierId: supplierFilter,
          page,
          limit: 15,
        },
      });
      const dataPayload = res.data || res.message || res;
      const ordersList = Array.isArray(dataPayload)
        ? dataPayload
        : dataPayload.orders || res.orders || [];
      const paginationData = res.meta || res.pagination || dataPayload.pagination || null;

      setOrders(ordersList);
      setPagination(paginationData);
    } catch (err) {
      console.error('Failed to fetch supplier orders:', err);
      setError('Unable to load supplier orders list. Please try again.');
    } finally {
      setLoading(false);
      setFetching(false);
    }
  }, [search, supplierFilter, page]);

  useEffect(() => {
    fetchSuppliers();
    fetchOrders(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders(false);
    }, 150);
    return () => clearTimeout(timer);
  }, [fetchOrders]);

  // Handle Delete Order
  const handleDeleteOrder = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/supplier-orders/${deleteTarget._id}`);
      toast.success(`Order '${deleteTarget.orderId}' deleted successfully.`);
      fetchOrders(false);
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete order.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Build WhatsApp Order Link
  const openWhatsAppOrder = (o) => {
    const rawPhone = o.supplierPhone || o.supplierId?.phone || '';
    const cleanPhone = rawPhone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const supplierName = o.supplierId?.name || o.supplierNameSnapshot || 'Supplier';
    const itemsListText = (o.items || [])
      .map((it, idx) => `${idx + 1}. *${it.productName}* - ${it.quantityRequested} ${it.unit || 'PCS'}`)
      .join('\n');

    const messageText = `*NATIONAL AUTO GARAGE - PURCHASE ORDER*\n*Order ID*: ${o.orderId}\n*Supplier*: ${supplierName}\n*Date*: ${formatDate(o.orderDate || o.createdAt)}\n\n*ITEMS REQUIRED:*\n${itemsListText}\n\nPlease deliver these items as soon as possible. Thank you!`;

    const whatsappUrl = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(messageText)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Supplier Orders"
        subtitle="Spare part order list banayein aur supplier ko WhatsApp par bhejein."
      />

      {/* Filter, Search & Single Create Order Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
          <div className="w-full sm:w-48">
            <Select
              value={supplierFilter}
              onChange={(e) => {
                setSupplierFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Suppliers</option>
              {suppliers.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="w-full sm:w-64">
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
              placeholder="Search Order ID or Supplier..."
            />
          </div>
        </div>

        <Button
          variant="accent"
          size="md"
          icon={Plus}
          onClick={() => {
            setSelectedOrder(null);
            setOrderModalOpen(true);
          }}
          className="w-full sm:w-auto shrink-0 whitespace-nowrap"
        >
          Create Order
        </Button>
      </div>

      {/* Main Table Viewport */}
      <div className="min-h-[420px] relative">
        {loading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : error ? (
          <ErrorState message={error} onRetry={() => fetchOrders(true)} />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={Truck}
            title="No supplier orders found"
            description={
              search || supplierFilter
                ? 'No orders match your active search or filter criteria.'
                : 'Create your first supplier purchase order list to request spare parts.'
            }
            actionText="Create Order"
            onAction={() => {
              setSelectedOrder(null);
              setOrderModalOpen(true);
            }}
          />
        ) : (
          <div className={`space-y-4 transition-opacity ${fetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <Table>
              <TableHeader>
                <TableRow hover={false}>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Supplier Name & Phone</TableHead>
                  <TableHead>Items Count</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => {
                  const supplierName = o.supplierId?.name || o.supplierNameSnapshot || 'Supplier';
                  const phone = o.supplierPhone || o.supplierId?.phone || '';
                  const itemCount = o.items?.length || 0;

                  return (
                    <TableRow key={o._id} hover={false}>
                      <TableCell>
                        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-md">
                          {o.orderId}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 font-mono">
                        {formatDate(o.orderDate || o.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">{supplierName}</div>
                        {phone && (
                          <div className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5 font-mono">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{phone}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="accent">
                          {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* WhatsApp Direct Send Button */}
                          <button
                            type="button"
                            onClick={() => openWhatsAppOrder(o)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                            title="Send Order List on WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </button>

                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Edit2}
                            onClick={() => {
                              setSelectedOrder(o);
                              setOrderModalOpen(true);
                            }}
                            title="View / Edit Order Items"
                          >
                            Edit
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Trash2}
                            onClick={() => {
                              setDeleteTarget(o);
                              setDeleteDialogOpen(true);
                            }}
                            title="Delete Order"
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

      {/* Create / Edit Supplier Order Modal */}
      <SupplierOrderModal
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        order={selectedOrder}
        onSuccess={() => fetchOrders(false)}
      />

      {/* Delete Order Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDeleteOrder}
        title={`Delete Order: ${deleteTarget?.orderId}?`}
        message={`Are you sure you want to delete order '${deleteTarget?.orderId}'? Click OK to confirm.`}
        confirmText="OK, Delete Order"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};
