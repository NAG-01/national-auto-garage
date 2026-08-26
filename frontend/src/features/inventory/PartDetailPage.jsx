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
  Truck,
  MapPin,
} from 'lucide-react';
import api from '../../api/client.js';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { KpiCard } from '../../components/ui/KpiCard.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui/Table.jsx';
import { TableSkeleton } from '../../components/ui/Skeleton.jsx';
import { StockAdjustmentModal } from './StockAdjustmentModal.jsx';
import { PartModal } from './PartModal.jsx';
import { formatINR, formatDateTime } from '../../utils/formatters.js';

export const PartDetailPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [partModalOpen, setPartModalOpen] = useState(false);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);

  const navigate = useNavigate();

  const fetchPart = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/inventory/${id}`);
      setData(res.data);
    } catch (err) {
      console.error('Failed to load part details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPart();
  }, [id]);

  if (loading) return <TableSkeleton rows={8} cols={5} />;
  if (!data?.part) {
    return (
      <div className="p-12 text-center text-slate-500">
        Spare part record not found.
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/inventory')}>
            Back to Inventory
          </Button>
        </div>
      </div>
    );
  }

  const { part, movements = [] } = data;
  const isLowStock = part.currentStock <= part.minStockLevel;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/inventory')}>
          Back
        </Button>
        <PageHeader
          title={part.name}
          subtitle={`SKU: ${part.partNumber} • Category: ${part.category}`}
          actions={
            <>
              <Button
                variant="outline"
                size="sm"
                icon={Edit2}
                onClick={() => setPartModalOpen(true)}
              >
                Edit Part
              </Button>
              <Button
                variant="accent"
                size="sm"
                icon={SlidersHorizontal}
                onClick={() => setAdjustModalOpen(true)}
              >
                Adjust Stock
              </Button>
            </>
          }
        />
      </div>

      {/* KPI Specs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <KpiCard
          title="Current Stock"
          value={`${part.currentStock} ${part.unit}`}
          subtitle={`Min alert: ${part.minStockLevel} ${part.unit}`}
          icon={Package}
          variant={isLowStock ? 'danger' : 'success'}
        />

        <KpiCard
          title="Purchase Cost"
          value={formatINR(part.purchasePrice)}
          subtitle="Inventory cost basis"
          icon={TrendingDown}
          variant="default"
        />

        <KpiCard
          title="Selling / MRP"
          value={formatINR(part.sellingPrice)}
          subtitle={`Gross margin: ${formatINR(part.sellingPrice - part.purchasePrice)}`}
          icon={TrendingUp}
          variant="accent"
        />

        <KpiCard
          title="Total Stock Value"
          value={formatINR(part.currentStock * part.purchasePrice)}
          subtitle="At purchase cost"
          icon={Package}
          variant="info"
        />
      </div>

      {/* Part Specifications & Supplier Link */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Part Specifications" noPadding>
          <div className="p-4 space-y-2.5 text-xs">
            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider block">Brand / Maker</span>
              <span className="font-semibold text-slate-800">{part.brand || 'Unbranded / OEM'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider block">Storage Location</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {part.rackLocation || 'General Spares Shelf'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider block">Primary Supplier</span>
              <span className="font-semibold text-slate-800">
                {part.primarySupplierId ? (
                  <button
                    onClick={() => navigate(`/suppliers/${part.primarySupplierId._id}`)}
                    className="text-orange-600 hover:underline"
                  >
                    {part.primarySupplierId.name}
                  </button>
                ) : (
                  '—'
                )}
              </span>
            </div>
          </div>
        </Card>

        {/* Stock Ledger Movements Table (2 cols) */}
        <div className="lg:col-span-2">
          <Card
            title={`Stock Ledger History (${movements.length} transactions)`}
            subtitle="Every change in quantity is logged in the double-entry movement ledger"
            noPadding
          >
            {movements.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No ledger movement records for this part yet.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow hover={false}>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Movement Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Stock (Before $\rightarrow$ After)</TableHead>
                    <TableHead>Reference / Note</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.map((m) => {
                    const isPositive = m.quantity > 0;
                    return (
                      <TableRow key={m._id} hover={false}>
                        <TableCell className="text-xs text-slate-500">
                          {formatDateTime(m.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              m.movementType === 'PURCHASE'
                                ? 'success'
                                : m.movementType === 'SERVICE_USAGE'
                                ? 'info'
                                : m.movementType === 'DAMAGED'
                                ? 'danger'
                                : 'default'
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
                            {isPositive ? `+${m.quantity}` : m.quantity} {part.unit}
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

      <PartModal
        isOpen={partModalOpen}
        onClose={() => setPartModalOpen(false)}
        part={part}
        onSuccess={fetchPart}
      />

      <StockAdjustmentModal
        isOpen={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        part={part}
        onSuccess={fetchPart}
      />
    </div>
  );
};
