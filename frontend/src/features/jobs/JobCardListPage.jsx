import React, { useState, useEffect, useCallback } from 'react';
import { Wrench, Plus, Edit2, Trash2 } from 'lucide-react';
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
import { TableSkeleton } from '../../components/ui/Skeleton.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { ErrorState } from '../../components/ui/ErrorState.jsx';
import { ConfirmDialog } from '../../components/ui/Modal.jsx';
import { JobCardModal } from './JobCardModal.jsx';
import { formatPhone, formatDate, formatRegNumber } from '../../utils/formatters.js';

export const JobCardListPage = () => {
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // JobCard Modal State (For Create & Edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedJobSeq, setSelectedJobSeq] = useState(1);

  // Delete Job Confirmation State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteTargetSeq, setDeleteTargetSeq] = useState(1);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const toast = useToast();

  const fetchJobs = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    setFetching(true);
    setError(null);
    try {
      const res = await api.get('/jobs', {
        params: { search, serviceType: 'FULL_SERVICE', page, limit: 15 },
      });
      const dataPayload = res.data || res;
      const jobsList = Array.isArray(dataPayload)
        ? dataPayload
        : dataPayload.jobs || res.jobs || [];
      const paginationData = res.meta?.pagination || res.pagination || null;

      setJobs(jobsList);
      setPagination(paginationData);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      setError(err.message || 'Failed to load service jobs.');
    } finally {
      setLoading(false);
      setFetching(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchJobs(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs(false);
    }, 150);
    return () => clearTimeout(timer);
  }, [fetchJobs]);

  // Handle Delete Job
  const handleDeleteJob = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/jobs/${deleteTarget._id}`);
      toast.success('Service job deleted successfully.');
      fetchJobs(false);
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete job.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Full Service Jobs"
        subtitle="Bike servicing, customer ki detail aur complaints yahan manage karein."
      />

      {/* Search Bar & Single Create Job Button */}
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
            placeholder="Search customer, mobile, or bike..."
          />
        </div>

        <Button
          variant="accent"
          size="md"
          icon={Plus}
          onClick={() => {
            setSelectedJob(null);
            setModalOpen(true);
          }}
          className="w-full sm:w-auto shrink-0 whitespace-nowrap"
        >
          New Service Job
        </Button>
      </div>

      {/* Main Table Viewport */}
      <div className="min-h-[420px] relative">
        {loading ? (
          <TableSkeleton rows={6} cols={6} />
        ) : error ? (
          <ErrorState message={error} onRetry={() => fetchJobs(true)} />
        ) : jobs.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="No service jobs found"
            description={
              search
                ? 'No service jobs match your active search filter.'
                : 'Create your first service job card to record customer bike details.'
            }
            actionText="New Service Job"
            onAction={() => {
              setSelectedJob(null);
              setModalOpen(true);
            }}
          />
        ) : (
          <div className={`space-y-4 transition-opacity ${fetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <Table>
              <TableHeader>
                <TableRow hover={false}>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer Name & Phone</TableHead>
                  <TableHead>Bike / Number Plate</TableHead>
                  <TableHead>Problem / Complaints</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((j, idx) => {
                  const seqNumber = (page - 1) * 15 + idx + 1;
                  return (
                    <TableRow key={j._id} hover={false}>
                      <TableCell className="font-mono text-xs font-bold text-slate-500">
                        #{seqNumber}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 font-mono">
                        {formatDate(j.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">{j.customerNameSnapshot}</div>
                        <div className="text-[11px] font-mono text-slate-500">{formatPhone(j.mobileNumberSnapshot)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-slate-800 text-xs">{j.bikeNameSnapshot}</div>
                        {j.registrationNumberSnapshot && (
                          <span className="font-mono text-[10px] font-bold text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
                            {formatRegNumber(j.registrationNumberSnapshot)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-slate-600 truncate max-w-xs">
                          {j.serviceDetails || <span className="text-slate-400 font-normal">—</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Edit2}
                            onClick={() => {
                              setSelectedJob(j);
                              setSelectedJobSeq(seqNumber);
                              setModalOpen(true);
                            }}
                            title="Edit Service Job"
                          >
                            Edit
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Trash2}
                            onClick={() => {
                              setDeleteTarget(j);
                              setDeleteTargetSeq(seqNumber);
                              setDeleteDialogOpen(true);
                            }}
                            title="Delete Service Job"
                            className="hover:text-rose-600 hover:bg-rose-50 text-rose-600"
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <Pagination pagination={pagination} onPageChange={(newPage) => setPage(newPage)} />
          </div>
        )}
      </div>

      {/* Create & Edit Job Modal */}
      <JobCardModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        job={selectedJob}
        serviceType="FULL_SERVICE"
        seqNumber={selectedJobSeq}
        onSuccess={() => fetchJobs(false)}
      />

      {/* Delete Job Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDeleteJob}
        title={`Delete Service Job #${deleteTargetSeq}?`}
        message={`Are you sure you want to delete service job #${deleteTargetSeq} for '${deleteTarget?.customerNameSnapshot}'? Click OK to confirm.`}
        confirmText="OK, Delete Job"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};
