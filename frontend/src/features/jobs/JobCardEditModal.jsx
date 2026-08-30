import React, { useState, useEffect } from 'react';
import { User, Phone, Bike, Hash } from 'lucide-react';
import api from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Modal, ModalCancelButton } from '../../components/ui/Modal.jsx';
import { Input, Textarea } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { validatePhone, cleanPhoneDigits } from '../../utils/formatters.js';

export const JobCardEditModal = ({ isOpen, onClose, job, onSuccess, seqNumber }) => {
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [bikeName, setBikeName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [serviceDetails, setServiceDetails] = useState('');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const toast = useToast();

  useEffect(() => {
    if (job) {
      setCustomerName(job.customerNameSnapshot || '');
      setMobileNumber(cleanPhoneDigits(job.mobileNumberSnapshot || ''));
      setBikeName(job.bikeNameSnapshot || '');
      setRegistrationNumber(job.registrationNumberSnapshot || '');
      setServiceDetails(job.serviceDetails || '');
    } else {
      setCustomerName('');
      setMobileNumber('');
      setBikeName('');
      setRegistrationNumber('');
      setServiceDetails('');
    }
    setErrors({});
  }, [job, isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!customerName.trim() || customerName.trim().length < 2) {
      newErrors.customerName = 'Customer name is required';
    }
    if (!mobileNumber.trim() || !validatePhone(mobileNumber)) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
    }
    if (!bikeName.trim()) {
      newErrors.bikeName = 'Bike name is required';
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
        customerName: customerName.trim(),
        mobileNumber: mobileNumber.trim(),
        bikeName: bikeName.trim(),
        registrationNumber: registrationNumber.trim(),
        serviceDetails: serviceDetails.trim(),
      };

      await api.patch(`/jobs/${job._id}`, payload);
      toast.success(`Service Job #${seqNumber || ''} updated successfully.`);
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to update service job.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      confirmOnClose={true}
      title={`Edit Service Job #${seqNumber || ''}`}
      subtitle="Update customer & bike information"
      maxWidth="max-w-md"
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <ModalCancelButton disabled={loading}>
            Cancel
          </ModalCancelButton>
          <Button variant="accent" onClick={handleSubmit} loading={loading}>
            Save Changes
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
        <Input
          label="Customer Name"
          required
          placeholder="e.g. Ramesh Kumar"
          value={customerName}
          onChange={(e) => {
            setCustomerName(e.target.value);
            if (errors.customerName) setErrors({ ...errors, customerName: '' });
          }}
          error={errors.customerName}
          icon={User}
        />

        <Input
          label="Mobile Number"
          required
          placeholder="e.g. 9876543210"
          value={mobileNumber}
          onChange={(e) => {
            setMobileNumber(e.target.value);
            if (errors.mobileNumber) setErrors({ ...errors, mobileNumber: '' });
          }}
          error={errors.mobileNumber}
          icon={Phone}
        />

        <Input
          label="Bike Name / Model"
          required
          placeholder="e.g. Honda Activa 6G"
          value={bikeName}
          onChange={(e) => {
            setBikeName(e.target.value);
            if (errors.bikeName) setErrors({ ...errors, bikeName: '' });
          }}
          error={errors.bikeName}
          icon={Bike}
        />

        <Input
          label="Bike Number / Plate (Optional)"
          placeholder="e.g. GJ 05 AB 1234"
          value={registrationNumber}
          onChange={(e) => setRegistrationNumber(e.target.value)}
          icon={Hash}
        />

        <Textarea
          label="Problem / Complaints (Optional)"
          rows={3}
          placeholder="e.g. Engine oil change, front brake shoe wear..."
          value={serviceDetails}
          onChange={(e) => setServiceDetails(e.target.value)}
        />
      </form>
    </Modal>
  );
};
