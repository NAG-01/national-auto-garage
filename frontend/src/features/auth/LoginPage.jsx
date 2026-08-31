import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  ExternalLink,
  Globe,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  const { login, user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  // If already logged in, redirect straight to dashboard
  useEffect(() => {
    if (user && (user.id || user.username)) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const validateForm = () => {
    const newErrors = {};
    if (!identifier.trim()) {
      newErrors.identifier = 'Username ya email enter karein.';
    }
    if (!password) {
      newErrors.password = 'Password enter karein.';
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
      const msg = err.message || 'Galat username ya password. Dobara check karein.';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      
      {/* Luxury Ambient Glassmorphism Luminous Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[34rem] bg-[#0284C7]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[26rem] h-[26rem] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 left-10 w-[24rem] h-[24rem] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle Dot Matrix Background */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="w-full max-w-md relative z-10">
        {/* VisionOS Luxury Glassmorphic Card Only */}
        <div className="bg-slate-950/80 backdrop-blur-2xl p-7 sm:p-9 rounded-3xl border border-slate-800/90 shadow-2xl shadow-slate-950/80">
          
          <div className="mb-6 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-[10px] font-black tracking-wider uppercase mb-2.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Secure Admin Authentication
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center justify-center sm:justify-start gap-1.5">
              Welcome Back <span>👋</span>
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Enter admin username & password to access workshop operations.
            </p>
          </div>

          {formError && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-xs text-rose-300 font-bold animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4" noValidate autoComplete="off">
            <div>
              <label className="block text-[11px] font-black text-slate-300 uppercase tracking-wider mb-1.5">
                Admin Username or Email <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
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
                  placeholder="Enter username or email"
                  autoComplete="off"
                  className={`w-full pl-10 pr-4 py-3 bg-slate-900/90 border rounded-2xl text-sm font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:bg-slate-900 focus:ring-2 transition-all ${
                    errors.identifier
                      ? 'border-rose-500/80 focus:ring-rose-500/30'
                      : 'border-slate-800 focus:border-[#0284C7] focus:ring-[#0284C7]/30 hover:border-slate-700'
                  }`}
                />
              </div>
              {errors.identifier && (
                <p className="mt-1 text-[11px] font-semibold text-rose-400">{errors.identifier}</p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-300 uppercase tracking-wider mb-1.5">
                Password <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
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
                  placeholder="Enter password"
                  autoComplete="new-password"
                  className={`w-full pl-10 pr-11 py-3 bg-slate-900/90 border rounded-2xl text-sm font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:bg-slate-900 focus:ring-2 transition-all ${
                    errors.password
                      ? 'border-rose-500/80 focus:ring-rose-500/30'
                      : 'border-slate-800 focus:border-[#0284C7] focus:ring-[#0284C7]/30 hover:border-slate-700'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white focus:outline-none transition-colors cursor-pointer"
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
              className="w-full mt-3 py-3.5 px-4 bg-gradient-to-r from-[#0284C7] via-sky-500 to-blue-600 hover:from-[#0369A1] hover:to-blue-700 active:scale-[0.98] text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-xl shadow-sky-500/25 border border-sky-400/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Workshop</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Card Footer Divider & Developer Attribution */}
          <div className="mt-8 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-medium">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-sky-400 hover:text-sky-300 font-bold hover:underline cursor-pointer flex items-center gap-1 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Back to Public Website</span>
            </button>
            <p className="text-center sm:text-right">
              <a
                href="https://www.linkedin.com/in/maazpathan07"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-slate-400 hover:text-sky-400 font-bold transition-colors"
              >
                <span>Developed by Maaz Pathan</span>
                <ExternalLink className="w-3 h-3 inline" />
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
