import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, FileText, Wrench, User, Phone, Bike, ShieldCheck } from 'lucide-react';
import api from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Input, Select } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { formatINR, formatPhone, formatRegNumber, formatDate } from '../../utils/formatters.js';

export const InvoiceCreatePage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const preselectedJobId = searchParams.get('jobId');

  const [allJobs, setAllJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(preselectedJobId || '');
  const [selectedJob, setSelectedJob] = useState(null);

  // Manual Bill Fields (if no job selected)
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [bikeName, setBikeName] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('UNPAID');

  const [loading, setLoading] = useState(false);
  const [fetchingJobs, setFetchingJobs] = useState(true);

  // Fetch all service jobs
  useEffect(() => {
    const fetchJobs = async () => {
      setFetchingJobs(true);
      try {
        const res = await api.get('/jobs', {
          params: { limit: 100 },
        });
        const list = res.data || res.jobs || [];
        setAllJobs(list);

        if (preselectedJobId) {
          const match = list.find((j) => j._id === preselectedJobId);
          if (match) {
            setSelectedJobId(match._id);
            setSelectedJob(match);
          }
        } else if (list.length > 0) {
          setSelectedJobId(list[0]._id);
          setSelectedJob(list[0]);
        }
      } catch (err) {
        console.error('Failed to load service jobs:', err);
      } finally {
        setFetchingJobs(false);
      }
    };
    fetchJobs();
  }, [preselectedJobId]);

  const handleJobChange = (e) => {
    const id = e.target.value;
    setSelectedJobId(id);
    const match = allJobs.find((j) => j._id === id);
    setSelectedJob(match || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (selectedJobId && selectedJob) {
        // Generate from selected job card
        const res = await api.post('/invoices', {
          jobId: selectedJob._id,
        });
        toast.success(`Bill generated successfully!`);
        navigate('/invoices');
      } else {
        // Create manual bill entry
        if (!customerName.trim()) {
          toast.error('Customer name is required.');
          setLoading(false);
          return;
        }
        if (!billAmount || Number(billAmount) <= 0) {
          toast.error('Please enter a valid bill amount.');
          setLoading(false);
          return;
        }
        const payload = {
          customerName: customerName.trim(),
          mobileNumber: mobileNumber.trim(),
          bikeName: bikeName.trim(),
          grandTotal: Number(billAmount),
          paymentStatus,
        };
        await api.post('/invoices', payload);
        toast.success('Bill generated successfully!');
        navigate('/invoices');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to generate bill.');
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
          onClick={() => navigate('/invoices')}
          className="shrink-0"
        >
          Back
        </Button>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Create New Bill / Invoice</h1>
          <p className="text-xs text-slate-500 font-medium">Select a service job or create a direct bill entry</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 sm:p-7 space-y-5">
          {/* Card Banner */}
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-extrabold shadow-2xs shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Bill Parcha Details</h2>
              <span className="text-xs text-slate-500 font-medium">Select job card or type bill details</span>
            </div>
          </div>

          {/* Select Service Job Card */}
          {fetchingJobs ? (
            <div className="p-4 text-center text-xs text-slate-500 font-mono">Loading service jobs...</div>
          ) : allJobs.length > 0 ? (
            <div className="space-y-3">
              <Select
                label="Select Service Job Card"
                value={selectedJobId}
                onChange={handleJobChange}
              >
                <option value="">-- Manual Direct Bill Entry --</option>
                {allJobs.map((j, idx) => (
                  <option key={j._id} value={j._id}>
                    #{idx + 1} {j.customerNameSnapshot} • {j.bikeNameSnapshot} ({formatDate(j.createdAt)})
                  </option>
                ))}
              </Select>
            </div>
          ) : null}

          {/* Manual Input Fields if no Job Card selected */}
          {!selectedJobId && (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <Input
                label="Customer Name *"
                placeholder="e.g. Ramesh Kumar"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                icon={User}
              />

              <Input
                label="Mobile Number *"
                placeholder="e.g. 9876543210"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                icon={Phone}
              />

              <Input
                label="Bike Name / Model"
                placeholder="e.g. Honda Activa 6G"
                value={bikeName}
                onChange={(e) => setBikeName(e.target.value)}
                icon={Bike}
              />

              <Input
                label="Bill Amount (₹) *"
                type="number"
                min="1"
                placeholder="e.g. 1500"
                value={billAmount}
                onChange={(e) => setBillAmount(e.target.value)}
              />

              <Select
                label="Payment Status"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
              >
                <option value="UNPAID">UNPAID (Udhaar / Baaki)</option>
                <option value="PAID">PAID (Full Payment Done)</option>
                <option value="PARTIAL">PARTIAL (Half Paid)</option>
              </Select>
            </div>
          )}

          {/* Form Action Footer */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 sm:flex sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/invoices')}
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
              Generate Bill
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
