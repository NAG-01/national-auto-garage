import React, { useState, useEffect } from 'react';
import { Calendar, User, Phone, Bike, MapPin, DollarSign, FileText } from 'lucide-react';
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

  const [errors, setErrors] = useState({});
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
    setErrors({});
  }, [record, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mobileNumber') {
      const cleanDigits = value.replace(/\D/g, '').slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: cleanDigits }));
      if (errors.mobileNumber && cleanDigits.length === 10) {
        setErrors((prev) => ({ ...prev, mobileNumber: null }));
      }
    } else if (name === 'pendingAmount') {
      const cleanAmt = value.replace(/\D/g, '');
      setFormData((prev) => ({ ...prev, [name]: cleanAmt }));
      if (errors.pendingAmount && cleanAmt) {
        setErrors((prev) => ({ ...prev, pendingAmount: null }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: null }));
      }
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer ka naam zaroori hai';
    }
    if (!formData.mobileNumber || formData.mobileNumber.length !== 10) {
      newErrors.mobileNumber = '10-digit mobile number likhein';
    }
    if (!formData.bikeName.trim()) {
      newErrors.bikeName = 'Bike ka naam zaroori hai';
    }
    const amt = Number(formData.pendingAmount);
    if (isNaN(amt) || !formData.pendingAmount || amt < 0) {
      newErrors.pendingAmount = 'Sahi baaki amount (₹) likhein';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        customerName: formData.customerName.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        bikeName: formData.bikeName.trim(),
        address: formData.address.trim(),
        pendingAmount: Number(formData.pendingAmount),
        notes: formData.notes.trim(),
      };

      if (isEdit) {
        await api.put(`/outstanding/${record._id}`, payload);
        toast.success('Baaki dues record successfully update ho gaya!');
      } else {
        await api.post('/outstanding', payload);
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
        {/* Form Top Banner */}
        <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-900 font-medium flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-orange-600 flex-shrink-0" />
          <span>Customer ke khate me baaki paise aur bike details enter karein.</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Tareekh (Date)"
            type="date"
            name="date"
            icon={Calendar}
            value={formData.date}
            onChange={handleChange}
            required
            error={errors.date}
          />

          <Input
            label="Customer Name"
            name="customerName"
            icon={User}
            placeholder="Customer ka naam likhein"
            value={formData.customerName}
            onChange={handleChange}
            required
            error={errors.customerName}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Mobile Number (Only 10 digits)"
            type="tel"
            name="mobileNumber"
            icon={Phone}
            inputMode="numeric"
            pattern="[0-9]*"
            onlyNumbers={true}
            maxLength={10}
            placeholder="10-digit mobile number"
            value={formData.mobileNumber}
            onChange={handleChange}
            required
            error={errors.mobileNumber}
          />

          <Input
            label="Bike Name"
            name="bikeName"
            icon={Bike}
            placeholder="e.g. Honda Activa 6G / Splendor"
            value={formData.bikeName}
            onChange={handleChange}
            required
            error={errors.bikeName}
          />
        </div>

        <Input
          label="Address (Pata)"
          name="address"
          icon={MapPin}
          placeholder="e.g. Shop No. 4, Main Road, City"
          value={formData.address}
          onChange={handleChange}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Baaki Amount (₹)"
            type="tel"
            name="pendingAmount"
            icon={DollarSign}
            inputMode="numeric"
            pattern="[0-9]*"
            onlyNumbers={true}
            placeholder="Kitne paise baaki hain (e.g. 1500)"
            value={formData.pendingAmount}
            onChange={handleChange}
            required
            error={errors.pendingAmount}
          />

          <Input
            label="Details / Notes (Optional)"
            name="notes"
            icon={FileText}
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
