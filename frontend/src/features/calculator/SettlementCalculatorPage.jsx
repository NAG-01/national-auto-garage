import React, { useState, useEffect, useMemo } from 'react';
import {
  Calculator,
  Save,
  RotateCcw,
  Trash2,
  Calendar,
  IndianRupee,
  UserCheck,
  Building2,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import api from '../../api/client.js';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import { ErrorState } from '../../components/ui/ErrorState.jsx';
import { ConfirmDialog } from '../../components/ui/Modal.jsx';
import { useTableSelection } from '../../hooks/useTableSelection.js';
import { BulkActionBar } from '../../components/ui/BulkActionBar.jsx';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableHeadCheckbox, TableCellCheckbox } from '../../components/ui/Table.jsx';
import { formatINR, formatDate } from '../../utils/formatters.js';

export const SettlementCalculatorPage = () => {
  // Form State
  const [totalRevenue, setTotalRevenue] = useState('');
  const [garageExpenses, setGarageExpenses] = useState('');
  const [naimAdvance, setNaimAdvance] = useState('');
  const [imranAdvance, setImranAdvance] = useState('');
  const [notes, setNotes] = useState('');

  // History State
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Confirm Delete Dialogs
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  // Table selection hook
  const {
    selectedIds,
    selectedCount,
    isSelected,
    isAllSelected,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
  } = useTableSelection(records);

  // Computed Live Results
  const revVal = Number(totalRevenue) || 0;
  const expVal = Number(garageExpenses) || 0;
  const naimAdvVal = Number(naimAdvance) || 0;
  const imranAdvVal = Number(imranAdvance) || 0;

  const netProfit = useMemo(() => revVal - expVal, [revVal, expVal]);
  const naimBaseShare = useMemo(() => netProfit * 0.5, [netProfit]);
  const imranBaseShare = useMemo(() => netProfit * 0.5, [netProfit]);

  const naimFinalPayout = useMemo(() => naimBaseShare - naimAdvVal, [naimBaseShare, naimAdvVal]);
  const imranFinalPayout = useMemo(() => imranBaseShare - imranAdvVal, [imranBaseShare, imranAdvVal]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/settlement-calculations');
      setRecords(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load calculation history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleReset = () => {
    setTotalRevenue('');
    setGarageExpenses('');
    setNaimAdvance('');
    setImranAdvance('');
    setNotes('');
    setSuccessMessage('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!totalRevenue && revVal === 0) {
      alert('Please enter total revenue / profit');
      return;
    }

    setSaving(true);
    setSuccessMessage('');
    try {
      await api.post('/settlement-calculations', {
        totalRevenue: revVal,
        garageExpenses: expVal,
        naimAdvance: naimAdvVal,
        imranAdvance: imranAdvVal,
        notes: notes.trim(),
      });
      setSuccessMessage('Hisaab successfully save ho gaya!');
      fetchHistory();
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to save calculation');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSingle = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/settlement-calculations/${deleteId}`);
      setRecords((prev) => prev.filter((r) => r._id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      alert(err.message || 'Failed to delete record');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    setIsBulkDeleting(true);
    try {
      await api.post('/settlement-calculations/bulk-delete', { ids: selectedIds });
      setRecords((prev) => prev.filter((r) => !selectedIds.includes(r._id)));
      clearSelection();
      setShowBulkConfirm(false);
    } catch (err) {
      alert(err.message || 'Failed to delete selected records');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 px-2 sm:px-4">
      <PageHeader
        title="Settlement Calculator"
        subtitle="Dono partners ke mahine ke hisaab aur final paise nikalne ke liye simple calculator tool."
      />

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-3 animate-fade-in shadow-2xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{successMessage}</span>
        </div>
      )}

      {/* Grid: Inputs Form & Live Output Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Inputs (7 cols) */}
        <div className="lg:col-span-7 bg-white p-4 sm:p-6 border border-[#BAE6FD] rounded-2xl shadow-2xs">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#E0F2FE]">
            <Calculator className="w-5 h-5 text-[#0284C7]" />
            <h2 className="text-xs sm:text-sm font-extrabold text-[#0C4A6E] uppercase tracking-wider">
              1. Hisaab Input Details
            </h2>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0C4A6E] mb-1">
                  Total Profit / Collections (Kul Aavak ₹) <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 50000"
                  value={totalRevenue}
                  onChange={(e) => setTotalRevenue(e.target.value)}
                  min="0"
                  step="any"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0C4A6E] mb-1">
                  Garage Expenses (Kul Kharcha ₹)
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 10000"
                  value={garageExpenses}
                  onChange={(e) => setGarageExpenses(e.target.value)}
                  min="0"
                  step="any"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E0F2FE]">
              <div>
                <label className="block text-xs font-bold text-[#0C4A6E] mb-1">
                  Naim Pathan Advance (Uthaaye Paise ₹)
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 5000"
                  value={naimAdvance}
                  onChange={(e) => setNaimAdvance(e.target.value)}
                  min="0"
                  step="any"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0C4A6E] mb-1">
                  Imran Pathan Advance (Uthaaye Paise ₹)
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 3000"
                  value={imranAdvance}
                  onChange={(e) => setImranAdvance(e.target.value)}
                  min="0"
                  step="any"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0C4A6E] mb-1">
                Notes / Month Details (Optional)
              </label>
              <Input
                type="text"
                placeholder="e.g. August 2026 Monthly Settlement"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3">
              <Button
                type="submit"
                variant="primary"
                disabled={saving}
                className="w-full sm:flex-1 justify-center py-3 px-4 font-bold text-xs sm:text-sm"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Hisaab Save Karein'}
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={handleReset}
                className="w-full sm:w-auto justify-center py-3 px-4 font-bold text-xs sm:text-sm"
              >
                <RotateCcw className="w-4 h-4 mr-1.5" />
                Reset
              </Button>
            </div>
          </form>
        </div>

        {/* Right Output Panel: Live Results (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#BAE6FD] rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E0F2FE]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0284C7]" />
                <h2 className="text-xs sm:text-sm font-extrabold tracking-wider uppercase text-[#0C4A6E]">
                  2. Live Payout Summary
                </h2>
              </div>
              <span className="text-[10px] bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD] font-extrabold px-2.5 py-1 rounded-full uppercase">
                Live Math
              </span>
            </div>

            <div className="space-y-3.5">
              {/* Net Profit Summary */}
              <div className="bg-[#0284C7] text-white p-4 rounded-xl shadow-2xs border border-[#0369A1]">
                <div className="text-[11px] font-bold text-sky-100 uppercase tracking-wider">
                  Net Workshop Profit
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white mt-1 tracking-tight">
                  {formatINR(netProfit)}
                </div>
                <div className="text-[11px] font-semibold text-sky-100 mt-2 flex items-center justify-between border-t border-sky-400/40 pt-2">
                  <span>Revenue: {formatINR(revVal)}</span>
                  <span className="text-rose-200">Expenses: -{formatINR(expVal)}</span>
                </div>
              </div>

              {/* Partner 1: Naim Pathan */}
              <div className="bg-[#F0F9FF] border border-[#BAE6FD] p-4 rounded-xl shadow-2xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#0C4A6E] flex items-center gap-1.5 uppercase">
                    <UserCheck className="w-4 h-4 text-[#0284C7]" /> Naim Pathan
                  </span>
                  <span className="text-[10px] font-bold bg-[#0284C7] text-white px-2 py-0.5 rounded uppercase">
                    50% Share
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#0284C7] tracking-tight pt-0.5">
                  {formatINR(naimFinalPayout)}
                </div>
                <div className="text-xs font-semibold text-[#0369A1] flex items-center justify-between border-t border-[#BAE6FD] pt-1.5 mt-1">
                  <span>50% Share: {formatINR(naimBaseShare)}</span>
                  <span className="text-rose-600 font-bold">Advance: -{formatINR(naimAdvVal)}</span>
                </div>
              </div>

              {/* Partner 2: Imran Pathan */}
              <div className="bg-[#E0F2FE] border border-[#7DD3FC] p-4 rounded-xl shadow-2xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#0C4A6E] flex items-center gap-1.5 uppercase">
                    <UserCheck className="w-4 h-4 text-[#0284C7]" /> Imran Pathan
                  </span>
                  <span className="text-[10px] font-bold bg-[#0284C7] text-white px-2 py-0.5 rounded uppercase">
                    50% Share
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#0284C7] tracking-tight pt-0.5">
                  {formatINR(imranFinalPayout)}
                </div>
                <div className="text-xs font-semibold text-[#0369A1] flex items-center justify-between border-t border-[#7DD3FC] pt-1.5 mt-1">
                  <span>50% Share: {formatINR(imranBaseShare)}</span>
                  <span className="text-rose-600 font-bold">Advance: -{formatINR(imranAdvVal)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E0F2FE] text-[11px] font-medium text-[#0369A1] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#0284C7] flex-shrink-0" />
            <span>Upar number likhte hi hisaab turant badal jayega. Record save karne ke liye Save dabayein.</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Saved History Register */}
      <div className="pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-extrabold text-[#0C4A6E]">
              Saved Calculation History
            </h3>
            <p className="text-xs text-[#0369A1] font-medium">
              Tareekh aur samay ke saath saare purane calculations ka safe permanent record.
            </p>
          </div>
          <span className="self-start sm:self-auto text-xs font-extrabold bg-[#0284C7] text-white px-3 py-1.5 rounded-xl shadow-xs">
            Total Saved: {records.length}
          </span>
        </div>

        {/* Bulk Action Bar placed at the TOP right above table */}
        {selectedCount > 0 && (
          <div className="mb-3">
            <BulkActionBar
              selectedCount={selectedCount}
              onClear={clearSelection}
              onDelete={() => setShowBulkConfirm(true)}
              entityName="calculation records"
              deleting={isBulkDeleting}
            />
          </div>
        )}

        {loading ? (
          <Skeleton className="h-64 w-full rounded-2xl" />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchHistory} />
        ) : records.length === 0 ? (
          <div className="p-8 sm:p-12 text-center border border-dashed border-[#BAE6FD] bg-white rounded-2xl shadow-2xs">
            <Calculator className="w-10 h-10 text-[#0284C7] mx-auto mb-3" />
            <h4 className="text-sm font-bold text-[#0C4A6E]">Koi Purana Hisaab Record Nahi Hai</h4>
            <p className="text-xs text-[#0369A1] mt-1 max-w-sm mx-auto">
              Upar calculator me detail bharkar "Hisaab Save Karein" dabayein to record yahan save ho jayega.
            </p>
          </div>
        ) : (
          <Table className="min-w-[750px]">
            <TableHeader>
              <TableRow hover={false}>
                <TableHeadCheckbox
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                />
                <TableHead>Date & Time</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Expenses</TableHead>
                <TableHead className="text-right">Net Profit</TableHead>
                <TableHead className="text-right">Naim Payout</TableHead>
                <TableHead className="text-right">Imran Payout</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((rec) => {
                const active = isSelected(rec._id);
                return (
                  <TableRow
                    key={rec._id}
                    className={active ? 'bg-[#E0F2FE] font-medium' : ''}
                  >
                    <TableCellCheckbox
                      checked={active}
                      onChange={() => toggleSelect(rec._id)}
                    />
                    <TableCell className="font-bold text-[#0C4A6E] whitespace-nowrap">
                      {formatDate(rec.date)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-[#0C4A6E]">
                      {formatINR(rec.totalRevenue)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-rose-600">
                      -{formatINR(rec.garageExpenses)}
                    </TableCell>
                    <TableCell className="text-right font-black text-[#0C4A6E]">
                      {formatINR(rec.netProfit)}
                    </TableCell>
                    <TableCell className="text-right font-black text-[#0284C7]">
                      {formatINR(rec.naimFinalPayout)}
                      <span className="block text-[10px] text-[#0369A1] font-normal">
                        (Adv: {formatINR(rec.naimAdvance)})
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-black text-[#0284C7]">
                      {formatINR(rec.imranFinalPayout)}
                      <span className="block text-[10px] text-[#0369A1] font-normal">
                        (Adv: {formatINR(rec.imranAdvance)})
                      </span>
                    </TableCell>
                    <TableCell className="text-[#0369A1] max-w-xs truncate">
                      {rec.notes || '—'}
                    </TableCell>
                    <TableCell className="text-center">
                      <button
                        type="button"
                        onClick={() => setDeleteId(rec._id)}
                        className="p-1.5 text-[#0369A1] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Delete Calculation Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Single Delete Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteSingle}
        title="Delete Calculation Record"
        message="Kya aap is saved calculation record ko database se permanently delete karna chahte hain?"
        confirmText="Delete Permanently"
        confirmVariant="danger"
        loading={isDeleting}
      />

      {/* Bulk Delete Modal */}
      <ConfirmDialog
        isOpen={showBulkConfirm}
        onClose={() => setShowBulkConfirm(false)}
        onConfirm={handleBulkDelete}
        title={`Delete ${selectedCount} Calculation Records`}
        message={`Kya aap selected ${selectedCount} calculation records ko database se permanently delete karna chahte hain?`}
        confirmText="Delete Selected Records"
        confirmVariant="danger"
        loading={isBulkDeleting}
      />
    </div>
  );
};
