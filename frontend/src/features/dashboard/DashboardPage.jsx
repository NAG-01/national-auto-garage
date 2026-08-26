import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, ArrowRight, RefreshCw, Package } from 'lucide-react';
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
    <div className="space-y-5 max-w-3xl mx-auto py-2">
      {/* Clean Dashboard Header */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-[#172033] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-[#263449] shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
            <Package className="w-4 h-4" />
            Stock Alert Monitor
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Garage Stock Alerts
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Workshop spare parts aur oil stock ka automatic alert status
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchLowStockAlerts(false)}
          loading={fetching}
          icon={RefreshCw}
          className="shrink-0"
        >
          Refresh
        </Button>
      </div>

      {/* Main Alert Notification Area */}
      {loading ? (
        <Skeleton rows={4} />
      ) : error ? (
        <ErrorState title="Notification Error" message={error} onRetry={() => fetchLowStockAlerts(true)} />
      ) : lowStockParts.length > 0 ? (
        /* LOW STOCK ALERT CARD */
        <div className="bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-amber-100/30 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-amber-900/30 border-2 border-amber-300 dark:border-amber-900/60 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-amber-200/80 dark:border-amber-900/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-2xs shrink-0">
                <AlertTriangle className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  Stock Warning Alert
                </h2>
                <p className="text-xs font-semibold text-amber-900 dark:text-amber-200 mt-0.5">
                  Niche diye gaye items ka stock khatam hone wala hai:
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 text-xs font-black shrink-0">
              {lowStockParts.length} {lowStockParts.length === 1 ? 'Item' : 'Items'}
            </span>
          </div>

          {/* Simple Item Cards */}
          <div className="space-y-3">
            {lowStockParts.map((p) => (
              <div
                key={p._id || p.productId}
                className="p-4 bg-white dark:bg-[#172033] rounded-xl border border-amber-200 dark:border-[#263449] border-l-4 border-l-amber-500 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                    {p.name}
                  </h3>
                  <p className="text-xs font-bold text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500 inline-block animate-ping" />
                    Yeh stock khatam hone wala hai
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/inventory?status=LOW_STOCK')}
                  icon={ArrowRight}
                  className="self-start sm:self-center shrink-0"
                >
                  Restock Karein
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* HEALTHY STOCK STATE */
        <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-6 text-center space-y-3 shadow-2xs">
          <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-2xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
            Sabhi Items Stock Me Available Hain
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium max-w-md mx-auto">
            Abhi koi bhi spare part ya oil kam nahi pad raha hai. Jab bhi koi item kam hoga, yahan automatic alert aa jayega.
          </p>
        </div>
      )}
    </div>
  );
};
