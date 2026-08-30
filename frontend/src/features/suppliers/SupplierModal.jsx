import React, { useState, useEffect } from 'react';
import api from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Modal, ModalCancelButton } from '../../components/ui/Modal.jsx';
import { Input, Textarea } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { validatePhone, cleanPhoneDigits } from '../../utils/formatters.js';

export const SupplierModal = ({ isOpen, onClose, supplier, onSuccess }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const toast = useToast();

  useEffect(() => {
    if (supplier) {
      setName(supplier.name || '');
      setPhone(cleanPhoneDigits(supplier.phone || ''));
      setAddress(supplier.address || '');
      setNotes(supplier.notes || '');
    } else {
      setName('');
      setPhone('');
      setAddress('');
      setNotes('');
    }
    setErrors({});
  }, [supplier, isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = 'Supplier name is required';
    }

    if (!phone || !validatePhone(phone)) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        phone: cleanPhoneDigits(phone),
        address: address.trim(),
        notes: notes.trim(),
      };

      if (supplier) {
        await api.patch(`/suppliers/${supplier._id}`, payload);
        toast.success('Supplier details updated successfully');
      } else {
        await api.post('/suppliers', payload);
        toast.success('Supplier added successfully');
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save supplier.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      confirmOnClose={true}
      title={supplier ? `Edit Supplier: ${supplier.name}` : 'Add New Supplier'}
      subtitle={
        supplier
          ? `Supplier ID: ${supplier.supplierId}`
          : 'Add supplier name, mobile number, and address'
      }
      maxWidth="max-w-md"
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <ModalCancelButton disabled={loading} size="md">
            Cancel
          </ModalCancelButton>
          <Button variant="accent" onClick={handleSubmit} loading={loading} size="md">
            {supplier ? 'Save Changes' : 'Add Supplier'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
        <Input
          label="Supplier Name"
          required
          placeholder="e.g. Metro Auto Spares"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors({ ...errors, name: '' });
          }}
          error={errors.name}
        />

        <Input
          label="Mobile Phone"
          required
          placeholder="e.g. 98250 98250"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            if (errors.phone) setErrors({ ...errors, phone: '' });
          }}
          error={errors.phone}
          hint="10-digit mobile number"
        />

        <Input
          label="Shop Address (Optional)"
          placeholder="e.g. Shop 12, Ring Road Market, Surat"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <Textarea
          label="Notes (Optional)"
          rows={2}
          placeholder="e.g. Supplies Motul engine oils, NGK spark plugs..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </form>
    </Modal>
  );
};
