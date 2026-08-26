import React, { useState } from 'react';
import api from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Input, Select, Textarea } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';

export const StockAdjustmentModal = ({ isOpen, onClose, product, onSuccess }) => {
  const [movementType, setMovementType] = useState('MANUAL_ADJUSTMENT');
  const [quantityChange, setQuantityChange] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const qty = Number(quantityChange);
    if (isNaN(qty) || qty === 0) {
      toast.error('Quantity change must be a non-zero number.');
      return;
    }

    if (!notes.trim()) {
      toast.error('Reason / Notes are required for manual stock adjustments.');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/inventory/${product._id}/adjust-stock`, {
        movementType,
        quantityChange: qty,
        reasonNotes: notes.trim(),
      });
      toast.success('Inventory stock adjusted successfully.');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to adjust stock.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Adjust Stock: ${product?.name}`}
      subtitle={`Product ID: ${product?.productId} • Current Stock: ${product?.currentStock} ${product?.unit || 'PCS'}`}
      maxWidth="max-w-md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="accent" onClick={handleSubmit} loading={loading}>
            Confirm Stock Adjustment
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Adjustment Reason Type *"
          value={movementType}
          onChange={(e) => setMovementType(e.target.value)}
        >
          <option value="MANUAL_ADJUSTMENT">Manual Stock Count Adjustment</option>
          <option value="DAMAGED_EXPIRED">Damaged / Expired Goods</option>
          <option value="CORRECTION">Inventory Audit Correction</option>
        </Select>

        <Input
          label="Quantity Change (+ to Add, - to Deduct) *"
          type="number"
          placeholder="e.g. +5 or -2"
          value={quantityChange}
          onChange={(e) => setQuantityChange(e.target.value)}
          hint="Use positive number for intake, negative number for audit deduction"
        />

        <Textarea
          label="Reason Notes *"
          required
          rows={2}
          placeholder="e.g. Physical inventory count verified on shelf B2"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </form>
    </Modal>
  );
};
