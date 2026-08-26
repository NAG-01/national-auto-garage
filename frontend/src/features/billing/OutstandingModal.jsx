import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import api from '../../api/client.js';

export const OutstandingModal = ({ isOpen, onClose, record, onSuccess }) => {
  const isEdit = Boolean(record && record._id);
  const toast = useToast();

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    customerName: '',
    mobileNumber: '',
    bikeName: '',
    address: '',
    pendingAmount: '',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (record) {
      const formattedDate = record.date
        ? new Date(record.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      setFormData({
        date: formattedDate,
        customerName: record.customerName || '',
        mobileNumber: record.mobileNumber || '',
        bikeName: record.bikeName || '',
        address: record.address || '',
        pendingAmount: record.pendingAmount !== undefined ? String(record.pendingAmount) : '',
        notes: record.notes || '',
      });
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        customerName: '',
        mobileNumber: '',
        bikeName: '',
        address: '',
        pendingAmount: '',
        notes: '',
      });
    }
  }, [record, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mobileNumber') {
      const cleanDigits = value.replace(/\D/g, '').slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: cleanDigits }));
    } else if (name === 'pendingAmount') {
      const cleanAmt = value.replace(/\D/g, '');
      setFormData((prev) => ({ ...prev, [name]: cleanAmt }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customerName.trim()) {
      toast.error('Kripya customer ka naam likhein.');
      return;
    }

    if (!formData.mobileNumber || formData.mobileNumber.length !== 10) {
      toast.error('Kripya 10-digit mobile number likhein.');
      return;
    }

    if (!formData.bikeName.trim()) {
      toast.error('Kripya bike ka naam likhein.');
      return;
    }

    const amt = Number(formData.pendingAmount);
    if (isNaN(amt) || amt < 0) {
      toast.error('Kripya sahi baaki amount likhein.');
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit) {
        await api.put(`/outstanding/${record._id}`, {
          ...formData,
          pendingAmount: amt,
        });
        toast.success('Baaki dues record successfully update ho gaya!');
      } else {
        await api.post('/outstanding', {
          ...formData,
          pendingAmount: amt,
        });
        toast.success('Naya baaki dues record add ho gaya!');
      }

      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Record save karne me error aaya.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Baaki Record Edit Karein' : '+ Naya Baaki / Dues Record Add Karein'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Tareekh (Date)"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />

          <Input
            label="Customer Name"
            name="customerName"
            placeholder="Customer ka naam likhein"
            value={formData.customerName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Mobile Number (Only 10 digits)"
            type="tel"
            name="mobileNumber"
            inputMode="numeric"
            pattern="[0-9]*"
            onlyNumbers={true}
            maxLength={10}
            placeholder="10-digit mobile number"
            value={formData.mobileNumber}
            onChange={handleChange}
            required
          />

          <Input
            label="Bike Name"
            name="bikeName"
            placeholder="e.g. Honda Activa 6G / Splendor"
            value={formData.bikeName}
            onChange={handleChange}
            required
          />
        </div>

        <Input
          label="Address (Pata)"
          name="address"
          placeholder="e.g. Shop No. 4, Main Road, City"
          value={formData.address}
          onChange={handleChange}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Baaki Amount (₹)"
            type="tel"
            name="pendingAmount"
            inputMode="numeric"
            pattern="[0-9]*"
            onlyNumbers={true}
            placeholder="Kitne paise baaki hain (e.g. 1500)"
            value={formData.pendingAmount}
            onChange={handleChange}
            required
          />

          <Input
            label="Details / Notes (Optional)"
            name="notes"
            placeholder="e.g. Service & spare parts baaki"
            value={formData.notes}
            onChange={handleChange}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {isEdit ? 'Update Record' : 'Save Record'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
