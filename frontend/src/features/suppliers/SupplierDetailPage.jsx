import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Truck,
  ArrowLeft,
  Plus,
  Edit2,
  Phone,
  MapPin,
  Archive,
  RotateCcw,
  Package,
  TrendingUp,
  Eye,
} from 'lucide-react';
import api from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { KpiCard } from '../../components/ui/KpiCard.jsx';
import { Badge, StatusBadge } from '../../components/ui/Badge.jsx';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui/Table.jsx';
import { TableSkeleton } from '../../components/ui/Skeleton.jsx';
import { ConfirmDialog } from '../../components/ui/Modal.jsx';
import { SupplierModal } from './SupplierModal.jsx';
import { SupplierOrderModal } from '../supplier-orders/SupplierOrderModal.jsx';
import { formatPhone, formatDate, formatINR } from '../../utils/formatters.js';

export const SupplierDetailPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editSupplierOpen, setEditSupplierOpen] = useState(false);
  const [createOrderOpen, setCreateOrderOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [archiveLoading, setArchiveLoading] = useState(false);

  const navigate = useNavigate();
  const toast = useToast();

  const fetchSupplier = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/suppliers/${id}`);
      const payload = res.data || res;
      setData(payload);
    } catch (err) {
      console.error('Failed to load supplier details:', err);
      toast.error('Unable to load supplier details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupplier();
  }, [id]);

  const handleArchiveToggle = async () => {
    if (!data?.supplier) return;
    const isArchived = !data.supplier.isActive;
    setArchiveLoading(true);
    try {
      if (isArchived) {
        await api.patch(`/suppliers/${data.supplier._id}/restore`);
        toast.success(`Supplier '${data.supplier.name}' restored to active directory.`);
      } else {
        await api.patch(`/suppliers/${data.supplier._id}/archive`);
        toast.success(`Supplier '${data.supplier.name}' archived.`);
      }
      fetchSupplier();
      setArchiveDialogOpen(false);
    } catch (err) {
      toast.error(err.message || 'Action failed.');
    } finally {
      setArchiveLoading(false);
    }
  };

  if (loading) return <TableSkeleton rows={8} cols={5} />;
  if (!data?.supplier) {
    return (
      <div className="p-12 text-center text-slate-500">
        Supplier record not found.
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/suppliers')}>
            Back to Suppliers
          </Button>
        </div>
      </div>
    );
  }

  const { supplier, orders = [], metrics = {} } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/suppliers')}>
          Back
        </Button>
        <PageHeader
          title={supplier.name}
          subtitle={`Supplier ID: ${supplier.supplierId} • Mobile: ${formatPhone(supplier.phone)}`}
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              {supplier.isActive && (
                <Button
                  variant="accent"
                  size="sm"
                  icon={Plus}
                  onClick={() => setCreateOrderOpen(true)}
                >
                  Create Order
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                icon={Edit2}
                onClick={() => setEditSupplierOpen(true)}
              >
                Edit Supplier
              </Button>
              <Button
                variant={supplier.isActive ? 'danger' : 'success'}
                size="sm"
                icon={supplier.isActive ? Archive : RotateCcw}
                onClick={() => setArchiveDialogOpen(true)}
              >
                {supplier.isActive ? 'Archive' : 'Restore'}
              </Button>
            </div>
          }
        />
      </div>

      {/* KPI Order Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard
          title="Total Orders"
          value={metrics.totalOrders || 0}
          subtitle="Lifetime orders"
          icon={Truck}
          variant="default"
        />

        <KpiCard
          title="Draft Orders"
          value={metrics.draftCount || 0}
          subtitle="Preparing"
          icon={Package}
          variant="warning"
        />

        <KpiCard
          title="Ordered"
          value={metrics.orderedCount || 0}
          subtitle="Placed"
          icon={Truck}
          variant="info"
        />

        <KpiCard
          title="Received"
          value={metrics.receivedCount || 0}
          subtitle="Stock Intake Done"
          icon={Package}
          variant="success"
        />

        <KpiCard
          title="Cancelled"
          value={metrics.cancelledCount || 0}
          subtitle="Cancelled"
          icon={Archive}
          variant="danger"
        />

        <KpiCard
          title="Purchased Value"
          value={formatINR(metrics.totalReceivedValue || 0)}
          subtitle="Received total"
          icon={TrendingUp}
          variant="accent"
        />
      </div>

      {/* Profile & History Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Supplier Profile Specifications">
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider block">Status</span>
              <div className="mt-1">
                {supplier.isActive ? (
                  <Badge variant="success">ACTIVE</Badge>
                ) : (
                  <Badge variant="neutral">ARCHIVED</Badge>
                )}
              </div>
            </div>

            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider block">Supplier ID</span>
              <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-xs">
                {supplier.supplierId}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider block">Mobile Phone</span>
              <span className="font-mono font-bold text-slate-800">{formatPhone(supplier.phone)}</span>
            </div>

            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider block">Address</span>
              <span className="text-slate-700 block mt-0.5">{supplier.address || 'No address specified.'}</span>
            </div>

            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider block">Notes</span>
              <span className="text-slate-700 block whitespace-pre-wrap mt-0.5">
                {supplier.notes || 'No notes recorded.'}
              </span>
            </div>
          </div>
        </Card>

        {/* Order History Table (2 cols) */}
        <div className="lg:col-span-2">
          <Card
            title={`Supplier Orders History (${orders.length} orders)`}
            subtitle="Complete lifecycle traceability: Draft → Ordered → Received"
            noPadding
          >
            {orders.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No orders placed with this supplier yet.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow hover={false}>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Total Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((o) => {
                    const totalQty = o.items?.reduce((sum, it) => sum + (it.quantityRequested || 0), 0) || 0;
                    return (
                      <TableRow
                        key={o._id}
                        onClick={() => navigate(`/supplier-orders/${o._id}`)}
                      >
                        <TableCell>
                          <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">
                            {o.orderId}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-slate-600 font-mono">
                          {formatDate(o.orderDate)}
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-semibold text-slate-800">
                            {o.items?.length || 0} line items
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-xs font-bold text-slate-900">{totalQty} units</span>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={o.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Eye}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/supplier-orders/${o._id}`);
                            }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </Card>
        </div>
      </div>

      <SupplierModal
        isOpen={editSupplierOpen}
        onClose={() => setEditSupplierOpen(false)}
        supplier={supplier}
        onSuccess={fetchSupplier}
      />

      <SupplierOrderModal
        isOpen={createOrderOpen}
        onClose={() => setCreateOrderOpen(false)}
        defaultSupplierId={supplier._id}
        onSuccess={fetchSupplier}
      />

      <ConfirmDialog
        isOpen={archiveDialogOpen}
        onClose={() => setArchiveDialogOpen(false)}
        onConfirm={handleArchiveToggle}
        title={supplier.isActive ? `Archive Supplier: ${supplier.name}?` : `Restore Supplier: ${supplier.name}?`}
        message={
          supplier.isActive
            ? `Supplier (${supplier.supplierId}) will be archived. All historical orders will remain available.`
            : `Supplier (${supplier.supplierId}) will be restored to active directory.`
        }
        confirmText={supplier.isActive ? 'Archive Supplier' : 'Restore Supplier'}
        variant={supplier.isActive ? 'danger' : 'success'}
        loading={archiveLoading}
      />
    </div>
  );
};
