import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Package,
  ArrowLeft,
  SlidersHorizontal,
  Edit2,
  TrendingUp,
  TrendingDown,
  History,
  Archive,
  RotateCcw,
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
import { ProductModal } from './ProductModal.jsx';
import { StockAdjustmentModal } from './StockAdjustmentModal.jsx';
import { formatINR, formatDateTime } from '../../utils/formatters.js';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const navigate = useNavigate();
  const toast = useToast();

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/inventory/${id}`);
      const payload = res.data || res;
      setData(payload);
    } catch (err) {
      console.error('Failed to load product details:', err);
      toast.error('Unable to load product details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleArchiveToggle = async () => {
    if (!data?.product) return;
    const isArchived = !data.product.isActive;
    setActionLoading(true);
    try {
      if (isArchived) {
        await api.patch(`/inventory/${data.product._id}/restore`);
        toast.success('Product restored to active inventory.');
      } else {
        await api.patch(`/inventory/${data.product._id}/archive`);
        toast.success('Product archived successfully.');
      }
      fetchProduct();
      setArchiveDialogOpen(false);
    } catch (err) {
      toast.error(err.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <TableSkeleton rows={8} cols={5} />;
  if (!data?.product) {
    return (
      <div className="p-12 text-center text-slate-500">
        Product record not found.
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/inventory')}>
            Back to Inventory
          </Button>
        </div>
      </div>
    );
  }

  const { product, movements = [] } = data;
  const isLowStock = product.currentStock <= product.minimumStockLevel && product.currentStock > 0;
  const isOutOfStock = product.currentStock === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/inventory')}>
          Back
        </Button>
        <PageHeader
          title={product.name}
          subtitle={`ID: ${product.productId} • Category: ${product.category}`}
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                icon={Edit2}
                onClick={() => setEditModalOpen(true)}
              >
                Edit Product
              </Button>
              <Button
                variant="accent"
                size="sm"
                icon={SlidersHorizontal}
                onClick={() => setAdjustModalOpen(true)}
              >
                Adjust Stock
              </Button>
              <Button
                variant={product.isActive ? 'danger' : 'success'}
                size="sm"
                icon={product.isActive ? Archive : RotateCcw}
                onClick={() => setArchiveDialogOpen(true)}
              >
                {product.isActive ? 'Archive Product' : 'Restore Product'}
              </Button>
            </div>
          }
        />
      </div>

      {/* KPI Specs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Current Stock"
          value={`${product.currentStock} ${product.unit}`}
          subtitle={`Min alert threshold: ${product.minimumStockLevel} ${product.unit}`}
          icon={Package}
          variant={isOutOfStock ? 'danger' : isLowStock ? 'warning' : 'success'}
        />

        <KpiCard
          title="Purchase Cost"
          value={formatINR(product.purchaseCost)}
          subtitle="Normal cost paid to supplier"
          icon={TrendingDown}
          variant="default"
        />

        <KpiCard
          title="Selling / MRP Price"
          value={formatINR(product.sellingPrice)}
          subtitle={`Margin: ${formatINR(product.sellingPrice - product.purchaseCost)} per ${product.unit}`}
          icon={TrendingUp}
          variant="accent"
        />

        <KpiCard
          title="Total Stock Value"
          value={formatINR(product.currentStock * product.purchaseCost)}
          subtitle="Valuation at purchase cost"
          icon={Package}
          variant="info"
        />
      </div>

      {/* Product Details & Movements Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Product Metadata & Specs">
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider block">Status</span>
              <div className="mt-1">
                {!product.isActive ? (
                  <Badge variant="neutral">ARCHIVED</Badge>
                ) : isOutOfStock ? (
                  <StatusBadge status="OUT_OF_STOCK" />
                ) : isLowStock ? (
                  <StatusBadge status="LOW_STOCK" />
                ) : (
                  <StatusBadge status="IN_STOCK" />
                )}
              </div>
            </div>

            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider block">Product ID</span>
              <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-xs">
                {product.productId}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider block">Category</span>
              <span className="font-semibold text-slate-800">{product.category}</span>
            </div>

            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider block">Unit of Measure</span>
              <span className="font-semibold text-slate-800">{product.unit}</span>
            </div>

            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider block">Notes / Specifications</span>
              <span className="text-slate-700 block whitespace-pre-wrap mt-0.5">
                {product.notes || 'No notes provided.'}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 space-y-1">
              <div>Created: {formatDateTime(product.createdAt)}</div>
              <div>Last Updated: {formatDateTime(product.updatedAt)}</div>
            </div>
          </div>
        </Card>

        {/* Stock Ledger History (2 cols) */}
        <div className="lg:col-span-2">
          <Card
            title={`Stock Movement Ledger (${movements.length} records)`}
            subtitle="Immutable double-entry stock audit trail"
            noPadding
          >
            {movements.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No stock movement records logged for this product yet.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow hover={false}>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Before $\rightarrow$ After</TableHead>
                    <TableHead>Reason / Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.map((m) => {
                    const isPositive = m.quantity > 0;
                    return (
                      <TableRow key={m._id} hover={false}>
                        <TableCell className="text-xs text-slate-500 font-mono">
                          {formatDateTime(m.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              m.movementType === 'PURCHASE_RECEIVED' || m.movementType === 'OPENING_STOCK'
                                ? 'success'
                                : m.movementType === 'SERVICE_USAGE'
                                ? 'info'
                                : 'danger'
                            }
                          >
                            {m.movementType?.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`font-mono text-xs font-bold ${
                              isPositive ? 'text-emerald-700' : 'text-rose-700'
                            }`}
                          >
                            {isPositive ? `+${m.quantity}` : m.quantity} {product.unit}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-slate-600 font-mono">
                          {m.previousStock} $\rightarrow$ <span className="font-bold text-slate-900">{m.newStock}</span>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-slate-600 max-w-xs truncate">
                            {m.notes || m.referenceId || '—'}
                          </div>
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

      <ProductModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        product={product}
        onSuccess={fetchProduct}
      />

      <StockAdjustmentModal
        isOpen={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        product={product}
        onSuccess={fetchProduct}
      />

      <ConfirmDialog
        isOpen={archiveDialogOpen}
        onClose={() => setArchiveDialogOpen(false)}
        onConfirm={handleArchiveToggle}
        title={product.isActive ? `Archive Product: ${product.name}?` : `Restore Product: ${product.name}?`}
        message={
          product.isActive
            ? `This product (${product.productId}) will be archived and hidden from active inventory lists. Historical bills, stock movements, and records will remain completely intact.`
            : `This product (${product.productId}) will be restored to active inventory.`
        }
        confirmText={product.isActive ? 'Archive Product' : 'Restore Product'}
        variant={product.isActive ? 'danger' : 'success'}
        loading={actionLoading}
      />
    </div>
  );
};
