import React, { useState, useMemo } from 'react';
import {
  Calculator,
  RotateCcw,
  UserCheck,
  Building2,
  Sparkles,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input, CurrencyInput } from '../../components/ui/Input.jsx';
import { formatINR } from '../../utils/formatters.js';

export const SettlementCalculatorPage = () => {
  // Form State
  const [totalRevenue, setTotalRevenue] = useState('');
  const [garageExpenses, setGarageExpenses] = useState('');
  const [naimAdvance, setNaimAdvance] = useState('');
  const [imranAdvance, setImranAdvance] = useState('');
  const [notes, setNotes] = useState('');

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

  const handleReset = () => {
    setTotalRevenue('');
    setGarageExpenses('');
    setNaimAdvance('');
    setImranAdvance('');
    setNotes('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Settlement Calculator"
        subtitle="Garage Revenue, Operating Expenses, Advance Draws, aur Partner 50/50 Equity Share Net Payout Live Calculate Karein."
      />

      {/* Main Interactive Live Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Inputs Form (6 cols) */}
        <Card className="lg:col-span-6 p-4 sm:p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Calculator className="w-5 h-5 text-[#0284C7]" />
            <h2 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Calculation Inputs
            </h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CurrencyInput
                label="Total Garage Revenue"
                placeholder="0"
                value={totalRevenue}
                onChange={(e) => setTotalRevenue(e.target.value)}
              />
              <CurrencyInput
                label="Total Garage Expenses"
                placeholder="0"
                value={garageExpenses}
                onChange={(e) => setGarageExpenses(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <CurrencyInput
                label="Naim Pathan Advance Draw"
                placeholder="0"
                value={naimAdvance}
                onChange={(e) => setNaimAdvance(e.target.value)}
              />
              <CurrencyInput
                label="Imran Pathan Advance Draw"
                placeholder="0"
                value={imranAdvance}
                onChange={(e) => setImranAdvance(e.target.value)}
              />
            </div>

            <Input
              label="Notes / Remarks (Optional)"
              placeholder="e.g. Weekly settlement for August 2nd Week..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="w-full justify-center text-xs font-bold"
              >
                <RotateCcw className="w-4 h-4 mr-2" /> Reset Calculator
              </Button>
            </div>
          </div>
        </Card>

        {/* Live Calculation Results Breakdown (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Net Profit Summary Card */}
          <Card className="p-5 border-2 border-sky-100 bg-gradient-to-br from-white to-sky-50/50 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-sky-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#0284C7]" />
                <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Net Profit Summary
                </span>
              </div>
              <span className="text-[10px] font-extrabold bg-sky-100 text-[#0284C7] px-2.5 py-0.5 rounded-full uppercase">
                Live Calculation
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-4 text-center">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Revenue</div>
                <div className="text-sm font-black text-slate-900 mt-1">{formatINR(revVal)}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Expenses</div>
                <div className="text-sm font-black text-rose-600 mt-1">-{formatINR(expVal)}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Net Profit</div>
                <div className={`text-base font-black mt-1 ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {formatINR(netProfit)}
                </div>
              </div>
            </div>
          </Card>

          {/* Partner Share Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Naim Pathan Share */}
            <Card className="p-4 border border-slate-200 bg-white shadow-xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <UserCheck className="w-4 h-4 text-[#0284C7]" />
                <span className="text-xs font-black text-slate-900">Naim Pathan (50%)</span>
              </div>
              <div className="space-y-1.5 text-xs font-medium text-slate-600">
                <div className="flex justify-between">
                  <span>50% Base Share:</span>
                  <span className="font-bold text-slate-900">{formatINR(naimBaseShare)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Less Advance:</span>
                  <span className="font-bold text-rose-600">-{formatINR(naimAdvVal)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100 text-sm font-black text-slate-900">
                  <span>Net Payout:</span>
                  <span className={naimFinalPayout >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                    {formatINR(naimFinalPayout)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Imran Pathan Share */}
            <Card className="p-4 border border-slate-200 bg-white shadow-xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <UserCheck className="w-4 h-4 text-[#0284C7]" />
                <span className="text-xs font-black text-slate-900">Imran Pathan (50%)</span>
              </div>
              <div className="space-y-1.5 text-xs font-medium text-slate-600">
                <div className="flex justify-between">
                  <span>50% Base Share:</span>
                  <span className="font-bold text-slate-900">{formatINR(imranBaseShare)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Less Advance:</span>
                  <span className="font-bold text-rose-600">-{formatINR(imranAdvVal)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100 text-sm font-black text-slate-900">
                  <span>Net Payout:</span>
                  <span className={imranFinalPayout >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                    {formatINR(imranFinalPayout)}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
