import React, { useState, useEffect, useCallback } from 'react';
import {
  Briefcase,
  Plus,
  Lock,
  DollarSign,
  UserCheck,
  Calendar,
  AlertCircle,
  CheckCircle2,
  FileText,
  Clock,
  History,
} from 'lucide-react';
import api from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { KpiCard } from '../../components/ui/KpiCard.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Table } from '../../components/ui/Table.jsx';
import { StatusBadge, Badge } from '../../components/ui/Badge.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { ErrorState } from '../../components/ui/ErrorState.jsx';
import { PartnerTransactionModal } from './PartnerTransactionModal.jsx';
import { formatPhone, formatDate, formatINR } from '../../utils/formatters.js';

export const PartnershipPage = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('TRANSACTIONS'); // 'TRANSACTIONS' | 'HISTORY'

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  const toast = useToast();

  const fetchSettlementData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, txnRes, histRes] = await Promise.all([
        api.get('/partnership/summary', { params: { month: selectedMonth, year: selectedYear } }),
        api.get('/partnership/transactions', { params: { month: selectedMonth, year: selectedYear } }),
        api.get('/partnership/history', { params: { year: selectedYear } }),
      ]);

      setSummary(sumRes.data);
      setTransactions(txnRes.data || []);
      setHistory(histRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load partnership settlement data.');
      toast.error('Failed to load partnership data.');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear, toast]);

  useEffect(() => {
    fetchSettlementData();
  }, [fetchSettlementData]);

  const handleFinalizeSettlement = async () => {
    if (!window.confirm(`Are you sure you want to finalize and lock settlement for ${selectedMonth}/${selectedYear}?`)) {
      return;
    }

    setFinalizing(true);
    try {
      const res = await api.post('/partnership/finalize', {
        month: Number(selectedMonth),
        year: Number(selectedYear),
        notes: `Finalized on ${new Date().toLocaleDateString()}`,
      });

      toast.success(`Settlement ${res.data.settlementNumber} finalized successfully!`);
      fetchSettlementData();
    } catch (err) {
      toast.error(err.message || 'Failed to finalize settlement.');
    } finally {
      setFinalizing(false);
    }
  };

  const transactionColumns = [
    {
      header: 'Txn ID',
      accessor: 'transactionId',
      render: (t) => (
        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {t.transactionId}
        </span>
      ),
    },
    {
      header: 'Date',
      accessor: 'date',
      render: (t) => formatDate(t.date),
    },
    {
      header: 'Partner',
      accessor: 'partner',
      render: (t) => (
        <span className="font-bold text-slate-900 flex items-center gap-1.5">
          <UserCheck className="w-3.5 h-3.5 text-orange-600" />
          {t.partner}
        </span>
      ),
    },
    {
      header: 'Type',
      accessor: 'type',
      render: (t) => (
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded uppercase border ${
            t.type === 'PERSONAL_WITHDRAWAL'
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}
        >
          {t.type.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      header: 'Reason / Purpose',
      accessor: 'reason',
      render: (t) => <span className="text-xs text-slate-700 font-medium">{t.reason}</span>,
    },
    {
      header: 'Amount',
      accessor: 'amount',
      className: 'text-right font-mono font-bold text-xs',
      render: (t) => (
        <span className={t.type === 'PERSONAL_WITHDRAWAL' ? 'text-rose-700' : 'text-emerald-700'}>
          {t.type === 'PERSONAL_WITHDRAWAL' ? `- ${formatINR(t.amount)}` : `+ ${formatINR(t.amount)}`}
        </span>
      ),
    },
  ];

  const historyColumns = [
    {
      header: 'Settlement ID',
      accessor: 'settlementNumber',
      render: (h) => (
        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {h.settlementNumber}
        </span>
      ),
    },
    {
      header: 'Month / Year',
      accessor: 'month',
      render: (h) => (
        <span className="font-semibold text-slate-900">
          {h.month}/{h.year}
        </span>
      ),
    },
    {
      header: 'Cash Collections',
      accessor: 'totalCashReceived',
      className: 'text-right font-mono text-xs text-slate-700',
      render: (h) => formatINR(h.totalCashReceived),
    },
    {
      header: 'Garage Expenses',
      accessor: 'totalBusinessExpenses',
      className: 'text-right font-mono text-xs text-rose-700',
      render: (h) => formatINR(h.totalBusinessExpenses),
    },
    {
      header: 'Net Distributable Profit',
      accessor: 'netDistributableProfit',
      className: 'text-right font-mono font-bold text-slate-900 text-xs',
      render: (h) => formatINR(h.netDistributableProfit),
    },
    {
      header: 'Naim Payout',
      accessor: 'naimFinalPayout',
      className: 'text-right font-mono font-bold text-emerald-700 text-xs',
      render: (h) => formatINR(h.naimFinalPayout),
    },
    {
      header: 'Imran Payout',
      accessor: 'imranFinalPayout',
      className: 'text-right font-mono font-bold text-emerald-700 text-xs',
      render: (h) => formatINR(h.imranFinalPayout),
    },
  ];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Partnership & Monthly Settlement"
        subtitle="Transparent 50/50 profit splitting between Naim and Imran, tracking personal draws and out-of-pocket expenses"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              icon={Plus}
              onClick={() => setIsTransactionModalOpen(true)}
            >
              Record Transaction
            </Button>
            <Button
              variant="accent"
              icon={Lock}
              loading={finalizing}
              disabled={summary?.isFinalized}
              onClick={handleFinalizeSettlement}
            >
              {summary?.isFinalized ? 'Settlement Finalized' : 'Finalize Settlement'}
            </Button>
          </div>
        }
      />

      {/* Date Filter & Status Banner */}
      <Card noPadding className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-orange-600 shrink-0" />
            <div className="flex items-center gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="text-sm font-bold text-slate-900 bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {monthNames.map((name, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    {name}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="text-sm font-bold text-slate-900 bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {[2024, 2025, 2026, 2027].map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            {summary?.isFinalized ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full uppercase">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Monthly Settlement Finalized ({summary.settlementNumber})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full uppercase">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Live Settlement Draft ({monthNames[selectedMonth - 1]} {selectedYear})
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KpiCard
          title="Cash Collections"
          value={formatINR(summary?.totalCashReceived ?? 0)}
          icon={DollarSign}
          variant="accent"
        />
        <KpiCard
          title="Garage Expenses"
          value={formatINR(summary?.totalBusinessExpenses ?? 0)}
          icon={AlertCircle}
          variant="danger"
        />
        <KpiCard
          title="Net Distributable Profit"
          value={formatINR(summary?.netDistributableProfit ?? 0)}
          icon={Briefcase}
          variant="info"
        />
        <KpiCard
          title="Naim Final Payout"
          value={formatINR(summary?.naimFinalPayout ?? 0)}
          icon={UserCheck}
          variant="accent"
        />
        <KpiCard
          title="Imran Final Payout"
          value={formatINR(summary?.imranFinalPayout ?? 0)}
          icon={UserCheck}
          variant="accent"
        />
      </div>

      {/* Side-by-Side Partner Share Breakdown Cards */}
      {loading ? (
        <Card className="p-6">
          <Skeleton rows={4} />
        </Card>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchSettlementData} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Naim Partner Card */}
          <Card className="p-6 space-y-4 border-t-4 border-t-orange-600">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 font-extrabold flex items-center justify-center text-base">
                  N
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Naim Pathan</h3>
                  <span className="text-xs text-slate-500 font-medium">50% Garage Partner</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded">
                50% Base Share
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Base 50% Profit Share:</span>
                <span className="font-bold text-slate-900">{formatINR(summary?.naimShare ?? 0)}</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>Personal Withdrawals (-):</span>
                <span>- {formatINR(summary?.naimWithdrawals ?? 0)}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Out-of-Pocket Credits (+):</span>
                <span>+ {formatINR(summary?.naimOutOfPocketCredit ?? 0)}</span>
              </div>
              <div className="border-t border-slate-200 pt-3 flex justify-between text-sm font-extrabold text-slate-900 bg-slate-50 p-3 rounded-xl">
                <span>Naim Net Payout:</span>
                <span className="text-emerald-700">{formatINR(summary?.naimFinalPayout ?? 0)}</span>
              </div>
            </div>
          </Card>

          {/* Imran Partner Card */}
          <Card className="p-6 space-y-4 border-t-4 border-t-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-extrabold flex items-center justify-center text-base">
                  I
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Imran Shaikh</h3>
                  <span className="text-xs text-slate-500 font-medium">50% Garage Partner</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded">
                50% Base Share
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Base 50% Profit Share:</span>
                <span className="font-bold text-slate-900">{formatINR(summary?.imranShare ?? 0)}</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>Personal Withdrawals (-):</span>
                <span>- {formatINR(summary?.imranWithdrawals ?? 0)}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Out-of-Pocket Credits (+):</span>
                <span>+ {formatINR(summary?.imranOutOfPocketCredit ?? 0)}</span>
              </div>
              <div className="border-t border-slate-200 pt-3 flex justify-between text-sm font-extrabold text-slate-900 bg-slate-50 p-3 rounded-xl">
                <span>Imran Net Payout:</span>
                <span className="text-emerald-700">{formatINR(summary?.imranFinalPayout ?? 0)}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('TRANSACTIONS')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeTab === 'TRANSACTIONS'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          Partner Transactions Ledger ({transactions.length})
        </button>

        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
            activeTab === 'HISTORY'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4" />
          Monthly Settlement History ({history.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'TRANSACTIONS' ? (
        transactions.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No partner transactions logged"
            description={`No personal withdrawals or out-of-pocket expenses recorded for ${monthNames[selectedMonth - 1]} ${selectedYear}.`}
            actionLabel="Record Transaction"
            onAction={() => setIsTransactionModalOpen(true)}
          />
        ) : (
          <Card className="overflow-hidden">
            <Table columns={transactionColumns} data={transactions} />
          </Card>
        )
      ) : history.length === 0 ? (
        <EmptyState
          icon={History}
          title="No finalized settlements yet"
          description="Finalized monthly settlements will appear here as frozen financial ledger records."
        />
      ) : (
        <Card className="overflow-hidden">
          <Table columns={historyColumns} data={history} />
        </Card>
      )}

      {/* Record Partner Transaction Modal */}
      <PartnerTransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onSuccess={fetchSettlementData}
      />
    </div>
  );
};
