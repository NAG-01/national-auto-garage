import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Truck,
  ArrowLeft,
  CheckCircle2,
  Edit2,
  Phone,
  Package,
  XCircle,
  Clock,
  ShieldCheck,
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
import { SupplierOrderModal } from './SupplierOrderModal.jsx';
import { formatDate, formatPhone, formatINR } from '../../utils/formatters.js';

export const SupplierOrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [actionType, setActionType] = useState(null); // 'MARK_ORDERED' | 'MARK_RECEIVED' | 'CANCEL'
  const [actionLoading, setActionLoading] = useState(false);

  const navigate = useNavigate();
  const toast = useToast();

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/supplier-orders/${id}`);
      const payload = res.data || res;
      setOrder(payload);
    } catch (err) {
      console.error('Failed to load supplier order:', err);
      toast.error('Unable to load supplier order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleExecuteStatusAction = async () => {
    if (!order || !actionType) return;
    setActionLoading(true);
    try {
      if (actionType === 'MARK_ORDERED') {
        await api.post(`/supplier-orders/${order._id}/mark-ordered`);
        toast.success(`Order '${order.orderId}' marked as ORDERED.`);
      } else if (actionType === 'MARK_RECEIVED') {
        await api.post(`/supplier-orders/${order._id}/mark-received`);
        toast.success(`Order '${order.orderId}' RECEIVED & inventory stock updated!`);
      } else if (actionType === 'CANCEL') {
        await api.post(`/supplier-orders/${order._id}/cancel`);
        toast.success(`Order '${order.orderId}' cancelled.`);
      }
      fetchOrder();
      setActionType(null);
    } catch (err) {
      toast.error(err.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <TableSkeleton rows={8} cols={5} />;
  if (!order) {
    return (
      <div className="p-12 text-center text-slate-500">
        Supplier order record not found.
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/supplier-orders')}>
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  const supplier = order.supplierId || {};
  const totalQty = order.items?.reduce((sum, it) => sum + (it.quantityRequested || 0), 0) || 0;
  const totalEstimatedAmount = order.items?.reduce(
    (sum, it) => sum + (it.quantityRequested || 0) * (it.estimatedUnitCost || 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/supplier-orders')}>
          Back
        </Button>
        <PageHeader
          title={`Order ${order.orderId}`}
          subtitle={`Supplier: ${supplier.name || 'Vendor'} • Date: ${formatDate(order.orderDate)}`}
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              {order.status === 'DRAFT' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Edit2}
                    onClick={() => setEditModalOpen(true)}
                  >
                    Edit Order
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Truck}
                    onClick={() => setActionType('MARK_ORDERED')}
                  >
                    Mark as ORDERED
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={XCircle}
                    onClick={() => setActionType('CANCEL')}
                    className="hover:text-rose-600 hover:bg-rose-50"
                  >
                    Cancel Order
                  </Button>
                </>
              )}

              {order.status === 'ORDERED' && (
                <>
                  <Button
                    variant="accent"
                    size="sm"
                    icon={CheckCircle2}
                    onClick={() => setActionType('MARK_RECEIVED')}
                  >
                    Mark RECEIVED & Intake Stock
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={XCircle}
                    onClick={() => setActionType('CANCEL')}
                    className="hover:text-rose-600 hover:bg-rose-50"
                  >
                    Cancel Order
                  </Button>
                </>
              )}
            </div>
          }
        />
      </div>

      {/* Received / Status Information Banner */}
      {order.status === 'RECEIVED' && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-4 text-emerald-900 text-xs">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <div className="font-extrabold text-sm">Inventory Intake Completed</div>
              <div>
                Products physically received on {formatDate(order.receivedDate)}. Stock quantities were updated automatically. Duplicate receipt protection is active.
              </div>
            </div>
          </div>
          <Badge variant="success">RECEIVED</Badge>
        </div>
      )}

      {order.status === 'CANCELLED' && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-4 text-rose-900 text-xs">
          <div className="flex items-center gap-3">
            <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
            <div>
              <div className="font-extrabold text-sm">Order Cancelled</div>
              <div>This order was cancelled. Product stock was NOT altered.</div>
            </div>
          </div>
          <Badge variant="danger">CANCELLED</Badge>
        </div>
      )}

      {/* KPI Order Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <KpiCard
          title="Order Status"
          value={order.status}
          subtitle={
            order.status === 'DRAFT'
              ? 'Draft preparation'
              : order.status === 'ORDERED'
              ? 'Placed with supplier'
              : order.status === 'RECEIVED'
              ? 'Stock intake done'
              : 'Cancelled'
          }
          icon={Truck}
          variant={
            order.status === 'RECEIVED'
              ? 'success'
              : order.status === 'ORDERED'
              ? 'info'
              : order.status === 'DRAFT'
              ? 'warning'
              : 'danger'
          }
        />

        <KpiCard
          title="Line Items"
          value={`${order.items?.length || 0} Products`}
          subtitle="Distinct catalog items"
          icon={Package}
          variant="default"
        />

        <KpiCard
          title="Total Quantity"
          value={`${totalQty} Units`}
          subtitle="Total requested units"
          icon={Package}
          variant="info"
        />

        <KpiCard
          title="Estimated Amount"
          value={formatINR(totalEstimatedAmount)}
          subtitle="At purchase cost"
          icon={Truck}
          variant="accent"
        />
      </div>

      {/* Order Specs & Items Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Supplier & Specs Card */}
        <Card title="Order Specifications & Vendor Info">
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider block">Vendor Name</span>
              <span
                onClick={() => supplier._id && navigate(`/suppliers/${supplier._id}`)}
                className="font-bold text-slate-900 hover:text-orange-600 cursor-pointer block mt-0.5"
              >
                {supplier.name || '—'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider block">Vendor Phone</span>
              <span className="font-mono font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {supplier.phone ? formatPhone(supplier.phone) : '—'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider block">Order ID</span>
              <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-xs">
                {order.orderId}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider block">Order Date</span>
              <span className="font-mono font-bold text-slate-800">{formatDate(order.orderDate)}</span>
            </div>

            {order.receivedDate && (
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider block">Received Date</span>
                <span className="font-mono font-bold text-emerald-700">{formatDate(order.receivedDate)}</span>
              </div>
            )}

            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider block">Notes</span>
              <span className="text-slate-700 block whitespace-pre-wrap mt-0.5">
                {order.notes || 'No notes provided.'}
              </span>
            </div>
          </div>
        </Card>

        {/* Order Line Items Table (2 cols) */}
        <div className="lg:col-span-2">
          <Card
            title={`Ordered Products (${order.items?.length || 0} line items)`}
            subtitle="Products and requested quantities"
            noPadding
          >
            <Table>
              <TableHeader>
                <TableRow hover={false}>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Requested Quantity</TableHead>
                  <TableHead>Unit Cost</TableHead>
                  <TableHead className="text-right">Line Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items?.map((it, idx) => {
                  const lineTotal = (it.quantityRequested || 0) * (it.estimatedUnitCost || 0);
                  const prd = it.productId || {};
                  return (
                    <TableRow key={idx} hover={false}>
                      <TableCell>
                        <div className="font-bold text-slate-900 text-sm">
                          {it.productName || prd.name || 'Product'}
                        </div>
                        {prd.productId && (
                          <span className="font-mono text-[10px] text-slate-500">{prd.productId}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">
                          {it.quantityRequested} {prd.unit || 'PCS'}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 font-mono">
                        {formatINR(it.estimatedUnitCost || 0)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-bold text-slate-900">
                        {formatINR(lineTotal)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>

      <SupplierOrderModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        order={order}
        onSuccess={fetchOrder}
      />

      <ConfirmDialog
        isOpen={Boolean(actionType)}
        onClose={() => setActionType(null)}
        onConfirm={handleExecuteStatusAction}
        title={
          actionType === 'MARK_ORDERED'
            ? `Mark Order ${order.orderId} as ORDERED?`
            : actionType === 'MARK_RECEIVED'
            ? `Receive Order ${order.orderId} & Intake Stock?`
            : `Cancel Order ${order.orderId}?`
        }
        message={
          actionType === 'MARK_ORDERED'
            ? `This confirms that order ${order.orderId} has been placed with ${supplier.name}. Product stock will NOT change yet.`
            : actionType === 'MARK_RECEIVED'
            ? `Confirm physical receipt of all ordered products from ${supplier.name}. Have all ordered items arrived? This will automatically update product inventory stock.`
            : `Order ${order.orderId} will be cancelled.`
        }
        confirmText={
          actionType === 'MARK_ORDERED'
            ? 'Mark as ORDERED'
            : actionType === 'MARK_RECEIVED'
            ? 'Intake Stock & Mark RECEIVED'
            : 'Cancel Order'
        }
        variant={actionType === 'CANCEL' ? 'danger' : 'accent'}
        loading={actionLoading}
      />
    </div>
  );
};
