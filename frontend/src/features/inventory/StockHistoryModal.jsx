import React, { useState, useEffect } from 'react';
import api from '../../api/client.js';
import { Modal } from '../../components/ui/Modal.jsx';
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
import { formatDateTime } from '../../utils/formatters.js';

export const StockHistoryModal = ({ isOpen, onClose, product }) => {
  const [movements, setMovements] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchMovements = async () => {
    if (!product?._id) return;
    try {
      setLoading(true);
      const res = await api.get(`/inventory/${product._id}/movements`, {
        params: { page, limit: 10 },
      });
      const data = res.data || res;
      setMovements(data.movements || []);
      setPagination(data.pagination || null);
    } catch (err) {
      console.error('Failed to load stock movements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && product?._id) {
      setPage(1);
      fetchMovements();
    }
  }, [isOpen, product, page]);

  if (!product) return null;

  const getMovementVariant = (type) => {
    switch (type) {
      case 'PURCHASE_RECEIVED':
      case 'OPENING_STOCK':
      case 'RETURN':
        return 'success';
      case 'SERVICE_USAGE':
        return 'info';
      case 'MANUAL_ADJUSTMENT':
      case 'DAMAGED':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Stock History: ${product.name}`}
      subtitle={`Item ID: ${product.productId} • Historical stock record`}
      maxWidth="max-w-3xl"
      footer={
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="space-y-3">
        {loading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : movements.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
            No stock updates recorded for this item yet.
          </div>
        ) : (
          <div>
            <Table>
              <TableHeader>
                <TableRow hover={false}>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Update Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Stock Change</TableHead>
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
                        <Badge variant={getMovementVariant(m.movementType)}>
                          {m.movementType?.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`font-mono text-xs font-bold ${
                            isPositive ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {isPositive ? `+${m.quantity}` : m.quantity} {product.unit || 'PCS'}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 font-mono">
                        {m.previousStock} &rarr; <span className="font-bold text-slate-900">{m.newStock}</span>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-slate-700 max-w-xs truncate">
                          {m.notes || m.referenceId || '—'}
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
    </Modal>
  );
};
