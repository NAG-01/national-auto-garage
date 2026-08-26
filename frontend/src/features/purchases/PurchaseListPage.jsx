import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Truck, FileText, IndianRupee } from 'lucide-react';
import api from '../../api/client.js';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
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
import { TableSkeleton } from '../../components/ui/Skeleton.jsx';
import { SupplierPaymentModal } from './SupplierPaymentModal.jsx';
import { formatINR, formatDate } from '../../utils/formatters.js';

export const PurchaseListPage = () => {
  const [purchases, setPurchases] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  const navigate = useNavigate();

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const res = await api.get('/purchases', { params: { page, limit: 15 } });
      setPurchases(res.data);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Failed to fetch purchases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [page]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Spare Parts Purchases (Stock Intake)"
        subtitle="Record inventory purchases from suppliers. Automatically increases stock levels and tracks payables."
        actions={
          <Button
            variant="accent"
            size="sm"
            icon={Plus}
            onClick={() => navigate('/purchases/new')}
          >
            New Purchase Order
          </Button>
        }
      />

      {loading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : purchases.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="No purchase orders yet"
          description="Create a purchase order when receiving new spare parts stock from vendors."
          actionText="New Purchase Order"
          onAction={() => navigate('/purchases/new')}
        />
      ) : (
        <div>
          <Table>
            <TableHeader>
              <TableRow hover={false}>
                <TableHead>PO Number</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Vendor Invoice No.</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Balance Due</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((po) => (
                <TableRow key={po._id} hover={false}>
                  <TableCell>
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">
                      {po.purchaseNumber}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-slate-900 text-xs">
                      {po.supplierId?.name || 'Supplier'}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 font-mono">
                    {po.supplierInvoiceNo || '—'}
                  </TableCell>
                  <TableCell className="text-xs font-bold text-slate-900">
                    {formatINR(po.totalAmount)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-xs font-bold ${
                        po.outstandingBalance > 0 ? 'text-rose-600' : 'text-slate-500'
                      }`}
                    >
                      {formatINR(po.outstandingBalance)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={po.paymentStatus} />
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {formatDate(po.purchaseDate)}
                  </TableCell>
                  <TableCell className="text-right">
                    {po.outstandingBalance > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPurchase(po);
                          setPayModalOpen(true);
                        }}
                      >
                        Pay Due
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination pagination={pagination} onPageChange={(newPage) => setPage(newPage)} />
        </div>
      )}

      <SupplierPaymentModal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        purchase={selectedPurchase}
        onSuccess={fetchPurchases}
      />
    </div>
  );
};
