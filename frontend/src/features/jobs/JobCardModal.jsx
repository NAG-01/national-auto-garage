import React, { useState, useEffect } from 'react';
import { User, Phone, Bike, Hash, Wrench, Flame } from 'lucide-react';
import api from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Modal, ModalCancelButton } from '../../components/ui/Modal.jsx';
import { Input, Textarea } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { validatePhone } from '../../utils/formatters.js';

export const JobCardModal = ({ isOpen, onClose, job, serviceType = 'FULL_SERVICE', seqNumber, onSuccess }) => {
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [bikeName, setBikeName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [serviceDetails, setServiceDetails] = useState('');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const toast = useToast();

  const isEngine = serviceType === 'ENGINE_JOB';

  useEffect(() => {
    if (job) {
      setCustomerName(job.customerNameSnapshot || '');
      setMobileNumber(job.mobileNumberSnapshot || '');
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
        serviceType: job ? job.serviceType : serviceType,
      };

      if (job) {
        await api.patch(`/jobs/${job._id}`, payload);
        toast.success(`Job #${seqNumber || ''} updated successfully.`);
      } else {
        await api.post('/jobs', payload);
        toast.success(`${isEngine ? 'Engine' : 'Full Service'} Job created successfully.`);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save job information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      confirmOnClose={true}
      title={
        job
          ? `Edit Job #${seqNumber || ''}`
          : isEngine
          ? 'New Engine Repair Job'
          : 'New Full Service Job'
      }
      subtitle={
        job
          ? 'Update customer & bike details below'
          : `Create new ${isEngine ? 'engine overhaul' : 'full service'} job card entry`
      }
      maxWidth="max-w-md"
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <ModalCancelButton disabled={loading}>
            Cancel
          </ModalCancelButton>
          <Button variant="accent" onClick={handleSubmit} loading={loading}>
            {job ? 'Save Changes' : 'Create Job'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
        {/* Customer Name */}
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

        {/* Mobile Number */}
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

        {/* Bike Name / Model */}
        <Input
          label="Bike Name / Model"
          required
          placeholder="e.g. Honda Activa 6G / Pulsar 150"
          value={bikeName}
          onChange={(e) => {
            setBikeName(e.target.value);
            if (errors.bikeName) setErrors({ ...errors, bikeName: '' });
          }}
          error={errors.bikeName}
          icon={Bike}
        />

        {/* Bike Number / Plate (Optional) */}
        <Input
          label="Bike Number / Plate (Optional)"
          placeholder="e.g. GJ 05 AB 1234"
          value={registrationNumber}
          onChange={(e) => setRegistrationNumber(e.target.value)}
          icon={Hash}
        />

        {/* Problem / Complaints (Optional) */}
        <Textarea
          label={isEngine ? 'Problem / Engine Complaints (Optional)' : 'Problem / Complaints (Optional)'}
          rows={3}
          placeholder={
            isEngine
              ? 'e.g. White smoke from exhaust, piston noise, clutch plate slipping...'
              : 'e.g. Engine oil change, front brake shoe wear, mileage issue...'
          }
          value={serviceDetails}
          onChange={(e) => setServiceDetails(e.target.value)}
        />
      </form>
    </Modal>
  );
};
