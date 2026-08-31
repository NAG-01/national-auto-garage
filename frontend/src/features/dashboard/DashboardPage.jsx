import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Package,
  Globe,
  Sparkles,
} from 'lucide-react';
import api from '../../api/client.js';
import { Button } from '../../components/ui/Button.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import { ErrorState } from '../../components/ui/ErrorState.jsx';

export const DashboardPage = () => {
  const [lowStockParts, setLowStockParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchLowStockAlerts = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    setFetching(true);
    setError(null);
    try {
      const res = await api.get('/dashboard/metrics');
      const payload = res.data || res.message || res;
      const list = payload.lowStockParts || res.lowStockParts || (Array.isArray(payload) ? payload : []);
      setLowStockParts(list);
    } catch (err) {
      console.error('Dashboard metrics error:', err);
      setError(err.message || 'Failed to check stock alerts.');
    } finally {
      setLoading(false);
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchLowStockAlerts(true);
  }, []);

  return (
    <div className="space-y-6">
      {/* Apple-Style Glassmorphism Hero Header */}
      <div className="bg-white/85 backdrop-blur-2xl p-5 sm:p-7 rounded-3xl border border-white/90 shadow-md shadow-slate-200/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-[#0284C7] text-xs font-black uppercase tracking-wider mb-2 border border-sky-200 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" /> Workshop Dashboard
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
            Garage Stock & Operations Hub
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Real-time workshop stock alert monitor aur inventory shortage tracker.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-stretch sm:self-auto shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchLowStockAlerts(false)}
            loading={fetching}
            icon={RefreshCw}
            className="flex-1 sm:flex-none"
          >
            Refresh Data
          </Button>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-2xl bg-slate-900 hover:bg-[#0284C7] text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-slate-900/10 transition-all active:scale-95 shrink-0"
          >
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Visiting Site</span>
          </a>
        </div>
      </div>

      {/* Main Alert Notification Area */}
      <div>
        <div className="px-1 pb-3 text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <Package className="w-3.5 h-3.5 text-[#0284C7]" />
          <span>Stock Alert Monitor</span>
        </div>

        {loading ? (
          <Skeleton rows={4} />
        ) : error ? (
          <ErrorState title="Notification Error" message={error} onRetry={() => fetchLowStockAlerts(true)} />
        ) : lowStockParts.length > 0 ? (
          /* LOW STOCK ALERT CARD */
          <div className="bg-amber-50/90 border border-amber-300/80 rounded-3xl p-5 sm:p-7 shadow-md shadow-amber-500/10 space-y-4 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-amber-200/80">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#F59E0B] text-white rounded-2xl shadow-md shadow-amber-500/20 shrink-0">
                  <AlertTriangle className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 tracking-tight uppercase">
                    Stock Warning Alert
                  </h2>
                  <p className="text-xs font-semibold text-amber-900 mt-0.5">
                    Niche diye gaye items ka stock khatam hone wala hai:
                  </p>
                </div>
              </div>

              <span className="px-3.5 py-1.5 rounded-full bg-amber-200 text-amber-900 text-xs font-black uppercase tracking-wider shrink-0 shadow-2xs">
                {lowStockParts.length} {lowStockParts.length === 1 ? 'Item' : 'Items'}
              </span>
            </div>

            {/* Simple Item Cards */}
            <div className="space-y-3">
              {lowStockParts.map((p) => (
                <div
                  key={p._id || p.productId}
                  className="p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-amber-200 border-l-4 border-l-[#F59E0B] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <h3 className="font-black text-slate-900 text-sm sm:text-base uppercase tracking-tight">
                      {p.name}
                    </h3>
                    <p className="text-xs font-bold text-rose-600 mt-0.5 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 inline-block animate-ping" />
                      Yeh stock khatam hone wala hai
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/inventory?status=LOW_STOCK')}
                    icon={ArrowRight}
                    className="self-start sm:self-center shrink-0 shadow-xs"
                  >
                    Restock Karein
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* HEALTHY STOCK STATE */
          <div className="bg-white/85 backdrop-blur-2xl border border-white/90 rounded-3xl p-8 text-center space-y-3 shadow-md shadow-slate-200/30">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
              Sabhi Items Stock Me Available Hain
            </h2>
            <p className="text-xs text-slate-600 font-medium max-w-md mx-auto">
              Abhi koi bhi spare part ya oil kam nahi pad raha hai. Jab bhi koi item kam hoga, yahan automatic alert aa jayega.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
