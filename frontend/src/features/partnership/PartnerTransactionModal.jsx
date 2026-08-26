import React, { useState } from 'react';
import { Briefcase, CheckCircle2 } from 'lucide-react';
import api from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Input, Select, Textarea } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';

export const PartnerTransactionModal = ({ isOpen, onClose, onSuccess }) => {
  const [partner, setPartner] = useState('NAIM');
  const [type, setType] = useState('PERSONAL_WITHDRAWAL');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      toast.error('Please enter a valid amount greater than zero.');
      return;
    }

    if (!reason.trim()) {
      toast.error('Please provide a reason for this transaction.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/partnership/transactions', {
        partner,
        type,
        amount: numAmount,
        reason: reason.trim(),
        notes: notes.trim(),
      });

      toast.success(`Partner transaction ${res.data.transactionId} recorded successfully!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to record partner transaction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Partner Transaction"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" form="partner-tx-form" variant="accent" loading={loading} icon={CheckCircle2}>
            Record Transaction
          </Button>
        </div>
      }
    >
      <form id="partner-tx-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Partner Name *"
            value={partner}
            onChange={(e) => setPartner(e.target.value)}
          >
            <option value="NAIM">Naim (50% Owner)</option>
            <option value="IMRAN">Imran (50% Owner)</option>
          </Select>

          <Select
            label="Transaction Type *"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="PERSONAL_WITHDRAWAL">Personal Withdrawal (-)</option>
            <option value="OUT_OF_POCKET_EXPENSE">Out-of-Pocket Expense (+)</option>
            <option value="CAPITAL_INJECTION">Capital Injection (+)</option>
          </Select>
        </div>

        <Input
          label="Transaction Amount (₹) *"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="e.g. 1500"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <Input
          label="Reason / Purpose *"
          placeholder="e.g. Personal Draw for Home Rent, or Purchased Workshop Tools out of pocket"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <Textarea
          label="Notes / Comments (Optional)"
          placeholder="Add any additional context or reference details..."
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
          <span className="font-bold text-slate-900">Financial Impact:</span>{' '}
          {type === 'PERSONAL_WITHDRAWAL'
            ? `Deducts ₹${amount || 0} from ${partner}'s monthly payout.`
            : type === 'OUT_OF_POCKET_EXPENSE'
            ? `Credits ₹${amount || 0} back to ${partner}'s monthly payout.`
            : `Records ₹${amount || 0} capital injected into garage account.`}
        </div>
      </form>
    </Modal>
  );
};
