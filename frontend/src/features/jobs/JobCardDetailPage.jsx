import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Wrench,
  User,
  Bike,
  FileText,
  Package,
  PlayCircle,
  CheckCircle2,
  PackageCheck,
  XCircle,
  AlertCircle,
  ShieldCheck,
  Gauge,
  Phone,
} from 'lucide-react';
import api from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import { Table } from '../../components/ui/Table.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import { ErrorState } from '../../components/ui/ErrorState.jsx';
import { ConfirmDialog } from '../../components/ui/Modal.jsx';
import { formatPhone, formatDate, formatINR, formatRegNumber, formatNumber } from '../../utils/formatters.js';

export const JobCardDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [actionStatus, setActionStatus] = useState(null); // target status to confirm
  const [actionLoading, setActionLoading] = useState(false);

  const fetchJobDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/jobs/${id}`);
      setJob(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load service job details.');
      toast.error('Failed to load service job.');
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchJobDetails();
  }, [fetchJobDetails]);

  const handleUpdateStatus = async (targetStatus) => {
    setActionLoading(true);
    try {
      await api.patch(`/jobs/${id}/status`, { status: targetStatus });
      toast.success(`Service Job status updated to ${targetStatus}.`);
      setActionStatus(null);
      fetchJobDetails();
    } catch (err) {
      toast.error(err.message || 'Failed to update job status.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton rows={2} />
        <Skeleton rows={8} />
      </div>
    );
  }

  if (error || !job) {
    return (
      <ErrorState
        title="Job Not Found"
        message={error || 'The requested service job card does not exist.'}
        onRetry={() => navigate('/jobs/full-service')}
      />
    );
  }

  const partsColumns = [
    {
      header: 'Part / Product Name',
      accessor: 'productNameSnapshot',
      render: (item) => (
        <span className="font-semibold text-slate-900">{item.productNameSnapshot}</span>
      ),
    },
    {
      header: 'Unit Price',
      accessor: 'unitPriceSnapshot',
      className: 'font-mono text-xs text-slate-700',
      render: (item) => formatINR(item.unitPriceSnapshot),
    },
    {
      header: 'Qty',
      accessor: 'quantity',
      className: 'font-mono text-xs font-bold text-slate-900',
    },
    {
      header: 'Line Total',
      accessor: 'lineTotal',
      className: 'text-right font-mono font-bold text-slate-900',
      render: (item) => formatINR(item.lineTotal),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate('/jobs/full-service')}
          >
            Back
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900">{job.jobId}</h1>
              <StatusBadge status={job.status} />
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Type: {job.serviceType?.replace('_', ' ')} • Created: {formatDate(job.createdAt)}
            </p>
          </div>
        </div>

        {/* Status Workflow Action Buttons */}
        <div className="flex items-center gap-2">
          {job.status === 'PENDING' && (
            <>
              <Button
                variant="accent"
                icon={PlayCircle}
                onClick={() => handleUpdateStatus('IN_PROGRESS')}
              >
                Start Progress
              </Button>
              <Button
                variant="ghost"
                icon={XCircle}
                className="text-rose-600 hover:bg-rose-50"
                onClick={() => setActionStatus('CANCELLED')}
              >
                Cancel Job
              </Button>
            </>
          )}

          {job.status === 'IN_PROGRESS' && (
            <>
              <Button
                variant="accent"
                icon={CheckCircle2}
                onClick={() => setActionStatus('COMPLETED')}
              >
                Mark COMPLETED & Deduct Stock
              </Button>
              <Button
                variant="ghost"
                icon={XCircle}
                className="text-rose-600 hover:bg-rose-50"
                onClick={() => setActionStatus('CANCELLED')}
              >
                Cancel Job
              </Button>
            </>
          )}

          {job.status === 'COMPLETED' && (
            <Button
              variant="accent"
              icon={PackageCheck}
              onClick={() => handleUpdateStatus('DELIVERED')}
            >
              Mark DELIVERED
            </Button>
          )}
        </div>
      </div>

      {/* Stock Deduction Status Banner */}
      {job.isStockDeducted && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-xs text-emerald-900">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Inventory Stock Deducted & Recorded in Ledger</div>
            <div className="text-[11px] text-emerald-700 mt-0.5">
              Spare parts stock used in this job card was subtracted atomically and logged under movement type <strong>SERVICE_USAGE</strong> with reference <strong>{job.jobId}</strong>.
            </div>
          </div>
        </div>
      )}

      {/* Overview Cards: Customer & Vehicle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer Card */}
        <Card className="p-4 space-y-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-orange-600" />
            Customer Information
          </div>
          <div className="text-sm font-bold text-slate-900">
            {job.customerId?.name || job.customerNameSnapshot}
          </div>
          <div className="text-xs font-mono text-slate-600 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            {formatPhone(job.customerId?.mobileNumber || job.mobileNumberSnapshot)}
          </div>
        </Card>

        {/* Vehicle Card */}
        <Card className="p-4 space-y-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Bike className="w-3.5 h-3.5 text-orange-600" />
            Bike / Vehicle Information
          </div>
          <div className="text-sm font-bold text-slate-900">
            {job.vehicleId?.bikeName || job.bikeNameSnapshot}
          </div>
          <div className="flex items-center gap-3 text-xs">
            {job.registrationNumberSnapshot ? (
              <span className="font-mono font-extrabold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded uppercase">
                {formatRegNumber(job.registrationNumberSnapshot)}
              </span>
            ) : (
              <span className="text-slate-400 italic">No Plate Number</span>
            )}
            {job.vehicleId?.currentKm && (
              <span className="font-mono text-slate-600 flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-slate-400" />
                {formatNumber(job.vehicleId.currentKm)} KM
              </span>
            )}
          </div>
        </Card>
      </div>

      {/* Service Details Card */}
      <Card className="p-6 space-y-2">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-orange-600" />
          Service / Problem Details Description
        </div>
        <div className="text-sm text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100 font-normal leading-relaxed">
          {job.serviceDetails}
        </div>
      </Card>

      {/* Spare Parts Used Table */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
            <Package className="w-4 h-4" />
          </div>
          <h2 className="text-base font-bold text-slate-900">
            Spare Parts Used ({job.items?.length || 0})
          </h2>
        </div>

        {job.items?.length === 0 ? (
          <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500 italic">
            No spare parts added to this service job.
          </div>
        ) : (
          <Table columns={partsColumns} data={job.items} />
        )}
      </Card>

      {/* Financial Summary Box */}
      <Card className="p-6 space-y-3">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Financial Summary
        </div>
        <div className="p-4 bg-slate-900 rounded-xl text-white space-y-2 font-mono">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Spare Parts Subtotal:</span>
            <span>{formatINR(job.partsTotal || 0)}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>Labour Charges:</span>
            <span>{formatINR(job.labourCharges || 0)}</span>
          </div>
          <div className="border-t border-slate-800 pt-2 flex justify-between text-sm font-bold text-orange-400">
            <span>Grand Total:</span>
            <span className="text-base">{formatINR(job.grandTotal || 0)}</span>
          </div>
        </div>
      </Card>

      {/* Confirm COMPLETED Status Modal */}
      <ConfirmDialog
        isOpen={actionStatus === 'COMPLETED'}
        onClose={() => setActionStatus(null)}
        onConfirm={() => handleUpdateStatus('COMPLETED')}
        loading={actionLoading}
        title="Mark Service Job COMPLETED & Deduct Stock?"
        message={`Confirming COMPLETED status will subtract spare parts quantities from Product inventory stock and log InventoryMovement SERVICE_USAGE records for job ${job.jobId}.`}
        confirmText="Confirm COMPLETED & Deduct Stock"
        variant="accent"
      />

      {/* Confirm Cancel Modal */}
      <ConfirmDialog
        isOpen={actionStatus === 'CANCELLED'}
        onClose={() => setActionStatus(null)}
        onConfirm={() => handleUpdateStatus('CANCELLED')}
        loading={actionLoading}
        title={`Cancel Service Job '${job.jobId}'?`}
        message="Are you sure you want to cancel this service job card? If stock was previously deducted, it will be safely restored."
        confirmText="Cancel Job"
        variant="danger"
      />
    </div>
  );
};
