import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  FileText,
  Calendar,
  Bike,
  Plus,
  Edit2,
  Archive,
  RefreshCw,
  Wrench,
  Gauge,
  AlertTriangle,
} from 'lucide-react';
import api from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge, StatusBadge } from '../../components/ui/Badge.jsx';
import { Table } from '../../components/ui/Table.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { ErrorState } from '../../components/ui/ErrorState.jsx';
import { ConfirmDialog } from '../../components/ui/Modal.jsx';
import { CustomerModal } from './CustomerModal.jsx';
import { VehicleModal } from '../vehicles/VehicleModal.jsx';
import { formatPhone, formatDate, formatRegNumber, formatINR, formatNumber } from '../../utils/formatters.js';

export const CustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const [archiveConfirm, setArchiveConfirm] = useState(false);
  const [restoreConfirm, setRestoreConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCustomerDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/customers/${id}`);
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load customer profile.');
      toast.error('Failed to load customer details.');
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchCustomerDetails();
  }, [fetchCustomerDetails]);

  const handleArchive = async () => {
    setActionLoading(true);
    try {
      await api.patch(`/customers/${id}/archive`);
      toast.success('Customer archived successfully.');
      setArchiveConfirm(false);
      fetchCustomerDetails();
    } catch (err) {
      toast.error(err.message || 'Failed to archive customer.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async () => {
    setActionLoading(true);
    try {
      await api.patch(`/customers/${id}/restore`);
      toast.success('Customer restored successfully.');
      setRestoreConfirm(false);
      fetchCustomerDetails();
    } catch (err) {
      toast.error(err.message || 'Failed to restore customer.');
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

  if (error || !data?.customer) {
    return (
      <ErrorState
        title="Customer Not Found"
        message={error || 'The requested customer record does not exist.'}
        onRetry={() => navigate('/customers')}
      />
    );
  }

  const { customer, vehicles = [], serviceHistory = [], outstandingBills = [], totalOutstanding = 0 } = data;

  const serviceColumns = [
    {
      header: 'Job ID',
      accessor: 'jobId',
      render: (j) => (
        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded">
          {j.jobId}
        </span>
      ),
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      render: (j) => formatDate(j.createdAt),
    },
    {
      header: 'Service Type',
      accessor: 'serviceType',
      render: (j) => (
        <span className="font-medium text-slate-900">{j.serviceType?.replace(/_/g, ' ')}</span>
      ),
    },
    {
      header: 'Bike / Vehicle',
      accessor: 'bikeNameSnapshot',
      render: (j) => j.bikeNameSnapshot || '—',
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (j) => <StatusBadge status={j.status} />,
    },
    {
      header: 'Amount',
      accessor: 'grandTotal',
      className: 'text-right font-mono font-semibold',
      render: (j) => formatINR(j.grandTotal || 0),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate('/customers')}
            title="Back to Customers Directory"
          >
            Back
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900">{customer.name}</h1>
              <span className="font-mono text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
                {customer.customerId}
              </span>
              <StatusBadge status={customer.isActive ? 'ACTIVE' : 'ARCHIVED'} />
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Phone: {formatPhone(customer.mobileNumber)} • Registered: {formatDate(customer.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {customer.isActive ? (
            <>
              <Button
                variant="accent"
                icon={Plus}
                onClick={() => {
                  setSelectedVehicle(null);
                  setIsVehicleModalOpen(true);
                }}
              >
                Add Bike
              </Button>

              <Button
                variant="outline"
                icon={Edit2}
                onClick={() => setIsCustomerModalOpen(true)}
              >
                Edit Customer
              </Button>

              <Button
                variant="ghost"
                icon={Archive}
                className="text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                onClick={() => setArchiveConfirm(true)}
                title="Archive Customer"
              />
            </>
          ) : (
            <Button
              variant="outline"
              icon={RefreshCw}
              className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
              onClick={() => setRestoreConfirm(true)}
            >
              Restore Customer
            </Button>
          )}
        </div>
      </div>

      {/* Overview Specs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 space-y-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-orange-600" />
            Contact Info
          </div>
          <div className="text-sm font-semibold text-slate-900">{customer.name}</div>
          <div className="text-xs font-mono text-slate-600 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            {formatPhone(customer.mobileNumber)}
          </div>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-orange-600" />
            Address & Notes
          </div>
          <div className="text-xs text-slate-800">
            {customer.address ? customer.address : <span className="text-slate-400 italic">No address recorded</span>}
          </div>
          {customer.notes && (
            <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 flex items-start gap-1">
              <FileText className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
              <span>{customer.notes}</span>
            </div>
          )}
        </Card>

        <Card className="p-4 space-y-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Outstanding Balance
          </div>
          <div className="text-lg font-bold font-mono text-slate-900">
            {totalOutstanding > 0 ? (
              <span className="text-rose-600">{formatINR(totalOutstanding)}</span>
            ) : (
              <span className="text-emerald-600">₹0.00 (Fully Settled)</span>
            )}
          </div>
          <div className="text-[11px] text-slate-500">
            {outstandingBills.length} unpaid / partially-paid bills
          </div>
        </Card>
      </div>

      {/* Registered Bikes / Vehicles Section */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600">
              <Bike className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Bikes / Vehicles ({vehicles.length})
              </h2>
              <p className="text-xs text-slate-500">
                Registered two-wheelers belonging to {customer.name}
              </p>
            </div>
          </div>

          {customer.isActive && (
            <Button
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={() => {
                setSelectedVehicle(null);
                setIsVehicleModalOpen(true);
              }}
            >
              Add Bike
            </Button>
          )}
        </div>

        {vehicles.length === 0 ? (
          <EmptyState
            icon={Bike}
            title="No bikes registered yet"
            description="Add bikes to this customer profile to start creating service job cards."
            actionLabel="Add Bike"
            onAction={() => {
              setSelectedVehicle(null);
              setIsVehicleModalOpen(true);
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vehicles.map((v) => (
              <div
                key={v._id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{v.bikeName}</h3>
                      <span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {v.vehicleId}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-xs">
                      {v.registrationNumber ? (
                        <span className="font-mono font-extrabold text-slate-800 bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded tracking-wider uppercase">
                          {formatRegNumber(v.registrationNumber)}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">No Plate Number</span>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Edit2}
                    onClick={() => {
                      setSelectedVehicle(v);
                      setIsVehicleModalOpen(true);
                    }}
                    title="Edit Bike Specs"
                  />
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-mono">
                    <Gauge className="w-3.5 h-3.5 text-slate-400" />
                    {v.currentKm ? `${formatNumber(v.currentKm)} KM` : '0 KM'}
                  </span>
                  {v.notes && <span className="truncate max-w-[180px] italic">{v.notes}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Service History Section */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Service History ({serviceHistory.length})
            </h2>
            <p className="text-xs text-slate-500">
              Read-only log of full service jobs and repairs for {customer.name}
            </p>
          </div>
        </div>

        {serviceHistory.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="No service history yet"
            description="Service jobs created in future phases will automatically appear in this historical ledger."
          />
        ) : (
          <Table columns={serviceColumns} data={serviceHistory} />
        )}
      </Card>

      {/* Edit Customer Modal */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        customer={customer}
        onSuccess={fetchCustomerDetails}
      />

      {/* Add / Edit Bike Modal */}
      <VehicleModal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        customerId={customer._id}
        vehicle={selectedVehicle}
        onSuccess={fetchCustomerDetails}
      />

      {/* Confirm Archive Modal */}
      <ConfirmDialog
        isOpen={archiveConfirm}
        onClose={() => setArchiveConfirm(false)}
        onConfirm={handleArchive}
        loading={actionLoading}
        title={`Archive Customer '${customer.name}'?`}
        message="This will archive the customer profile. All registered bikes and historical records will remain intact."
        confirmText="Archive Customer"
        variant="warning"
      />

      {/* Confirm Restore Modal */}
      <ConfirmDialog
        isOpen={restoreConfirm}
        onClose={() => setRestoreConfirm(false)}
        onConfirm={handleRestore}
        loading={actionLoading}
        title={`Restore Customer '${customer.name}'?`}
        message="This will restore the customer profile to active status."
        confirmText="Restore Customer"
        variant="info"
      />
    </div>
  );
};
