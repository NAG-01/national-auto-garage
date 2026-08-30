import React, { useState } from 'react';
import {
  Search,
  Bike,
  X,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { PublicBookingService } from '../services/publicBookingService.js';
import { formatRegNumber } from '../../utils/formatters.js';

export const TrackBikeModal = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setErrorMsg('Please enter your Bike Number or 10-digit Mobile Number.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const result = await PublicBookingService.trackVehicleStatus(searchQuery);
      if (!result.found) {
        setErrorMsg(result.message);
        setSearchResult(null);
      } else {
        setSearchResult(result);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to search records.');
      setSearchResult(null);
    } finally {
      setLoading(false);
    }
  };

  const getStepStatus = (currentStatus, stepNum) => {
    const statusUpper = (currentStatus || '').toUpperCase();
    if (statusUpper === 'DELIVERED') return 'completed';
    if (stepNum === 1) return 'completed';
    if (stepNum === 2) {
      if (statusUpper === 'IN_PROGRESS' || statusUpper === 'COMPLETED' || statusUpper === 'READY_FOR_DELIVERY')
        return 'completed';
      return 'pending';
    }
    if (stepNum === 3) {
      if (statusUpper === 'COMPLETED' || statusUpper === 'READY_FOR_DELIVERY') return 'completed';
      return 'pending';
    }
    if (stepNum === 4) {
      if (statusUpper === 'DELIVERED') return 'completed';
      return 'pending';
    }
    return 'pending';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in select-none">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-slate-900 relative">
        
        {/* Modal Top Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#0284C7] text-white shadow-xs">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                Track Bike Service Status
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Live workshop repair & inspection progress.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Search Input Bar */}
          <form onSubmit={handleSearch} className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Enter Vehicle Number or Mobile Number:
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Bike className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="e.g. GJ 05 AB 1234 or 9876543210"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/20 uppercase"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-2xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-sky-600/20 transition-all disabled:opacity-50 cursor-pointer shrink-0"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Search Status</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Search Result Display */}
          {searchResult && (
            <div className="space-y-6 pt-4 border-t border-slate-200 animate-in fade-in">
              
              {/* Job Header Card */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] font-black text-[#0284C7] uppercase tracking-widest">
                    {searchResult.job?.jobNumber || 'SERVICE JOB'}
                  </div>
                  <h4 className="text-lg font-black text-slate-900">
                    {searchResult.job?.bikeNameSnapshot || searchResult.booking?.bikeName || 'Two-Wheeler'}
                  </h4>
                  <div className="text-xs text-slate-600 font-medium mt-0.5">
                    Customer: <span className="text-slate-900 font-bold">{searchResult.job?.customerNameSnapshot || searchResult.booking?.customerName}</span>
                    {searchResult.job?.registrationNumberSnapshot && (
                      <span className="ml-2 px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-900 font-mono text-[11px] font-bold">
                        {formatRegNumber(searchResult.job.registrationNumberSnapshot)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-100 text-[#0284C7] border border-sky-200">
                  {searchResult.status || 'IN_PROGRESS'}
                </div>
              </div>

              {/* Progress Timeline */}
              <div className="space-y-3">
                <div className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Service Repair Timeline:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {/* Step 1: Received */}
                  <div
                    className={`p-3.5 rounded-2xl border text-center transition-all ${
                      getStepStatus(searchResult.status, 1) === 'completed'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 mx-auto flex items-center justify-center mb-2 font-bold text-xs">
                      1
                    </div>
                    <div className="text-xs">Vehicle Received</div>
                    <div className="text-[10px] font-normal mt-0.5">Initial inspection</div>
                  </div>

                  {/* Step 2: In Progress */}
                  <div
                    className={`p-3.5 rounded-2xl border text-center transition-all ${
                      getStepStatus(searchResult.status, 2) === 'completed'
                        ? 'bg-sky-50 border-sky-300 text-[#0284C7] font-bold ring-1 ring-sky-300'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 mx-auto flex items-center justify-center mb-2 font-bold text-xs">
                      2
                    </div>
                    <div className="text-xs">Repair In Progress</div>
                    <div className="text-[10px] font-normal mt-0.5">Mechanics at work</div>
                  </div>

                  {/* Step 3: Ready for Delivery */}
                  <div
                    className={`p-3.5 rounded-2xl border text-center transition-all ${
                      getStepStatus(searchResult.status, 3) === 'completed'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 mx-auto flex items-center justify-center mb-2 font-bold text-xs">
                      3
                    </div>
                    <div className="text-xs">Ready for Delivery</div>
                    <div className="text-[10px] font-normal mt-0.5">Quality check passed</div>
                  </div>

                  {/* Step 4: Completed */}
                  <div
                    className={`p-3.5 rounded-2xl border text-center transition-all ${
                      getStepStatus(searchResult.status, 4) === 'completed'
                        ? 'bg-purple-50 border-purple-300 text-purple-800 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 mx-auto flex items-center justify-center mb-2 font-bold text-xs">
                      4
                    </div>
                    <div className="text-xs">Delivered</div>
                    <div className="text-[10px] font-normal mt-0.5">Bill settled</div>
                  </div>
                </div>
              </div>

              {/* WhatsApp Garage Helpline */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-600 font-medium">
                  Have questions regarding your repair status or spare parts?
                </div>
                <a
                  href={`https://api.whatsapp.com/send?phone=919624844188&text=Hello%20National%20Auto%20Garage,%20I%20am%20checking%20status%20for%20my%20bike%20${encodeURIComponent(
                    searchResult.job?.bikeNameSnapshot || searchQuery
                  )}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-sm transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Garage</span>
                </a>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
