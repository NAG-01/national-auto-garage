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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#0284C7]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        {/* Brand Badge */}
        <div className="inline-flex p-3.5 rounded-2xl bg-[#0284C7] text-white shadow-xl shadow-sky-500/20 ring-4 ring-sky-100 mb-4 transform hover:scale-105 transition-transform duration-200">
          <Wrench className="w-8 h-8" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
          National Auto Garage
        </h1>
        <p className="mt-1 text-xs text-[#0284C7] font-extrabold tracking-widest uppercase flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Enterprise Garage Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
          {formError && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-700 font-semibold animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
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
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 transition-all ${
                    errors.identifier
                      ? 'border-rose-400 focus:ring-rose-400/20'
                      : 'border-slate-300 focus:border-[#0284C7] focus:ring-[#0284C7]/20'
                  }`}
                />
              </div>
              {errors.identifier && (
                <p className="mt-1 text-[11px] font-semibold text-rose-600">{errors.identifier}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
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
                  className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 transition-all ${
                    errors.password
                      ? 'border-rose-400 focus:ring-rose-400/20'
                      : 'border-slate-300 focus:border-[#0284C7] focus:ring-[#0284C7]/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-[11px] font-semibold text-rose-600">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-[#0284C7] hover:bg-[#0369A1] active:scale-[0.99] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
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
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-700">
                <ShieldCheck className="w-4 h-4 text-[#0284C7]" />
                Single Admin Credentials
              </span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-slate-900 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-[#F59E0B]" />
                  System Administrator
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  admin / admin123
                </div>
              </div>
              <button
                type="button"
                onClick={fillAdminCredentials}
                className="px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#0284C7] bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors shadow-2xs"
              >
                Auto-Fill
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-6 text-center text-xs text-slate-500 font-medium">
          National Auto Garage • Powered by Antigravity ERP
        </p>
      </div>
    </div>
  );
};
