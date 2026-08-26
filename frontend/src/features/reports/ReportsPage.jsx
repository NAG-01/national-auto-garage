import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  IndianRupee,
  TrendingUp,
  FileText,
  Wrench,
  Package,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  PieChart,
} from 'lucide-react';
import api from '../../api/client.js';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { KpiCard } from '../../components/ui/KpiCard.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Select, Input } from '../../components/ui/Input.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import { ErrorState } from '../../components/ui/ErrorState.jsx';
import { formatINR, formatDate } from '../../utils/formatters.js';

export const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('financial'); // 'financial' | 'service' | 'inventory'
  const [datePreset, setDatePreset] = useState('thisMonth'); // 'today' | 'thisMonth' | 'lastMonth' | 'custom'

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [financialData, setFinancialData] = useState(null);
  const [serviceData, setServiceData] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Compute date ranges based on preset
  useEffect(() => {
    const now = new Date();
    if (datePreset === 'today') {
      const todayStr = now.toISOString().split('T')[0];
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (datePreset === 'thisMonth') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      setStartDate(start);
      setEndDate(end);
    } else if (datePreset === 'lastMonth') {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
      const end = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
      setStartDate(start);
      setEndDate(end);
    }
  }, [datePreset]);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'financial') {
        const res = await api.get('/reports/financial', { params: { startDate, endDate } });
        setFinancialData(res.data);
      } else if (activeTab === 'service') {
        const res = await api.get('/reports/service', { params: { startDate, endDate } });
        setServiceData(res.data);
      } else if (activeTab === 'inventory') {
        const res = await api.get('/reports/inventory');
        setInventoryData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [activeTab, startDate, endDate]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Financial Analytics"
        subtitle="Period-based financial statements, parts vs labour revenue split, job analytics, and inventory valuation."
      />

      {/* Control Bar: Date Preset & Custom Range Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('financial')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'financial'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Financial & Revenue
          </button>
          <button
            onClick={() => setActiveTab('service')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'service'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Job & Workshop
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'inventory'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Inventory Stock Valuation
          </button>
        </div>

        {/* Date Filter Controls (applicable to Financial & Service tabs) */}
        {activeTab !== 'inventory' && (
          <div className="flex items-center gap-3 flex-wrap">
            <Select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value)}
              className="text-xs py-1.5 w-36"
            >
              <option value="today">Today</option>
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="custom">Custom Range</option>
            </Select>

            {datePreset === 'custom' && (
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="text-xs py-1"
                />
                <span className="text-xs text-slate-400">to</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="text-xs py-1"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <Skeleton rows={8} />
      ) : error ? (
        <ErrorState title="Report Error" message={error} onRetry={fetchReports} />
      ) : (
        <>
          {/* TAB 1: FINANCIAL & REVENUE REPORT */}
          {activeTab === 'financial' && financialData && (
            <div className="space-y-6">
              {/* Financial KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard
                  title="Total Billed Revenue"
                  value={formatINR(financialData.totalBilledRevenue)}
                  subtitle={`${financialData.billCount} invoices issued`}
                  icon={IndianRupee}
                  variant="accent"
                />

                <KpiCard
                  title="Cash Collections"
                  value={formatINR(financialData.totalCashCollected)}
                  subtitle={`${financialData.paymentCount} payments received`}
                  icon={TrendingUp}
                  variant="info"
                />

                <KpiCard
                  title="Operating Expenses"
                  value={formatINR(financialData.totalExpenses)}
                  subtitle={`${financialData.expenseCount} vouchers logged`}
                  icon={IndianRupee}
                  variant="danger"
                />

                <KpiCard
                  title="Net Profit"
                  value={formatINR(financialData.netProfit)}
                  subtitle="Revenue minus Operating costs"
                  icon={CheckCircle2}
                  variant={financialData.netProfit >= 0 ? 'accent' : 'danger'}
                />
              </div>

              {/* Revenue Composition Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card
                  title="Revenue Allocation: Spare Parts vs Labour"
                  subtitle="Breakdown of billed revenue stream"
                >
                  <div className="space-y-4 pt-2">
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                        <span>Spare Parts & Lubricants Sales</span>
                        <span className="font-mono text-emerald-700">
                          {formatINR(financialData.partsRevenue)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className="bg-emerald-500 h-2 rounded-full"
                          style={{
                            width: `${
                              financialData.totalBilledRevenue > 0
                                ? Math.min(
                                    100,
                                    (financialData.partsRevenue / financialData.totalBilledRevenue) *
                                      100
                                  )
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                        <span>Mechanic Labour Charges</span>
                        <span className="font-mono text-orange-600">
                          {formatINR(financialData.labourRevenue)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full"
                          style={{
                            width: `${
                              financialData.totalBilledRevenue > 0
                                ? Math.min(
                                    100,
                                    (financialData.labourRevenue /
                                      financialData.totalBilledRevenue) *
                                      100
                                  )
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>Total Customer Discounts Applied:</span>
                      <span className="font-mono font-bold text-rose-600">
                        -{formatINR(financialData.totalDiscounts)}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Expense Allocation by Category */}
                <Card
                  title="Operating Expense Category Allocation"
                  subtitle="Breakdown of shop running costs"
                >
                  {Object.keys(financialData.expensesByCategory).length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500 italic">
                      No operating expenses recorded for selected period
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {Object.entries(financialData.expensesByCategory).map(([cat, val]) => (
                        <div key={cat} className="py-2.5 flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800">{cat}</span>
                          <span className="font-mono font-bold text-rose-600">
                            {formatINR(val)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            </div>
          )}

          {/* TAB 2: SERVICE & JOB ANALYTICS */}
          {activeTab === 'service' && serviceData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <KpiCard
                  title="Total Workshop Jobs"
                  value={serviceData.totalJobs}
                  subtitle="Service job cards created"
                  icon={Wrench}
                  variant="info"
                />

                <KpiCard
                  title="Labour Revenue Generated"
                  value={formatINR(serviceData.totalLabourCharges)}
                  subtitle="Total mechanic service fees"
                  icon={IndianRupee}
                  variant="accent"
                />

                <KpiCard
                  title="Parts Revenue Generated"
                  value={formatINR(serviceData.totalPartsCharges)}
                  subtitle="Total spare parts billed"
                  icon={Package}
                  variant="default"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Job Status Breakdown" subtitle="Distribution of job progress">
                  <div className="divide-y divide-slate-100">
                    {Object.entries(serviceData.byStatus).map(([st, cnt]) => (
                      <div key={st} className="py-2.5 flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">{st}</span>
                        <span className="font-mono font-bold text-slate-900">{cnt} jobs</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card title="Service Type Breakdown" subtitle="Full Service vs Engine Jobs">
                  <div className="divide-y divide-slate-100">
                    {Object.entries(serviceData.byServiceType).map(([tp, cnt]) => (
                      <div key={tp} className="py-2.5 flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">
                          {tp.replace('_', ' ')}
                        </span>
                        <span className="font-mono font-bold text-orange-600">{cnt} jobs</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 3: INVENTORY STOCK VALUATION */}
          {activeTab === 'inventory' && inventoryData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <KpiCard
                  title="Purchase Valuation"
                  value={formatINR(inventoryData.purchaseValuation)}
                  subtitle="Total cost of inventory on hand"
                  icon={IndianRupee}
                  variant="default"
                />

                <KpiCard
                  title="Selling Valuation"
                  value={formatINR(inventoryData.sellingValuation)}
                  subtitle="Retail value of inventory on hand"
                  icon={TrendingUp}
                  variant="accent"
                />

                <KpiCard
                  title="Potential Profit Margin"
                  value={formatINR(inventoryData.potentialMargin)}
                  subtitle="Retail value minus Cost"
                  icon={CheckCircle2}
                  variant="info"
                />

                <KpiCard
                  title="Low Stock Warning Items"
                  value={inventoryData.lowStockCount}
                  subtitle="Items requiring re-order"
                  icon={AlertTriangle}
                  variant="danger"
                />
              </div>

              <Card
                title="Inventory Valuation by Category"
                subtitle="Breakdown of stock units and cost valuation across product categories"
              >
                <div className="divide-y divide-slate-100">
                  {Object.entries(inventoryData.categoryBreakdown).map(([cat, data]) => (
                    <div key={cat} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{cat}</div>
                        <div className="text-slate-500 font-mono">
                          {data.count} items • {data.units} total units on hand
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <div className="font-bold text-slate-900">
                          Cost: {formatINR(data.valuation)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
};
