import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Lock,
  Unlock,
  CheckCircle2,
  Calendar,
  IndianRupee,
  TrendingUp,
  ArrowRight,
  Printer,
  AlertCircle,
} from 'lucide-react';
import api from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { KpiCard } from '../../components/ui/KpiCard.jsx';
import { Badge, StatusBadge } from '../../components/ui/Badge.jsx';
import { Select } from '../../components/ui/Input.jsx';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui/Table.jsx';
import { TableSkeleton } from '../../components/ui/Skeleton.jsx';
import { PartnerTransactionModal } from './PartnerTransactionModal.jsx';
import { formatINR, formatDate } from '../../utils/formatters.js';

export const PartnershipDashboardPage = () => {
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());

  const [settlementData, setSettlementData] = useState(null);
  const [partners, setPartners] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [settlementHistory, setSettlementHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [txModalOpen, setTxModalOpen] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  const toast = useToast();

  const loadPartnershipData = async () => {
    try {
      setLoading(true);
      const [settleRes, partnerRes, txRes, historyRes] = await Promise.all([
        api.get('/partnership/settlement/calculate', { params: { month, year } }),
        api.get('/partnership'),
        api.get('/partnership/transactions'),
        api.get('/partnership/settlement/history'),
      ]);

      setSettlementData(settleRes.data);
      setPartners(partnerRes.data || []);
      setTransactions(txRes.data || []);
      setSettlementHistory(historyRes.data || []);
    } catch (err) {
      console.error('Failed to load partnership data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartnershipData();
  }, [month, year]);

  const handleFinalizeSettlement = async () => {
    setFinalizing(true);
    try {
      await api.post('/partnership/settlement/finalize', {
        month,
        year,
        notes: `Finalized monthly settlement for ${month}/${year}`,
      });
      toast.success(`Settlement for ${month}/${year} finalized and locked successfully.`);
      loadPartnershipData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setFinalizing(false);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  if (loading) return <TableSkeleton rows={8} cols={4} />;

  const { totalRevenue = 0, totalOperatingExpenses = 0, netProfit = 0, partnerShares = [], isFinalized = false } =
    settlementData || {};

  return (
    <div className="space-y-6">
      <PageHeader
        title="Two-Partner Financial Settlement"
        subtitle="Transparent profit distribution, personal expense reimbursement, and monthly settlement locking."
        actions={
          <Button
            variant="accent"
            size="sm"
            icon={Plus}
            onClick={() => setTxModalOpen(true)}
          >
            Record Partner Txn
          </Button>
        }
      />

      {/* Month & Year Selection Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-orange-600" />
          <div className="flex items-center gap-2">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="text-sm font-bold text-slate-900 border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              {monthNames.map((mName, i) => (
                <option key={i + 1} value={i + 1}>
                  {mName}
                </option>
              ))}
            </select>

            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="text-sm font-bold text-slate-900 border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              {[2024, 2025, 2026, 2027, 2028].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={isFinalized ? 'success' : 'default'} dot>
            {isFinalized ? 'Finalized & Locked' : 'Draft / Live Calculation'}
          </Badge>

          {!isFinalized ? (
            <Button
              variant="primary"
              size="sm"
              icon={Lock}
              onClick={handleFinalizeSettlement}
              loading={finalizing}
            >
              Finalize & Lock Period
            </Button>
          ) : (
            <Button variant="outline" size="sm" icon={Printer} onClick={() => window.print()}>
              Print Statement
            </Button>
          )}
        </div>
      </div>

      {/* High-Level Accounting Math Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title={`Revenue (${monthNames[month - 1]} ${year})`}
          value={formatINR(totalRevenue)}
          subtitle="Total services invoiced"
          icon={TrendingUp}
          variant="success"
        />

        <KpiCard
          title="Operating Expenses (OPEX)"
          value={formatINR(totalOperatingExpenses)}
          subtitle="Shop costs, rent, electricity, salaries"
          icon={IndianRupee}
          variant="danger"
        />

        <KpiCard
          title="Net Garage Profit"
          value={formatINR(netProfit)}
          subtitle="Revenue − Operating costs"
          icon={Briefcase}
          variant={netProfit >= 0 ? 'accent' : 'danger'}
        />
      </div>

      {/* Transparent Breakdown by Partner (Section 25 & 26) */}
      <Card
        title={`Partner Settlement Statement for ${monthNames[month - 1]} ${year}`}
        subtitle="Transparent step-by-step formula: (Net Profit × Ownership %) + Personal Exp Paid + Capital Contributions − Withdrawals"
        noPadding
      >
        <div className="divide-y divide-slate-100">
          {partnerShares.map((share) => (
            <div key={share.partnerId} className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-600 text-white font-bold text-sm flex items-center justify-center">
                    {share.partnerName?.[0] || 'P'}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{share.partnerName}</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Ownership Share: <span className="font-bold text-orange-600">{share.ownershipPercentage}%</span>
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Final Net Payout / Settlement Due
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-0.5">
                    {formatINR(share.finalSettlementAmount)}
                  </div>
                </div>
              </div>

              {/* Line-Item Formula Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <div className="text-slate-500 font-medium">1. Base Profit Share</div>
                  <div className="font-bold text-slate-900 mt-0.5">{formatINR(share.baseProfitShare)}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {share.ownershipPercentage}% of {formatINR(netProfit)}
                  </div>
                </div>

                <div>
                  <div className="text-slate-500 font-medium">2. Personal Expenses Paid (+)</div>
                  <div className="font-bold text-emerald-700 mt-0.5">
                    +{formatINR(share.personalExpensesPaid)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Paid out-of-pocket for shop</div>
                </div>

                <div>
                  <div className="text-slate-500 font-medium">3. Capital Injected (+)</div>
                  <div className="font-bold text-blue-700 mt-0.5">
                    +{formatINR(share.capitalContributions)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Cash added to garage</div>
                </div>

                <div>
                  <div className="text-slate-500 font-medium">4. Drawings / Withdrawals (−)</div>
                  <div className="font-bold text-rose-600 mt-0.5">
                    −{formatINR(share.withdrawals)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Withdrawn from shop account</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Partner Transactions Ledger & History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transactions Recorded */}
        <Card
          title="Recent Partner Transactions"
          subtitle="Capital injections, withdrawals, and reimbursements"
          noPadding
        >
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No partner transactions recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {transactions.slice(0, 8).map((tx) => (
                <div key={tx._id} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-semibold text-slate-900">{tx.description}</div>
                    <div className="text-slate-500 mt-0.5">
                      {tx.partnerId?.name} • <span className="font-mono">{tx.type?.replace(/_/g, ' ')}</span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-slate-900 font-mono">{formatINR(tx.amount)}</div>
                    <div className="text-[10px] text-slate-400">{formatDate(tx.date)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Finalized Settlement Archive */}
        <Card
          title="Finalized Settlement Archive"
          subtitle="Locked monthly financial statements"
          noPadding
        >
          {settlementHistory.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No historical periods finalized yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {settlementHistory.map((s) => (
                <div key={s._id} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-slate-900 font-mono">{s.settlementNumber}</div>
                    <div className="text-slate-500">
                      Period: {monthNames[s.month - 1]} {s.year} • Finalized by {s.finalizedBy?.name || 'Admin'}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-emerald-700">Profit: {formatINR(s.netProfit)}</div>
                    <Badge variant="success" size="sm">
                      LOCKED
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <PartnerTransactionModal
        isOpen={txModalOpen}
        onClose={() => setTxModalOpen(false)}
        partners={partners}
        onSuccess={loadPartnershipData}
      />
    </div>
  );
};
