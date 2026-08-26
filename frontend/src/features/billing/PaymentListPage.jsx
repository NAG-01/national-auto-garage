import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Search, IndianRupee, FileText, User } from 'lucide-react';
import api from '../../api/client.js';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { KpiCard } from '../../components/ui/KpiCard.jsx';
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
import { formatINR, formatDateTime } from '../../utils/formatters.js';

export const PaymentListPage = () => {
  const [payments, setPayments] = useState([]);
  const [totalCollected, setTotalCollected] = useState(0);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [methodFilter, setMethodFilter] = useState('');
  const [page, setPage] = useState(1);

  const navigate = useNavigate();

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/payments', {
        params: { paymentMethod: methodFilter, page, limit: 15 },
      });
      setPayments(res.data.payments);
      setTotalCollected(res.data.totalCollected);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [methodFilter, page]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Receipts Ledger"
        subtitle="Immutable ledger of all customer payments (Cash, UPI, Cards, Bank Transfers)."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KpiCard
          title="Total Collected Payments"
          value={formatINR(totalCollected)}
          subtitle="Realized cash & bank inflows"
          icon={IndianRupee}
          variant="success"
        />

        <KpiCard
          title="Total Transactions"
          value={pagination?.totalRecords || 0}
          subtitle="Receipt transactions logged"
          icon={CreditCard}
          variant="default"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-white p-2 rounded-xl border border-slate-200">
        {['', 'CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'OTHER'].map((method) => (
          <button
            key={method}
            onClick={() => {
              setMethodFilter(method);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              methodFilter === method
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-transparent text-slate-600 hover:bg-slate-100'
            }`}
          >
            {method ? method.replace('_', ' ') : 'All Methods'}
          </button>
        ))}
      </div>

      {loading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : payments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payments recorded yet"
          description="Customer receipts will appear here as invoices are paid."
        />
      ) : (
        <div>
          <Table>
            <TableHeader>
              <TableRow hover={false}>
                <TableHead>Receipt No.</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Invoice Ref</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Txn Reference</TableHead>
                <TableHead>Amount Paid</TableHead>
                <TableHead className="text-right">Date & Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => (
                <TableRow key={p._id} hover={false}>
                  <TableCell>
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">
                      {p.paymentNumber}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold text-slate-900 text-xs">
                    {p.customerId?.name || 'Customer'}
                  </TableCell>
                  <TableCell>
                    {p.invoiceId ? (
                      <button
                        onClick={() => navigate(`/invoices/${p.invoiceId._id || p.invoiceId}`)}
                        className="font-mono text-xs font-bold text-orange-600 hover:underline"
                      >
                        {p.invoiceId.invoiceNumber || 'INV'}
                      </button>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-slate-700 font-semibold">
                      {p.paymentMethod}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 font-mono">
                    {p.transactionReference || '—'}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs font-extrabold text-emerald-700">
                      +{formatINR(p.amount)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-xs text-slate-500">
                    {formatDateTime(p.paymentDate)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination pagination={pagination} onPageChange={(newPage) => setPage(newPage)} />
        </div>
      )}
    </div>
  );
};
