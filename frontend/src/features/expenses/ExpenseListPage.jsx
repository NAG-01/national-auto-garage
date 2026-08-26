import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Plus,
  IndianRupee,
  Calendar,
  CreditCard,
  User,
  Filter,
} from 'lucide-react';
import api from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { KpiCard } from '../../components/ui/KpiCard.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Input, Select, Textarea } from '../../components/ui/Input.jsx';
import { Modal, ModalCancelButton, ConfirmDialog } from '../../components/ui/Modal.jsx';
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
import { TableSkeleton } from '../../components/ui/Skeleton.jsx';
import { formatINR, formatDate } from '../../utils/formatters.js';

export const ExpenseListPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('');
  const [paidByFilter, setPaidByFilter] = useState('');
  const [page, setPage] = useState(1);

  // Masters
  const [categories, setCategories] = useState([]);
  const [partners, setPartners] = useState([]);

  // Create Modal & Save Confirm
  const [modalOpen, setModalOpen] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const [formData, setFormData] = useState({
    category: 'RENT',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    paymentMethod: 'CASH',
    paidBy: 'GARAGE_ACCOUNT',
    referenceNumber: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const toast = useToast();

  const loadSettingsAndPartners = async () => {
    try {
      const [settingsRes, partnerRes] = await Promise.all([
        api.get('/settings'),
        api.get('/partnership'),
      ]);

      const catList = settingsRes.data?.settings?.expenseCategories ||
        settingsRes.data?.expenseCategories ||
        ['RENT', 'ELECTRICITY', 'SALARY', 'PARTS_SUPPLIES', 'TOOLS_EQUIPMENT', 'TEA_SNACKS', 'TRANSPORT', 'MISC'];
      setCategories(catList);

      const partnerList = Array.isArray(partnerRes.data) ? partnerRes.data : (partnerRes.data?.partners || []);
      setPartners(partnerList);
    } catch (err) {
      console.error('Failed to load expense masters:', err);
      setCategories(['RENT', 'ELECTRICITY', 'SALARY', 'PARTS_SUPPLIES', 'TOOLS_EQUIPMENT', 'TEA_SNACKS', 'TRANSPORT', 'MISC']);
    }
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/expenses', {
        params: {
          category: categoryFilter,
          paidBy: paidByFilter,
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
      setPagination(res.meta || res.pagination || payload.pagination || null);
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettingsAndPartners();
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [categoryFilter, paidByFilter, page]);

  const handleFormSubmit = (e) => {
    if (e) e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error('Expense amount must be greater than zero.');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Please enter a description for the expense.');
      return;
    }
    // Prompt confirmation before executing save action
    setShowSaveConfirm(true);
  };

  const executeSaveExpense = async () => {
    setShowSaveConfirm(false);
    setSubmitting(true);
    try {
      await api.post('/expenses', {
        ...formData,
        amount: Number(formData.amount),
      });
      toast.success('Operating expense recorded successfully');
      setModalOpen(false);
      setFormData({
        category: categories[0] || 'RENT',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        paymentMethod: 'CASH',
        paidBy: 'GARAGE_ACCOUNT',
        referenceNumber: '',
        notes: '',
      });
      fetchExpenses();
    } catch (err) {
      toast.error(err.message || 'Failed to record expense.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operating Expenses (OPEX)"
        subtitle="Track daily workshop running costs (Rent, Electricity, Technician Salaries, Tools, Transport, etc.) and payment attribution."
        actions={
          <Button
            variant="accent"
            size="sm"
            icon={Plus}
            onClick={() => setModalOpen(true)}
          >
            Record Expense
          </Button>
        }
      />

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title="Total Period Expenses"
          value={formatINR(totalAmount)}
          subtitle="Direct operational running costs"
          icon={IndianRupee}
          variant="danger"
        />

        <KpiCard
          title="Total Expense Records"
          value={pagination?.totalRecords || expenses.length || 0}
          subtitle="Expense vouchers logged"
          icon={Receipt}
          variant="default"
        />

        <KpiCard
          title="Expense Categories"
          value={categories.length}
          subtitle="Rent, power, salaries, tools..."
          icon={Filter}
          variant="info"
        />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3 rounded-xl border border-slate-200">
        <div className="flex items-center gap-3 flex-wrap">
          <Select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="w-48 text-xs py-1.5"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c.replace('_', ' ')}
              </option>
            ))}
          </Select>

          <Select
            value={paidByFilter}
            onChange={(e) => {
              setPaidByFilter(e.target.value);
              setPage(1);
            }}
            className="w-48 text-xs py-1.5"
          >
            <option value="">All Payers</option>
            <option value="GARAGE_ACCOUNT">Garage Account</option>
            {partners.map((p) => (
              <option key={p._id || p.code} value={p.code}>
                {p.name} (Personal)
              </option>
            ))}
          </Select>
        </div>

        {(categoryFilter || paidByFilter) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCategoryFilter('');
              setPaidByFilter('');
              setPage(1);
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Expense List */}
      {loading ? (
        <TableSkeleton rows={6} cols={7} />
      ) : expenses.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No expenses recorded"
          description="Record daily workshop utility bills, rent, technician salaries, and operational costs."
          actionText="Record Expense"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <div>
          <Table>
            <TableHeader>
              <TableRow hover={false}>
                <TableHead>Voucher No.</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Paid By</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((exp) => {
                const isPartnerPaid = exp.paidBy !== 'GARAGE_ACCOUNT';
                return (
                  <TableRow key={exp._id} hover={false}>
                    <TableCell>
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">
                        {exp.expenseNumber || `EXP-${exp._id?.slice(-4)}`}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">{exp.category?.replace('_', ' ')}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-800 text-xs max-w-sm">
                        {exp.description}
                      </div>
                      {exp.notes && <div className="text-[11px] text-slate-400 mt-0.5">{exp.notes}</div>}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${
                          isPartnerPaid
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'text-slate-700 bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {exp.paidBy?.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-600 font-mono">{exp.paymentMethod}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-extrabold text-rose-600">
                        {formatINR(exp.amount)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-xs text-slate-500 font-medium">
                      {formatDate(exp.date)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {pagination && <Pagination pagination={pagination} onPageChange={(newPage) => setPage(newPage)} />}
        </div>
      )}

      {/* Record Expense Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        confirmOnClose={true}
        title="Record Operating Expense (OPEX)"
        subtitle="Log workshop utility bills, rent, supplies, or technician salaries"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <ModalCancelButton disabled={submitting}>Cancel</ModalCancelButton>
            <Button
              type="submit"
              form="expense-form"
              variant="accent"
              loading={submitting}
            >
              Save Expense Record
            </Button>
          </div>
        }
      >
        <form id="expense-form" onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Expense Category"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c.replace('_', ' ')}
                </option>
              ))}
            </Select>

            <Input
              label="Expense Amount (₹)"
              type="number"
              min="1"
              step="0.01"
              required
              placeholder="e.g. 2400"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>

          <Input
            label="Description / Purpose"
            required
            placeholder="e.g. Monthly workshop electricity bill (air compressor + lighting)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Paid By (Attribution)"
              required
              value={formData.paidBy}
              onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
              hint="If paid by a partner, it will be automatically credited during monthly settlement"
            >
              <option value="GARAGE_ACCOUNT">Garage Account</option>
              {partners.map((p) => (
                <option key={p._id || p.code} value={p.code}>
                  {p.name} (Personal Account)
                </option>
              ))}
            </Select>

            <Select
              label="Payment Method"
              required
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
            >
              <option value="CASH">Cash</option>
              <option value="UPI">UPI</option>
              <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
              <option value="CARD">Card</option>
              <option value="OTHER">Other</option>
            </Select>

            <Input
              label="Expense Date"
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <Input
            label="Reference / Bill / Txn Number"
            placeholder="e.g. ELEC-REC-9814"
            value={formData.referenceNumber}
            onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
          />

          <Textarea
            label="Additional Notes"
            placeholder="Internal expense details or notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </form>
      </Modal>

      {/* Save Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={executeSaveExpense}
        title="Save Operating Expense?"
        message={`Save expense record of ${formatINR(Number(formData.amount || 0))} for "${formData.description}"?`}
        confirmText="Yes, Save Record"
        cancelText="Review Form"
        variant="success"
        loading={submitting}
      />
    </div>
  );
};
