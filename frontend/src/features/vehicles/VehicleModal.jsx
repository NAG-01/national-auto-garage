import React, { useState, useEffect } from 'react';
import { Bike, Gauge, AlertCircle } from 'lucide-react';
import api from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Modal, ModalCancelButton } from '../../components/ui/Modal.jsx';
import { Input, Textarea } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { formatRegNumber } from '../../utils/formatters.js';

export const VehicleModal = ({ isOpen, onClose, customerId, vehicle, onSuccess }) => {
  const [bikeName, setBikeName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [currentKm, setCurrentKm] = useState(0);
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const toast = useToast();

  useEffect(() => {
    if (vehicle) {
      setBikeName(vehicle.bikeName || '');
      setRegistrationNumber(vehicle.registrationNumber ? formatRegNumber(vehicle.registrationNumber) : '');
      setCurrentKm(vehicle.currentKm ?? 0);
      setNotes(vehicle.notes || '');
    } else {
      setBikeName('');
      setRegistrationNumber('');
      setCurrentKm(0);
      setNotes('');
    }
    setErrors({});
    setServerError('');
  }, [vehicle, isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!bikeName.trim() || bikeName.trim().length < 2) {
      newErrors.bikeName = 'Bike name is required';
    }

    const km = Number(currentKm);
    if (isNaN(km) || km < 0) {
      newErrors.currentKm = 'Current KM cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        bikeName: bikeName.trim(),
        registrationNumber: registrationNumber.trim(),
        currentKm: Number(currentKm || 0),
        notes: notes.trim(),
      };

      if (vehicle) {
        await api.patch(`/vehicles/${vehicle._id}`, payload);
        toast.success(`Bike '${bikeName}' updated successfully.`);
      } else {
        await api.post(`/customers/${customerId}/vehicles`, payload);
        toast.success(`Bike '${bikeName}' registered successfully.`);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      const msg = err.message || 'Failed to save bike information.';
      setServerError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      confirmOnClose={true}
      title={vehicle ? `Edit Bike: ${vehicle.bikeName}` : 'Add New Bike'}
      subtitle={
        vehicle
          ? `Vehicle ID: ${vehicle.vehicleId}`
          : 'Register bike under customer profile for service jobs'
      }
      maxWidth="max-w-md"
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <ModalCancelButton disabled={loading}>
            Cancel
          </ModalCancelButton>
          <Button variant="accent" onClick={handleSubmit} loading={loading}>
            {vehicle ? 'Save Changes' : 'Add Bike'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
        {serverError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-800 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        <Input
          label="Bike Name / Model"
          required
          placeholder="e.g. Honda Activa 6G, TVS Jupiter, Pulsar 220"
          value={bikeName}
          onChange={(e) => {
            setBikeName(e.target.value);
            if (errors.bikeName) setErrors({ ...errors, bikeName: '' });
          }}
          error={errors.bikeName}
          icon={Bike}
        />

        <Input
          label="Number Plate (Optional)"
          placeholder="e.g. GJ 05 AB 1234"
          value={registrationNumber}
          onChange={(e) => {
            setRegistrationNumber(e.target.value);
            setServerError('');
          }}
        />

        <Input
          label="Current KM (Optional)"
          type="number"
          min="0"
          placeholder="e.g. 12500"
          value={currentKm}
          onChange={(e) => {
            setCurrentKm(e.target.value);
            if (errors.currentKm) setErrors({ ...errors, currentKm: '' });
          }}
          error={errors.currentKm}
          icon={Gauge}
        />

        <Textarea
          label="Notes (Optional)"
          rows={2}
          placeholder="e.g. Electric start issue, brake pad wear..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </form>
    </Modal>
  );
};
