import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Bike,
  User,
  Wrench,
  Gauge,
  Calendar,
  ArrowLeft,
  Plus,
  FileText,
} from 'lucide-react';
import api from '../../api/client.js';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { KpiCard } from '../../components/ui/KpiCard.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import { TableSkeleton } from '../../components/ui/Skeleton.jsx';
import { formatDate, formatINR } from '../../utils/formatters.js';

export const VehicleDetailPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchVehicle = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/vehicles/${id}`);
      setData(res.data);
    } catch (err) {
      console.error('Failed to load vehicle details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicle();
  }, [id]);

  if (loading) return <TableSkeleton rows={6} cols={4} />;
  if (!data?.vehicle) {
    return (
      <div className="p-12 text-center text-slate-500">
        Vehicle record not found.
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/vehicles')}>
            Back to Vehicles
          </Button>
        </div>
      </div>
    );
  }

  const { vehicle, jobs = [], invoices = [] } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/vehicles')}>
          Back
        </Button>
        <PageHeader
          title={`${vehicle.make} ${vehicle.model} (${vehicle.registrationNumber})`}
          subtitle={`Type: ${vehicle.vehicleType} • Mfg Year: ${vehicle.manufacturingYear || 'N/A'}`}
          actions={
            <Button
              variant="accent"
              size="sm"
              icon={Plus}
              onClick={() =>
                navigate(`/jobs/new?vehicleId=${vehicle._id}&customerId=${vehicle.customerId?._id}`)
              }
            >
              Create Job Card
            </Button>
          }
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title="Current Odometer"
          value={`${vehicle.currentKm} KM`}
          subtitle="Last recorded mileage"
          icon={Gauge}
          variant="accent"
        />

        <KpiCard
          title="Total Service Jobs"
          value={jobs.length}
          subtitle="Service maintenance visits"
          icon={Wrench}
          variant="info"
        />

        <KpiCard
          title="Registered Owner"
          value={vehicle.customerId?.name || 'Unassigned'}
          subtitle={vehicle.customerId?.phone || '—'}
          icon={User}
          variant="default"
        />
      </div>

      {/* Service Records on Vehicle */}
      <Card
        title={`Service Maintenance History (${jobs.length})`}
        subtitle="Chronological service visits, parts replaced, and inspections"
        noPadding
      >
        {jobs.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No service records for this two-wheeler yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {jobs.map((job) => (
              <div
                key={job._id}
                onClick={() => navigate(`/jobs/${job._id}`)}
                className="p-4 hover:bg-slate-50/80 transition-colors cursor-pointer flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{job.jobId}</span>
                    <span className="text-xs font-semibold text-slate-500">
                      {job.serviceTypeId?.name}
                    </span>
                    <span className="text-xs text-slate-400">• {formatDate(job.createdAt)}</span>
                  </div>
                  <div className="text-xs text-slate-600 mt-1 max-w-xl truncate">
                    {job.customerComplaint}
                  </div>
                  {job.assignedMechanicId && (
                    <div className="text-[11px] text-slate-500 mt-1">
                      Mechanic: <span className="font-medium text-slate-700">{job.assignedMechanicId.name}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900">
                      {formatINR(job.estimatedTotal)}
                    </div>
                  </div>
                  <StatusBadge status={job.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
