import React, { useState } from 'react';
import {
  Calendar,
  User,
  Phone,
  Bike,
  Wrench,
  FileText,
  CheckCircle,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import { PublicBookingService } from '../services/publicBookingService.js';
import { cleanPhoneDigits } from '../../utils/formatters.js';

const SERVICE_OPTIONS = [
  'Periodic Full Bike Service',
  'Engine Overhaul & Tuning (Specialist)',
  'Brakes & Suspension Overhaul',
  'Electrical & Battery Diagnostics',
  'Drive Chain & Clutch Replacement',
  'General Inspection & Other Repairs',
];

export const BookingSection = ({ preselectedService }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    mobileNumber: '',
    bikeName: '',
    registrationNumber: '',
    serviceType: preselectedService || 'Periodic Full Bike Service',
    preferredDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [bookedDetails, setBookedDetails] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mobileNumber') {
      const digits = cleanPhoneDigits(value);
      setFormData((prev) => ({ ...prev, [name]: digits }));
      if (errors.mobileNumber && digits.length === 10) {
        setErrors((prev) => ({ ...prev, mobileNumber: null }));
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
      newErrors.customerName = 'Customer name is required.';
    }
    const cleanMobile = cleanPhoneDigits(formData.mobileNumber);
    if (!cleanMobile || cleanMobile.length !== 10) {
      newErrors.mobileNumber = '10-digit mobile number likhein.';
    }
    if (!formData.bikeName.trim()) {
      newErrors.bikeName = 'Bike name / model likhein (e.g. Activa 6G).';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await PublicBookingService.createBooking(formData);
      setBookedDetails(res);
    } catch (err) {
      alert(err.message || 'Booking submission failed. Please try again or WhatsApp us directly.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setBookedDetails(null);
    setFormData({
      customerName: '',
      mobileNumber: '',
      bikeName: '',
      registrationNumber: '',
      serviceType: 'Periodic Full Bike Service',
      preferredDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setErrors({});
  };

  return (
    <section id="booking-section" className="py-20 bg-white text-slate-900 relative select-none border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-[#0284C7] text-xs font-bold uppercase tracking-wider mb-3">
            <Calendar className="w-3.5 h-3.5" /> Book Online
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">
            Schedule Your Bike Service
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-2">
            Book your service slot in advance for zero waiting time and express delivery.
          </p>
        </div>

        {/* Booking Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-lg">
          
          {bookedDetails ? (
            /* Success State */
            <div className="text-center py-8 space-y-6 animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-400 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                  Service Appointment Received! 🎉
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-md mx-auto mt-2">
                  Thank you, <span className="text-slate-900 font-bold">{bookedDetails.customerName}</span>! Your request for <span className="text-[#0284C7] font-bold">{bookedDetails.bikeName}</span> on <span className="text-emerald-700 font-bold">{bookedDetails.preferredDate}</span> has been logged.
                </p>
              </div>

              {/* WhatsApp Quick Confirm Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={`https://api.whatsapp.com/send?phone=919624844188&text=Hello%20National%20Auto%20Garage,%20I%20just%20booked%20an%20online%20service%20for%20my%20${encodeURIComponent(
                    bookedDetails.bikeName
                  )}%20(Name:%20${encodeURIComponent(bookedDetails.customerName)},%20Date:%20${bookedDetails.preferredDate}).`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send Confirmation on WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider border border-slate-300 transition-all"
                >
                  Book Another Vehicle
                </button>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Customer Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Customer Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleChange}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/20 transition-all"
                    />
                  </div>
                  {errors.customerName && (
                    <p className="mt-1 text-[11px] text-rose-600 font-medium">{errors.customerName}</p>
                  )}
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Mobile Number (10 Digits) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      required
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      maxLength={10}
                      placeholder="e.g. 9876543210"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/20 transition-all"
                    />
                  </div>
                  {errors.mobileNumber && (
                    <p className="mt-1 text-[11px] text-rose-600 font-medium">{errors.mobileNumber}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Bike Name / Model */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Bike Model / Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Bike className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      name="bikeName"
                      value={formData.bikeName}
                      onChange={handleChange}
                      placeholder="e.g. Activa 6G / Splendor / Pulsar"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/20 transition-all"
                    />
                  </div>
                  {errors.bikeName && (
                    <p className="mt-1 text-[11px] text-rose-600 font-medium">{errors.bikeName}</p>
                  )}
                </div>

                {/* Bike Number (Optional) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Vehicle Number (Optional)
                  </label>
                  <input
                    type="text"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    placeholder="e.g. GJ 05 AB 1234"
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/20 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Service Type Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Select Service Required
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <select
                      name="serviceType"
                      value={formData.serviceType}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/20 transition-all"
                    >
                      {SERVICE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt} className="bg-white text-slate-900">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Preferred Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Preferred Service Date
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <input
                      type="date"
                      name="preferredDate"
                      value={formData.preferredDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/20 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Notes / Special Instructions */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Describe Problem (Optional)
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3.5 pointer-events-none text-slate-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <textarea
                    rows={2}
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="e.g. Engine noise, front brake issue, or oil service..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/20 transition-all"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Confirm & Book Service Appointment</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>
          )}

        </div>

      </div>
    </section>
  );
};
