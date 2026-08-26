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
import { Table, TableHeadCheckbox, TableCellCheckbox } from '../../components/ui/Table.jsx';
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Settlement Calculator"
        subtitle="Standalone tool to calculate monthly profit distribution and partner payouts without affecting live workshop data."
      />

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-3 animate-fade-in shadow-2xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="text-xs font-bold">{successMessage}</span>
        </div>
      )}

      {/* Grid: Inputs Form & Live Output Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Inputs (7 cols) */}
        <Card className="lg:col-span-7 p-6 border border-slate-200 shadow-sm bg-white">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Calculator className="w-5 h-5 text-slate-800" />
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              1. Hisaab Input Details
            </h2>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
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
                <label className="block text-xs font-bold text-slate-700 mb-1">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
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
                <label className="block text-xs font-bold text-slate-700 mb-1">
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
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Notes / Month Details (Optional)
              </label>
              <Input
                type="text"
                placeholder="e.g. August 2026 Monthly Settlement"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3 pt-3">
              <Button
                type="submit"
                variant="primary"
                disabled={saving}
                className="flex-1 justify-center py-2.5"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Hisaab Save Karein'}
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={handleReset}
                className="px-4 py-2.5"
              >
                <RotateCcw className="w-4 h-4 mr-1.5" />
                Reset
              </Button>
            </div>
          </form>
        </Card>

        {/* Right Output Panel: Live Results (5 cols) */}
        <Card className="lg:col-span-5 p-6 border border-slate-800 bg-slate-900 text-white shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h2 className="text-sm font-extrabold tracking-wider uppercase text-slate-100">
                  2. Live Payout Summary
                </h2>
              </div>
              <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-2.5 py-1 rounded-full uppercase border border-slate-700">
                Instant Calc
              </span>
            </div>

            <div className="space-y-4">
              {/* Net Profit Summary */}
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Net Workshop Profit
                </div>
                <div className="text-2xl font-black text-white mt-1">
                  {formatINR(netProfit)}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                  <span>Revenue: {formatINR(revVal)}</span>
                  <span>Expenses: -{formatINR(expVal)}</span>
                </div>
              </div>

              {/* Partner 1: Naim Pathan */}
              <div className="bg-emerald-950/40 p-4 rounded-xl border border-emerald-700/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 uppercase">
                    <UserCheck className="w-4 h-4" /> Naim Pathan
                  </span>
                  <span className="text-[10px] font-extrabold bg-emerald-900/80 text-emerald-200 px-2 py-0.5 rounded">
                    50% Share
                  </span>
                </div>
                <div className="text-xl font-black text-emerald-200 pt-1">
                  {formatINR(naimFinalPayout)}
                </div>
                <div className="text-[11px] text-emerald-300/80 flex justify-between pt-0.5">
                  <span>Base Share: {formatINR(naimBaseShare)}</span>
                  <span>Advance: -{formatINR(naimAdvVal)}</span>
                </div>
              </div>

              {/* Partner 2: Imran Pathan */}
              <div className="bg-indigo-950/40 p-4 rounded-xl border border-indigo-700/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5 uppercase">
                    <UserCheck className="w-4 h-4" /> Imran Pathan
                  </span>
                  <span className="text-[10px] font-extrabold bg-indigo-900/80 text-indigo-200 px-2 py-0.5 rounded">
                    50% Share
                  </span>
                </div>
                <div className="text-xl font-black text-indigo-200 pt-1">
                  {formatINR(imranFinalPayout)}
                </div>
                <div className="text-[11px] text-indigo-300/80 flex justify-between pt-0.5">
                  <span>Base Share: {formatINR(imranBaseShare)}</span>
                  <span>Advance: -{formatINR(imranAdvVal)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Values update live as you type above. Click Save to log entry.</span>
          </div>
        </Card>
      </div>

      {/* Bottom Section: Saved History Register */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Saved Calculation History
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Tareekh aur samay ke saath saare purane calculations ka safe permanent record.
            </p>
          </div>
          <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200">
            Total Saved: {records.length}
          </span>
        </div>

        {loading ? (
          <Skeleton className="h-64 w-full rounded-2xl" />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchHistory} />
        ) : records.length === 0 ? (
          <Card className="p-12 text-center border border-dashed border-slate-300 bg-slate-50/50">
            <Calculator className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-700">Koi Purana Hisaab Record Nahi Hai</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Upar calculator me detail bharkar "Hisaab Save Karein" dabayein to record yahan save ho jayega.
            </p>
          </Card>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <Table>
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-left text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4 w-10">
                    <TableHeadCheckbox
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Calc #</th>
                  <th className="py-3 px-4 text-right">Revenue</th>
                  <th className="py-3 px-4 text-right">Expenses</th>
                  <th className="py-3 px-4 text-right">Net Profit</th>
                  <th className="py-3 px-4 text-right">Naim Payout</th>
                  <th className="py-3 px-4 text-right">Imran Payout</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {records.map((rec) => {
                  const active = isSelected(rec._id);
                  return (
                    <tr
                      key={rec._id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        active ? 'bg-slate-50 font-medium' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <TableCellCheckbox
                          checked={active}
                          onChange={() => toggleSelect(rec._id)}
                        />
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {formatDate(rec.date)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-700 uppercase">
                        {rec.calculationNumber}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        {formatINR(rec.totalRevenue)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-rose-600">
                        -{formatINR(rec.garageExpenses)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-slate-900">
                        {formatINR(rec.netProfit)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-emerald-600">
                        {formatINR(rec.naimFinalPayout)}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          (Adv: {formatINR(rec.naimAdvance)})
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-indigo-600">
                        {formatINR(rec.imranFinalPayout)}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          (Adv: {formatINR(rec.imranAdvance)})
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                        {rec.notes || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setDeleteId(rec._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Calculation Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
      </div>

      {/* Floating Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedCount}
        onClearSelection={clearSelection}
        onDeleteSelected={() => setShowBulkConfirm(true)}
      />

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
