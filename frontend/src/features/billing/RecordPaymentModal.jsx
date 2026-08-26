import React, { useState } from 'react';
import { CreditCard, CheckCircle2 } from 'lucide-react';
import api from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Input, Select, Textarea } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { formatINR } from '../../utils/formatters.js';

export const RecordPaymentModal = ({ isOpen, onClose, bill, onSuccess }) => {
  const toast = useToast();

  const outstanding = bill?.outstandingAmount ?? 0;
  const [amount, setAmount] = useState(outstanding > 0 ? outstanding.toString() : '');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const numAmount = Number(amount || 0);
  const remainingAfterPayment = Math.max(0, outstanding - (isNaN(numAmount) ? 0 : numAmount));

  const validate = () => {
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Payment amount must be greater than zero.');
      return false;
    }
    if (numAmount > outstanding) {
      setError(`Payment amount cannot exceed current outstanding balance of ${formatINR(outstanding)}.`);
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await api.post(`/bills/${bill._id}/payments`, {
        amount: numAmount,
        paymentMethod,
        notes: notes.trim(),
      });

      toast.success(`Recorded payment of ${formatINR(numAmount)} via ${paymentMethod}.`);
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to record payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Record Payment — ${bill?.billNumber || 'Invoice'}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Outstanding Banner */}
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
          <span className="font-semibold text-amber-900">Current Outstanding Balance:</span>
          <span className="font-mono font-bold text-amber-900 text-sm">{formatINR(outstanding)}</span>
        </div>

        <Input
          label="Payment Amount (₹) *"
          type="number"
          step="any"
          min="0.01"
          max={outstanding}
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            if (error) setError('');
          }}
          error={error}
          required
        />

        <Select
          label="Payment Method *"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="CASH">Cash</option>
          <option value="UPI">UPI / QR Code</option>
          <option value="CARD">Debit / Credit Card</option>
          <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
          <option value="OTHER">Other</option>
        </Select>

        <Textarea
          label="Payment Notes / Transaction Ref (Optional)"
          placeholder="e.g. Google Pay UTR #123456789 or cash received by Imran..."
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {/* Live Remaining Balance Calculation */}
        <div className="p-3 bg-slate-900 rounded-xl text-white font-mono text-xs flex justify-between items-center">
          <span className="text-slate-400">Remaining Balance After Payment:</span>
          <span className={`font-bold ${remainingAfterPayment === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {formatINR(remainingAfterPayment)}
          </span>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="accent" loading={loading} icon={CheckCircle2}>
            Record Payment
          </Button>
        </div>
      </form>
    </Modal>
  );
};
