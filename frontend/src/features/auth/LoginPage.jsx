import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Wrench,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export const LoginPage = () => {
  const [identifier, setIdentifier] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const validateForm = () => {
    const newErrors = {};
    if (!identifier.trim()) {
      newErrors.identifier = 'Please enter your username or email.';
    }
    if (!password) {
      newErrors.password = 'Please enter your password.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e?.preventDefault();
    setFormError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const userObj = await login(identifier, password);
      if (!userObj) {
        throw new Error('Login failed. Please check credentials.');
      }
      toast.success('Admin authenticated successfully');
      const target = from && from !== '/login' ? from : '/dashboard';
      navigate(target, { replace: true });
    } catch (err) {
      const msg = err.message || 'Invalid username or password.';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillAdminCredentials = () => {
    setIdentifier('admin');
    setPassword('admin123');
    setErrors({});
    setFormError('');
    toast.info('Admin credentials auto-filled');
  };

  return (
    <div className="min-h-screen bg-[#0B1120] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#4F46E5]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        {/* Brand Badge */}
        <div className="inline-flex p-3.5 rounded-2xl bg-[#4F46E5] text-white shadow-xl shadow-indigo-600/30 ring-4 ring-indigo-500/20 mb-4 transform hover:scale-105 transition-transform duration-200">
          <Wrench className="w-8 h-8" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
          National Auto Garage
        </h1>
        <p className="mt-1 text-xs text-indigo-300 font-extrabold tracking-widest uppercase flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Enterprise Garage Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#172033]/95 backdrop-blur-xl p-8 rounded-3xl border border-[#263449] shadow-2xl shadow-slate-950/80">
          {formError && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-950/60 border border-rose-900/60 flex items-start gap-3 text-xs text-rose-300 font-semibold animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Username or Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (errors.identifier) setErrors((prev) => ({ ...prev, identifier: '' }));
                  }}
                  placeholder="e.g. admin"
                  autoComplete="username"
                  className={`w-full pl-10 pr-4 py-2.5 bg-[#111827] border rounded-xl text-sm font-medium text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                    errors.identifier
                      ? 'border-rose-500 focus:ring-rose-500/20'
                      : 'border-[#334155] focus:border-[#6366F1]'
                  }`}
                />
              </div>
              {errors.identifier && (
                <p className="mt-1 text-[11px] font-semibold text-rose-400">{errors.identifier}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`w-full pl-10 pr-10 py-2.5 bg-[#111827] border rounded-xl text-sm font-medium text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                    errors.password
                      ? 'border-rose-500 focus:ring-rose-500/20'
                      : 'border-[#334155] focus:border-[#6366F1]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-[11px] font-semibold text-rose-400">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-[#4F46E5] hover:bg-[#4338CA] active:scale-[0.99] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In as Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Admin Helper Card */}
          <div className="mt-6 pt-5 border-t border-[#263449]">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                Single Admin Credentials
              </span>
            </div>
            <div className="p-3 bg-[#111827] border border-[#263449] rounded-2xl flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-slate-100 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  System Administrator
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  admin / admin123
                </div>
              </div>
              <button
                type="button"
                onClick={fillAdminCredentials}
                className="px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-indigo-300 bg-indigo-950/80 hover:bg-indigo-900/80 rounded-xl border border-indigo-800 transition-colors shadow-2xs"
              >
                Auto-Fill
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-6 text-center text-xs text-slate-400 font-medium">
          National Auto Garage • Powered by Antigravity ERP
        </p>
      </div>
    </div>
  );
};
