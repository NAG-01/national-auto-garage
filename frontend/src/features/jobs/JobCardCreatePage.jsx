import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, Bike, Wrench, ShieldCheck, Hash } from 'lucide-react';
import api from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Input, Textarea } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { validatePhone } from '../../utils/formatters.js';

export const JobCardCreatePage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  // 3 Mandatory Fields
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [bikeName, setBikeName] = useState('');

  // 2 Optional Fields
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [serviceDetails, setServiceDetails] = useState('');

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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
        serviceType: 'FULL_SERVICE',
      };

      await api.post('/jobs', payload);
      toast.success('Full Service Job created successfully.');
      navigate('/jobs/full-service');
    } catch (err) {
      toast.error(err.message || 'Failed to create service job.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-10">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          icon={ArrowLeft}
          onClick={() => navigate('/jobs/full-service')}
          className="shrink-0"
        >
          Back
        </Button>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">New Full Service Job</h1>
          <p className="text-xs text-slate-500 font-medium">Create new job card entry for customer bike</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 sm:p-7 space-y-5">
          {/* Card Header Banner */}
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-extrabold shadow-2xs shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">JobCard Details</h2>
              <span className="text-xs text-slate-500 font-medium">Fill customer & vehicle info below</span>
            </div>
          </div>

          {/* Form Inputs */}
          <div className="space-y-4">
            {/* Customer Name (Mandatory) */}
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

            {/* Mobile Number (Mandatory) */}
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

            {/* Bike Name / Model (Mandatory) */}
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
              label="Problem / Complaints (Optional)"
              rows={3}
              placeholder="e.g. Engine oil change, front brake shoe wear, mileage issue..."
              value={serviceDetails}
              onChange={(e) => setServiceDetails(e.target.value)}
            />
          </div>

          {/* Form Action Footer - Responsive Grid for Clean Buttons */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 sm:flex sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/jobs/full-service')}
              disabled={loading}
              className="justify-center"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="accent"
              loading={loading}
              icon={ShieldCheck}
              className="justify-center whitespace-nowrap"
            >
              Create Job
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
