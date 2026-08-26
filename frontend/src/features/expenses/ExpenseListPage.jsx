import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Plus,
  IndianRupee,
  Calendar,
  User,
  Building2,
  BookOpen,
  Pencil,
  Trash2,
} from 'lucide-react';
import api from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useTableSelection } from '../../hooks/useTableSelection.js';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { BulkActionBar } from '../../components/ui/BulkActionBar.jsx';
import { Modal, ModalCancelButton, ConfirmDialog } from '../../components/ui/Modal.jsx';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableHeadCheckbox,
  TableCellCheckbox,
  Pagination,
} from '../../components/ui/Table.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { TableSkeleton } from '../../components/ui/Skeleton.jsx';
import { formatINR, formatDate } from '../../utils/formatters.js';

export const ExpenseListPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [accountTotals, setAccountTotals] = useState({
    garage: 0,
    imran: 0,
    naim: 0,
  });
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  // Notebook Tab Filter: 'ALL' | 'GARAGE' | 'IMRAN' | 'NAIM'
  const [activeAccountTab, setActiveAccountTab] = useState('ALL');
  const [page, setPage] = useState(1);

  // Reusable Table Selection Hook
  const {
    selectedIds,
    selectedCount,
    isSelected,
    isAllSelected,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
  } = useTableSelection(expenses);

  // Create & Edit Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  // Single & Bulk Delete Confirmation Dialog States
  const [deletingExpense, setDeletingExpense] = useState(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState({
    account: 'GARAGE_ACCOUNT', // 'GARAGE_ACCOUNT' | 'PARTNER_A' (Imran) | 'PARTNER_B' (Naim)
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [submitting, setSubmitting] = useState(false);

  const toast = useToast();

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      let paidByQuery = '';
      if (activeAccountTab === 'GARAGE') paidByQuery = 'GARAGE_ACCOUNT';
      if (activeAccountTab === 'IMRAN') paidByQuery = 'PARTNER_A';
      if (activeAccountTab === 'NAIM') paidByQuery = 'PARTNER_B';

      const res = await api.get('/expenses', {
        params: {
          paidBy: paidByQuery,
          page,
          limit: 15,
        },
      });

      const payload = res.data || {};
      const expList = Array.isArray(payload.expenses)
        ? payload.expenses
        : Array.isArray(res.data)
        ? res.data
        : [];

      setExpenses(expList);
      setTotalAmount(payload.totalAmount || res.totalAmount || 0);

      if (payload.accountTotals) {
        setAccountTotals(payload.accountTotals);
      }
      setPagination(res.meta || res.pagination || payload.pagination || null);
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
    clearSelection();
  }, [activeAccountTab, page]);

  const handleOpenAddModal = () => {
    setEditingExpense(null);
    setFormData({
      account: 'GARAGE_ACCOUNT',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (exp) => {
    setEditingExpense(exp);

    let acct = 'GARAGE_ACCOUNT';
    const key = String(exp.paidBy || '').toUpperCase();
    if (key.includes('IMRAN') || key === 'PARTNER_A') acct = 'PARTNER_A';
    if (key.includes('NAIM') || key === 'PARTNER_B') acct = 'PARTNER_B';

    setFormData({
      account: acct,
      amount: String(exp.amount || ''),
      description: exp.description === 'Expense Entry' ? '' : exp.description || '',
      date: exp.date ? new Date(exp.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    });
    setModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    if (e) e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error('Kripya sahi paise (amount) bhare.');
      return;
    }
    setShowSaveConfirm(true);
  };

  const executeSaveExpense = async () => {
    setShowSaveConfirm(false);
    setSubmitting(true);
    try {
      const finalDescription = formData.description.trim() || 'Expense Entry';

      if (editingExpense) {
        // Edit Existing Entry
        await api.put(`/expenses/${editingExpense._id}`, {
          amount: Number(formData.amount),
          description: finalDescription,
          paidBy: formData.account,
          date: formData.date,
        });
        toast.success('Expense entry successfully update ho gayi!');
      } else {
        // Create New Entry
        await api.post('/expenses', {
          category: 'OTHER',
          amount: Number(formData.amount),
          description: finalDescription,
          paidBy: formData.account,
          paymentMethod: 'CASH',
          date: formData.date,
        });

        const accountLabel =
          formData.account === 'PARTNER_A'
            ? 'Imran Pathan'
            : formData.account === 'PARTNER_B'
            ? 'Naim Pathan'
            : 'Garage';

        toast.success(`Entry ${accountLabel} ke khate me save ho gayi!`);
      }

      setModalOpen(false);
      setEditingExpense(null);
      setFormData({
        account: 'GARAGE_ACCOUNT',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
      fetchExpenses();
    } catch (err) {
      toast.error(err.message || 'Entry save karne me error aaya.');
    } finally {
      setSubmitting(false);
    }
  };

  const executeSingleDeleteExpense = async () => {
    if (!deletingExpense) return;
    setSubmitting(true);
    try {
      await api.delete(`/expenses/${deletingExpense._id}`);
      toast.success('Expense entry database se permanently delete ho gayi!');
      setDeletingExpense(null);
      clearSelection();
      fetchExpenses();
    } catch (err) {
      toast.error(err.message || 'Entry delete karne me error aaya.');
    } finally {
      setSubmitting(false);
    }
  };

  const executeBulkDeleteExpenses = async () => {
    if (selectedCount === 0) return;
    setSubmitting(true);
    try {
      const res = await api.post('/expenses/bulk-delete', { ids: selectedIds });
      toast.success(`${selectedCount} expense entries database se permanently delete ho gayi!`);
      setShowBulkDeleteConfirm(false);
      clearSelection();
      fetchExpenses();
    } catch (err) {
      toast.error(err.message || 'Bulk delete karne me error aaya.');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to format Account Label & Styling
  const getAccountBadge = (paidByKey) => {
    const key = String(paidByKey || '').toUpperCase();
    if (key.includes('IMRAN') || key === 'PARTNER_A') {
      return (
        <span className="font-bold text-xs bg-rose-50 text-rose-700 px-2.5 py-1 rounded-lg border border-rose-200 inline-flex items-center gap-1">
          <User className="w-3 h-3 text-rose-600" />
          Imran Pathan
        </span>
      );
    }
    if (key.includes('NAIM') || key === 'PARTNER_B') {
      return (
        <span className="font-bold text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-200 inline-flex items-center gap-1">
          <User className="w-3 h-3 text-indigo-600" />
          Naim Pathan
        </span>
      );
    }
    return (
      <span className="font-bold text-xs bg-[#4F46E5] dark:bg-[#6366F1] text-white px-2.5 py-1 rounded-xl shadow-2xs inline-flex items-center gap-1">
        <Building2 className="w-3 h-3 text-indigo-100" />
        Garage Expense
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expense Diary / Notebook (OPEX)"
        subtitle="3 Accounts: Garage, Imran Pathan, aur Naim Pathan ke paise aur kharche diary ki tarah manage kare."
        actions={
          <Button
            variant="accent"
            size="sm"
            icon={Plus}
            onClick={handleOpenAddModal}
          >
            Paise Add Kare (Entry)
          </Button>
        }
      />

      {/* 3 Main Notebook Account Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Garage Card */}
        <div
          onClick={() => setActiveAccountTab('GARAGE')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeAccountTab === 'GARAGE'
              ? 'bg-[#4F46E5] text-white border-[#4F46E5] shadow-md dark:bg-[#6366F1] dark:border-[#6366F1]'
              : 'bg-white dark:bg-[#172033] text-slate-900 dark:text-slate-100 border-slate-200 dark:border-[#263449] hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider opacity-80 flex items-center gap-1.5">
              <Building2 className="w-4 h-4" />
              Garage Expenses
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-200">
              Account 1
            </span>
          </div>
          <div className="text-2xl font-black mt-2 font-mono">
            {formatINR(accountTotals.garage)}
          </div>
          <p className="text-[11px] opacity-75 mt-1">Workshop running costs & bills</p>
        </div>

        {/* Imran Pathan Card */}
        <div
          onClick={() => setActiveAccountTab('IMRAN')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeAccountTab === 'IMRAN'
              ? 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-600/20'
              : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider opacity-90 flex items-center gap-1.5">
              <User className="w-4 h-4" />
              Imran Pathan Expenses
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-700 text-rose-100">
              Account 2
            </span>
          </div>
          <div className="text-2xl font-black mt-2 font-mono">
            {formatINR(accountTotals.imran)}
          </div>
          <p className="text-[11px] opacity-85 mt-1">Imran bhai ke paise / entries</p>
        </div>

        {/* Naim Pathan Card */}
        <div
          onClick={() => setActiveAccountTab('NAIM')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeAccountTab === 'NAIM'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-600/20'
              : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider opacity-90 flex items-center gap-1.5">
              <User className="w-4 h-4" />
              Naim Pathan Expenses
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-700 text-indigo-100">
              Account 3
            </span>
          </div>
          <div className="text-2xl font-black mt-2 font-mono">
            {formatINR(accountTotals.naim)}
          </div>
          <p className="text-[11px] opacity-85 mt-1">Naim bhai ke paise / entries</p>
        </div>
      </div>

      {/* Notebook Page Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => {
            setActiveAccountTab('ALL');
            setPage(1);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeAccountTab === 'ALL'
              ? 'bg-[#4F46E5] text-white shadow-sm dark:bg-[#6366F1]'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Sabhi Entries (All Records)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveAccountTab('GARAGE');
            setPage(1);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeAccountTab === 'GARAGE'
              ? 'bg-[#4F46E5] text-white shadow-sm dark:bg-[#6366F1]'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>1. Garage Page</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveAccountTab('IMRAN');
            setPage(1);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeAccountTab === 'IMRAN'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>2. Imran Pathan Page</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveAccountTab('NAIM');
            setPage(1);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeAccountTab === 'NAIM'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>3. Naim Pathan Page</span>
        </button>
      </div>

      {/* Floating Reusable Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedCount}
        onClear={clearSelection}
        onDelete={() => setShowBulkDeleteConfirm(true)}
        entityName="expense entries"
        deleting={submitting}
      />

      {/* Entry Table (Notebook Page View) */}
      {loading ? (
        <TableSkeleton rows={6} cols={7} />
      ) : expenses.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Is page par koi entry nahi hai"
          description="Naye paise ya kharcha add karne ke liye 'Paise Add Kare' button dabaye."
          actionText="Paise Add Kare"
          onAction={handleOpenAddModal}
        />
      ) : (
        <div className="space-y-3">
          <Table>
            <TableHeader>
              <TableRow hover={false}>
                <TableHeadCheckbox
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                />
                <TableHead>Tareekh & Samay (Date & Time)</TableHead>
                <TableHead>Voucher No.</TableHead>
                <TableHead>Kiske Liye (Account)</TableHead>
                <TableHead>Kyu Liye (Detail / Purpose)</TableHead>
                <TableHead className="text-right">Paise (Amount ₹)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((exp) => (
                <TableRow
                  key={exp._id}
                  hover={true}
                  className={isSelected(exp._id) ? 'bg-slate-50' : ''}
                >
                  <TableCellCheckbox
                    checked={isSelected(exp._id)}
                    onChange={() => toggleSelect(exp._id)}
                  />

                  <TableCell className="text-xs text-slate-600 font-medium whitespace-nowrap">
                    {formatDate(exp.date || exp.createdAt)}
                  </TableCell>

                  <TableCell>
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">
                      {exp.expenseNumber || `EXP-${exp._id?.slice(-4)}`}
                    </span>
                  </TableCell>

                  <TableCell>{getAccountBadge(exp.paidBy)}</TableCell>

                  <TableCell>
                    <div className="font-semibold text-slate-900 text-xs max-w-sm">
                      {exp.description || '—'}
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <span className="text-xs font-black text-rose-600 font-mono text-sm">
                      {formatINR(exp.amount)}
                    </span>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(exp)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit Entry"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingExpense(exp)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {pagination && (
            <Pagination pagination={pagination} onPageChange={(newPage) => setPage(newPage)} />
          )}
        </div>
      )}

      {/* Add / Edit Expense Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        confirmOnClose={true}
        title={editingExpense ? `Edit Entry: ${editingExpense.expenseNumber}` : 'Paise / Kharcha Add Kare'}
        subtitle={editingExpense ? 'Is entry ke paise, account ya detail change kare' : '3 me se ek account chune aur kitne paise liye bhare'}
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <ModalCancelButton disabled={submitting}>Cancel</ModalCancelButton>
            <Button
              type="submit"
              form="expense-entry-form"
              variant="accent"
              loading={submitting}
            >
              {editingExpense ? 'Update Entry' : 'Save Entry'}
            </Button>
          </div>
        }
      >
        <form id="expense-entry-form" onSubmit={handleFormSubmit} className="space-y-4">
          {/* 1. Account Selection (Kiske Liye) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              1. Kiske Liye Kaise Add Karne Hain? <span className="text-rose-500">*</span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, account: 'GARAGE_ACCOUNT' })}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all ${
                  formData.account === 'GARAGE_ACCOUNT'
                    ? 'bg-[#4F46E5] text-white border-[#4F46E5] shadow-sm dark:bg-[#6366F1]'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <Building2 className="w-5 h-5" />
                <span>Garage</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, account: 'PARTNER_A' })}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all ${
                  formData.account === 'PARTNER_A'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm ring-2 ring-rose-600/20'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <User className="w-5 h-5" />
                <span>Imran Pathan</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, account: 'PARTNER_B' })}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all ${
                  formData.account === 'PARTNER_B'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm ring-2 ring-indigo-600/20'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <User className="w-5 h-5" />
                <span>Naim Pathan</span>
              </button>
            </div>
          </div>

          {/* 2. Kitne Liye (Amount ₹) - Mandatory */}
          <Input
            label="2. Kitne Paise Liye? (Amount ₹)"
            type="number"
            min="1"
            step="0.01"
            required
            placeholder="e.g. 500"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          />

          {/* 3. Kyu Liye (Detail / Purpose) - OPTIONAL */}
          <Input
            label="3. Kyu Liye? (Detail / Purpose) (Optional)"
            placeholder="e.g. Chai nashta, Workshop kiraya, Personal, Petrol"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          {/* 4. Tareekh (Date) */}
          <Input
            label="Tareekh (Date)"
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </form>
      </Modal>

      {/* Save Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={executeSaveExpense}
        title={editingExpense ? 'Update Entry?' : 'Entry Save Kare?'}
        message={`${
          formData.account === 'PARTNER_A'
            ? 'Imran Pathan'
            : formData.account === 'PARTNER_B'
            ? 'Naim Pathan'
            : 'Garage'
        } ke khate me ${formatINR(Number(formData.amount || 0))} ki entry ${editingExpense ? 'update' : 'save'} kare?`}
        confirmText={editingExpense ? 'Haan, Update Kare' : 'Haan, Save Kare'}
        cancelText="Check Kare"
        variant="success"
        loading={submitting}
      />

      {/* Single Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingExpense)}
        onClose={() => setDeletingExpense(null)}
        onConfirm={executeSingleDeleteExpense}
        title="Delete Expense Entry?"
        message={`Kya aap sach me voucher ${deletingExpense?.expenseNumber || ''} (${formatINR(deletingExpense?.amount || 0)}) ko database se permanently delete karna chahte hain? Database size kam rakhne ke liye ye entry turant delete ho jayegi.`}
        confirmText="Yes, Delete Entry"
        cancelText="Cancel"
        variant="danger"
        loading={submitting}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={executeBulkDeleteExpenses}
        title={`Bulk Delete ${selectedCount} Expense Entries?`}
        message={`Kya aap sach me selected ${selectedCount} expense entries ko database se permanently delete karna chahte hain? Database size kam rakhne ke liye saari selected entries MongoDB se turant hard delete ho jayengi.`}
        confirmText={`Yes, Permanently Delete ${selectedCount} Items`}
        cancelText="Cancel"
        variant="danger"
        loading={submitting}
      />
    </div>
  );
};
