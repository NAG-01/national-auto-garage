import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, AlertCircle, ArrowRight } from 'lucide-react';
import api from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Modal, ModalCancelButton } from '../../components/ui/Modal.jsx';
import { Input, Textarea } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { validatePhone, formatPhone } from '../../utils/formatters.js';

export const CustomerModal = ({ isOpen, onClose, customer, onSuccess }) => {
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [duplicateConflict, setDuplicateConflict] = useState(null);

  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (customer) {
      setName(customer.name || '');
      setMobileNumber(customer.mobileNumber ? formatPhone(customer.mobileNumber) : '');
      setAddress(customer.address || '');
      setNotes(customer.notes || '');
    } else {
      setName('');
      setMobileNumber('');
      setAddress('');
      setNotes('');
    }
    setErrors({});
    setDuplicateConflict(null);
  }, [customer, isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = 'Customer name is required';
    }

    if (!mobileNumber || !validatePhone(mobileNumber)) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDuplicateConflict(null);
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        mobileNumber: mobileNumber.trim(),
        address: address.trim(),
        notes: notes.trim(),
      };

      if (customer) {
        await api.patch(`/customers/${customer._id}`, payload);
        toast.success('Customer details updated successfully.');
      } else {
        await api.post('/customers', payload);
        toast.success('Customer added successfully.');
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      if (err.existingCustomer || err.message?.includes('already exists')) {
        setDuplicateConflict(err.existingCustomer || { message: err.message });
      } else {
        toast.error(err.message || 'Failed to save customer.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      confirmOnClose={true}
      title={customer ? `Edit Customer: ${customer.name}` : 'Add New Customer'}
      subtitle={
        customer
          ? `Customer ID: ${customer.customerId}`
          : 'Add customer name, phone number, and address'
      }
      maxWidth="max-w-md"
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <ModalCancelButton disabled={loading} size="md">
            Cancel
          </ModalCancelButton>
          <Button variant="accent" onClick={handleSubmit} loading={loading} size="md">
            {customer ? 'Save Changes' : 'Add Customer'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
        {duplicateConflict && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-xs text-rose-800">
            <div className="flex items-start gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>Customer already exists with this mobile number.</span>
            </div>
            {duplicateConflict._id && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={ArrowRight}
                onClick={() => {
                  onClose();
                  navigate(`/customers/${duplicateConflict._id}`);
                }}
                className="w-full text-rose-900 border-rose-300 hover:bg-rose-100"
              >
                View Existing Customer ({duplicateConflict.name})
              </Button>
            )}
          </div>
        )}

        <Input
          label="Customer Full Name"
          required
          placeholder="e.g. Ramesh Kumar"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors({ ...errors, name: '' });
          }}
          error={errors.name}
          icon={User}
        />

        <Input
          label="Mobile Phone"
          required
          placeholder="e.g. 98765 43210"
          value={mobileNumber}
          onChange={(e) => {
            setMobileNumber(e.target.value);
            if (errors.mobileNumber) setErrors({ ...errors, mobileNumber: '' });
            setDuplicateConflict(null);
          }}
          error={errors.mobileNumber}
          hint="10-digit mobile number"
        />

        <Input
          label="Address (Optional)"
          placeholder="e.g. 42, Varachha Main Road, Surat"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <Textarea
          label="Notes (Optional)"
          rows={2}
          placeholder="e.g. Prefers Saturday morning appointments..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </form>
    </Modal>
  );
};
