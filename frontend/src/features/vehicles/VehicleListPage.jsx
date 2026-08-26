import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bike, Plus, User, Gauge, Eye, Edit2, Trash2 } from 'lucide-react';
import api from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { SearchInput } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Pagination,
} from '../../components/ui/Table.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { ErrorState } from '../../components/ui/ErrorState.jsx';
import { TableSkeleton } from '../../components/ui/Skeleton.jsx';
import { ConfirmDialog } from '../../components/ui/Modal.jsx';
import { VehicleModal } from './VehicleModal.jsx';

export const VehicleListPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Delete Bike Confirmation State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  const fetchVehicles = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    setFetching(true);
    setError(null);
    try {
      const res = await api.get('/vehicles', {
        params: { search, page, limit: 15 },
      });
      const dataPayload = res.data || res;
      const vehiclesList = Array.isArray(dataPayload)
        ? dataPayload
        : dataPayload.vehicles || res.vehicles || [];
      const paginationData = res.meta?.pagination || res.pagination || null;

      setVehicles(vehiclesList);
      setPagination(paginationData);
    } catch (err) {
      console.error('Failed to fetch vehicles:', err);
      setError(err.message || 'Failed to load registered bikes list.');
    } finally {
      setLoading(false);
      setFetching(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchVehicles(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVehicles(false);
    }, 150);
    return () => clearTimeout(timer);
  }, [fetchVehicles]);

  // Handle Delete Bike
  const handleDeleteVehicle = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/vehicles/${deleteTarget._id}`);
      toast.success(`Bike '${deleteTarget.bikeName || deleteTarget.registrationNumber}' deleted successfully.`);
      fetchVehicles(false);
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete bike.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Registered Bikes & Vehicles"
        subtitle="Manage customer two-wheelers, registration numbers, mileage, and service records."
      />

      {/* Search Bar & Single Add Bike Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="w-full sm:w-80">
          <SearchInput
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            onClear={() => {
              setSearch('');
              setPage(1);
            }}
            placeholder="Search number plate, bike name, or owner..."
          />
        </div>

        <Button
          variant="accent"
          size="md"
          icon={Plus}
          onClick={() => {
            setSelectedVehicle(null);
            setModalOpen(true);
          }}
          className="w-full sm:w-auto shrink-0"
        >
          Add Bike
        </Button>
      </div>

      {/* Main Table Viewport */}
      <div className="min-h-[420px] relative">
        {loading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : error ? (
          <ErrorState message={error} onRetry={() => fetchVehicles(true)} />
        ) : vehicles.length === 0 ? (
          <EmptyState
            icon={Bike}
            title="No bikes found"
            description={
              search
                ? 'No bikes match your active search filter.'
                : 'Add a customer bike to manage job cards and service history.'
            }
            actionText="Add Bike"
            onAction={() => {
              setSelectedVehicle(null);
              setModalOpen(true);
            }}
          />
        ) : (
          <div className={`space-y-4 transition-opacity ${fetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <Table>
              <TableHeader>
                <TableRow hover={false}>
                  <TableHead>Number Plate</TableHead>
                  <TableHead>Bike Name / Model</TableHead>
                  <TableHead>Owner Customer</TableHead>
                  <TableHead>Odometer (KM)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.map((v) => (
                  <TableRow key={v._id} hover={false}>
                    <TableCell>
                      <span className="font-mono text-xs font-bold text-slate-900 bg-orange-50 text-orange-700 px-2.5 py-1 rounded-md border border-orange-200">
                        {v.registrationNumber || 'No Plate'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">
                        {v.bikeName || `${v.make || ''} ${v.model || ''}`}
                      </div>
                      {v.notes && <div className="text-[11px] text-slate-500 truncate max-w-xs">{v.notes}</div>}
                    </TableCell>
                    <TableCell>
                      {v.customerId ? (
                        <div className="flex items-center gap-1.5 text-xs text-slate-800 font-medium">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{v.customerId.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold font-mono">
                        <Gauge className="w-3.5 h-3.5 text-slate-400" />
                        <span>{v.currentKm || 0} KM</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Eye}
                          onClick={() => navigate(`/vehicles/${v._id}`)}
                          title="View Bike Service History"
                        >
                          View Details
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Edit2}
                          onClick={() => {
                            setSelectedVehicle(v);
                            setModalOpen(true);
                          }}
                          title="Edit Bike"
                        >
                          Edit
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Trash2}
                          onClick={() => {
                            setDeleteTarget(v);
                            setDeleteDialogOpen(true);
                          }}
                          title="Delete Bike"
                          className="hover:text-rose-600 hover:bg-rose-50 text-rose-600"
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Pagination pagination={pagination} onPageChange={(newPage) => setPage(newPage)} />
          </div>
        )}
      </div>

      {/* Add / Edit Bike Modal */}
      <VehicleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        vehicle={selectedVehicle}
        onSuccess={() => fetchVehicles(false)}
      />

      {/* Delete Bike Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDeleteVehicle}
        title={`Delete Bike: ${deleteTarget?.bikeName || deleteTarget?.registrationNumber}?`}
        message={`Are you sure you want to delete '${deleteTarget?.bikeName || deleteTarget?.registrationNumber}'? Click OK to confirm.`}
        confirmText="OK, Delete Bike"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};
