import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  User,
  Bike,
  DollarSign,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Phone,
} from 'lucide-react';
import api from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import { Table } from '../../components/ui/Table.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import { ErrorState } from '../../components/ui/ErrorState.jsx';
import { RecordPaymentModal } from './RecordPaymentModal.jsx';
import { formatPhone, formatDate, formatINR, formatRegNumber } from '../../utils/formatters.js';

export const InvoiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const fetchBillDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/invoices/${id}`);
      setBill(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load bill details.');
      toast.error('Failed to load bill.');
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchBillDetails();
  }, [fetchBillDetails]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton rows={2} />
        <Skeleton rows={8} />
      </div>
    );
  }

  if (error || !bill) {
    return (
      <ErrorState
        title="Bill Not Found"
        message={error || 'The requested invoice does not exist.'}
        onRetry={() => navigate('/invoices')}
      />
    );
  }

  const itemsColumns = [
    {
      header: 'Item / Product Name',
      accessor: 'productName',
      render: (item) => <span className="font-semibold text-slate-900">{item.productName}</span>,
    },
    {
      header: 'Unit Price',
      accessor: 'unitPrice',
      className: 'font-mono text-xs text-slate-700',
      render: (item) => formatINR(item.unitPrice),
    },
    {
      header: 'Qty',
      accessor: 'quantity',
      className: 'font-mono text-xs font-bold text-slate-900',
    },
    {
      header: 'Line Total',
      accessor: 'total',
      className: 'text-right font-mono font-bold text-slate-900',
      render: (item) => formatINR(item.total),
    },
  ];

  const paymentsColumns = [
    {
      header: 'Payment ID',
      accessor: 'paymentId',
      render: (p) => (
        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {p.paymentId}
        </span>
      ),
    },
    {
      header: 'Date',
      accessor: 'paymentDate',
      render: (p) => formatDate(p.paymentDate),
    },
    {
      header: 'Method',
      accessor: 'paymentMethod',
      render: (p) => (
        <span className="font-semibold text-xs text-slate-800 uppercase bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
          {p.paymentMethod}
        </span>
      ),
    },
    {
      header: 'Notes / Ref',
      accessor: 'notes',
      render: (p) => <span className="text-xs text-slate-600 italic">{p.notes || '—'}</span>,
    },
    {
      header: 'Amount Paid',
      accessor: 'amount',
      className: 'text-right font-mono font-bold text-emerald-700 text-xs',
      render: (p) => formatINR(p.amount),
    },
  ];

  const outstanding = bill.outstandingAmount ?? 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate('/invoices')}
          >
            Back
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900">{bill.billNumber}</h1>
              <StatusBadge status={bill.paymentStatus} />
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Bill Date: {formatDate(bill.billDate || bill.createdAt)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        {outstanding > 0 && (
          <Button
            variant="accent"
            icon={DollarSign}
            onClick={() => setIsPaymentModalOpen(true)}
          >
            Record Payment
          </Button>
        )}
      </div>

      {/* Visually Obvious Outstanding Banner */}
      <div
        className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
          outstanding > 0
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
        }`}
      >
        <div className="flex items-center gap-3">
          {outstanding > 0 ? (
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
          ) : (
            <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
          )}
          <div>
            <div className="font-bold text-sm">
              {outstanding > 0 ? 'Payment Outstanding' : 'Invoice Fully Paid & Settled'}
            </div>
            <div className="text-xs mt-0.5 opacity-90">
              {outstanding > 0
                ? `Customer owes ${formatINR(outstanding)} on this invoice.`
                : 'All payments for this invoice have been received and verified.'}
            </div>
          </div>
        </div>

        <div className="text-right font-mono">
          <div className="text-xs uppercase tracking-wider font-semibold opacity-75">
            Balance Due
          </div>
          <div className="text-lg font-extrabold">{formatINR(outstanding)}</div>
        </div>
      </div>

      {/* Customer & Vehicle Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer Info Card */}
        <Card className="p-4 space-y-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-orange-600" />
            Customer Details
          </div>
          <div className="text-sm font-bold text-slate-900">{bill.customerName}</div>
          <div className="text-xs font-mono text-slate-600 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            {formatPhone(bill.mobileNumber)}
          </div>
        </Card>

        {/* Bike Info Card */}
        <Card className="p-4 space-y-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Bike className="w-3.5 h-3.5 text-orange-600" />
            Vehicle Details
          </div>
          <div className="text-sm font-bold text-slate-900">{bill.bikeName}</div>
          {bill.bikeNumber && (
            <span className="font-mono text-xs font-extrabold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded uppercase inline-block">
              {formatRegNumber(bill.bikeNumber)}
            </span>
          )}
        </Card>
      </div>

      {/* Bill Items Ledger Table */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <FileText className="w-5 h-5 text-orange-600" />
          <h2 className="text-base font-bold text-slate-900">
            Bill Items & Spare Parts ({bill.items?.length || 0})
          </h2>
        </div>

        {bill.items?.length === 0 ? (
          <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500 italic">
            No line items recorded on this bill.
          </div>
        ) : (
          <Table columns={itemsColumns} data={bill.items} />
        )}
      </Card>

      {/* Financial Summary Box */}
      <Card className="p-6 space-y-3">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Financial Summary
        </div>
        <div className="p-4 bg-slate-900 rounded-xl text-white space-y-2 font-mono text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Spare Parts Subtotal:</span>
            <span>{formatINR(bill.partsSubtotal || 0)}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Labour Charges:</span>
            <span>{formatINR(bill.labourCharges || 0)}</span>
          </div>
          {bill.tax > 0 && (
            <div className="flex justify-between text-slate-400">
              <span>Tax (+):</span>
              <span>{formatINR(bill.tax)}</span>
            </div>
          )}
          {bill.discount > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span>Discount (-):</span>
              <span>- {formatINR(bill.discount)}</span>
            </div>
          )}
          <div className="border-t border-slate-800 pt-2 flex justify-between text-sm font-bold text-orange-400">
            <span>Grand Total:</span>
            <span className="text-base">{formatINR(bill.grandTotal || 0)}</span>
          </div>
          <div className="flex justify-between text-emerald-400 text-xs pt-1">
            <span>Total Paid to Date:</span>
            <span>{formatINR(bill.totalPaid || 0)}</span>
          </div>
          <div className="flex justify-between text-amber-400 text-xs font-bold pt-1 border-t border-slate-800">
            <span>Remaining Outstanding:</span>
            <span>{formatINR(outstanding)}</span>
          </div>
        </div>
      </Card>

      {/* Payment History Ledger Card */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              Payment History Ledger ({bill.payments?.length || 0})
            </h2>
          </div>

          {outstanding > 0 && (
            <Button
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={() => setIsPaymentModalOpen(true)}
            >
              Add Payment
            </Button>
          )}
        </div>

        {bill.payments?.length === 0 ? (
          <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500 italic">
            No payments recorded yet for this bill. Status is UNPAID.
          </div>
        ) : (
          <Table columns={paymentsColumns} data={bill.payments} />
        )}
      </Card>

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        bill={bill}
        onSuccess={fetchBillDetails}
      />
    </div>
  );
};
