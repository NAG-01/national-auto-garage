import React, { useState } from 'react';
import api from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { formatINR } from '../../utils/formatters.js';

export const SupplierPaymentModal = ({ isOpen, onClose, purchase, onSuccess }) => {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amount = Number(paymentAmount);
    if (!amount || amount <= 0) {
      toast.error('Payment amount must be greater than zero.');
      return;
    }
    if (amount > (purchase?.outstandingBalance || 0)) {
      toast.error(`Payment cannot exceed outstanding balance of ₹${purchase.outstandingBalance}`);
      return;
    }

    setLoading(true);
    try {
      await api.post(`/purchases/${purchase._id}/pay`, { paymentAmount: amount });
      toast.success('Supplier payment recorded successfully');
      setPaymentAmount('');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!purchase) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Pay Supplier for ${purchase.purchaseNumber}`}
      subtitle={`Total Order: ${formatINR(purchase.totalAmount)} • Outstanding: ${formatINR(purchase.outstandingBalance)}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            Record Payment
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs flex justify-between">
          <div>
            <div className="text-slate-500">Current Outstanding Due</div>
            <div className="text-base font-bold text-rose-600">{formatINR(purchase.outstandingBalance)}</div>
          </div>
          <div className="text-right">
            <div className="text-slate-500">Already Paid</div>
            <div className="text-base font-bold text-slate-800">{formatINR(purchase.amountPaid)}</div>
          </div>
        </div>

        <Input
          label="Payment Amount (₹)"
          type="number"
          min="1"
          max={purchase.outstandingBalance}
          required
          placeholder="e.g. 5000"
          value={paymentAmount}
          onChange={(e) => setPaymentAmount(e.target.value)}
        />
      </form>
    </Modal>
  );
};
