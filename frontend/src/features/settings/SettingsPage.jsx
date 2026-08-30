import React, { useState, useEffect } from 'react';
import {
  Tag,
  Save,
  Sparkle,
  Shield,
  KeyRound,
  User,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input, Textarea } from '../../components/ui/Input.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import api from '../../api/client.js';

export const SettingsPage = () => {
  const { settings, updateSettings } = useSettings();
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const showSuccess = toast.showSuccess || toast.success || console.log;
  const showError = toast.showError || toast.error || console.error;

  const [formData, setFormData] = useState({
    portalBadgeText: '',
    topbarContextText: '',
    brandNameMain: '',
    brandNameSub: '',
    invoiceFooterNote: '',
  });

  const [saving, setSaving] = useState(false);

  // Security Credentials State
  const [authData, setAuthData] = useState({
    newUsername: user?.username || 'admin',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [savingAuth, setSavingAuth] = useState(false);
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');

  useEffect(() => {
    if (settings) {
      setFormData({
        portalBadgeText: settings.portalBadgeText || 'ADMIN PORTAL',
        topbarContextText: settings.topbarContextText || 'Workshop System',
        brandNameMain: settings.brandNameMain || 'National Auto',
        brandNameSub: settings.brandNameSub || 'Garage Portal',
        invoiceFooterNote: settings.invoiceFooterNote || 'Thank you for choosing National Auto Garage! Safe Riding.',
      });
    }
  }, [settings]);

  useEffect(() => {
    if (user?.username) {
      setAuthData((prev) => ({ ...prev, newUsername: user.username }));
    }
  }, [user]);

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleAuthChange = (field, val) => {
    setAuthData((prev) => ({ ...prev, [field]: val }));
    setAuthSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateSettings(formData);
      if (updated) {
        setFormData((prev) => ({ ...prev, ...updated }));
      }
      showSuccess('System Settings & Dynamic UI Configuration updated successfully!');
    } catch (err) {
      showError(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthSuccessMsg('');

    if (!authData.newUsername.trim()) {
      showError('Admin username is required.');
      return;
    }

    if (authData.newPassword) {
      if (authData.newPassword.length < 6) {
        showError('New password must be at least 6 characters long.');
        return;
      }
      if (authData.newPassword !== authData.confirmPassword) {
        showError('New Password and Confirm Password do not match.');
        return;
      }
      if (!authData.currentPassword) {
        showError('Please enter your Current Password to authorize this change.');
        return;
      }
    }

    setSavingAuth(true);
    try {
      const res = await api.post('/auth/update-credentials', {
        newUsername: authData.newUsername.trim(),
        currentPassword: authData.currentPassword ? authData.currentPassword.trim() : undefined,
        newPassword: authData.newPassword ? authData.newPassword.trim() : undefined,
      });

      const updatedUser = res.user || res.data?.user;
      if (updatedUser && updateUser) {
        updateUser(updatedUser);
      }

      const successText = `Admin username updated to '@${authData.newUsername.trim()}'${
        authData.newPassword ? ' with new password' : ''
      }!`;
      setAuthSuccessMsg(successText);
      showSuccess(successText);

      setAuthData((prev) => ({
        ...prev,
        newUsername: authData.newUsername.trim(),
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (err) {
      showError(err.message || 'Failed to update admin credentials.');
    } finally {
      setSavingAuth(false);
    }
  };

  const applyPresetBadge = (badgeText) => {
    setFormData((prev) => ({ ...prev, portalBadgeText: badgeText }));
    showSuccess(`Applied preset header badge: '${badgeText}'`);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      <PageHeader
        title="System Settings"
        subtitle="Admin Login Credentials, Header Badges, Website Titles, and UI Customizations."
      />

      {/* 1. ADMIN USERNAME & PASSWORD SECURITY CARD */}
      <form onSubmit={handleAuthSubmit}>
        <Card className="p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 bg-white">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                Admin Credentials & Security <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">Admin Only</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Garage portal ka login Username aur Password yahan se badlein.
              </p>
            </div>
          </div>

          {authSuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs text-emerald-800 font-bold">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{authSuccessMsg}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Admin Username <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={authData.newUsername}
                    onChange={(e) => handleAuthChange('newUsername', e.target.value)}
                    placeholder="e.g. admin or custom username"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0284C7] focus:border-[#0284C7] transition-all"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500 font-medium">Login screen par yahi username daalna hoga.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Current Password (To Authorize)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={authData.currentPassword}
                    onChange={(e) => handleAuthChange('currentPassword', e.target.value)}
                    placeholder="Current password enter karein"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0284C7] focus:border-[#0284C7] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-slate-500 font-medium">Default: `admin123`</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  New Password (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={authData.newPassword}
                    onChange={(e) => handleAuthChange('newPassword', e.target.value)}
                    placeholder="Naya password (min 6 characters)"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0284C7] focus:border-[#0284C7] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={authData.confirmPassword}
                    onChange={(e) => handleAuthChange('confirmPassword', e.target.value)}
                    placeholder="Naya password dobara confirm karein"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0284C7] focus:border-[#0284C7] transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-200">
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Update hone ke baad agle login par naye username/password se login karein.
            </span>
            <Button
              type="submit"
              disabled={savingAuth}
              className="px-8 py-3 text-xs font-black bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-900/20"
            >
              <KeyRound className="w-4 h-4 mr-2" />
              {savingAuth ? 'Updating Credentials...' : 'Save Admin Credentials'}
            </Button>
          </div>
        </Card>
      </form>

      {/* 2. DYNAMIC UI BADGES & WEBSITE TITLES CARD */}
      <form onSubmit={handleSubmit}>
        <Card className="p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 bg-white">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-3 rounded-2xl bg-sky-50 text-[#0284C7] border border-sky-200 shrink-0">
              <Tag className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Dynamic UI Badges & Website Titles
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Topbar header badges, sub-titles, aur brand logos ko live badlein.
              </p>
            </div>
          </div>

          {/* Quick Preset Badge Options */}
          <div className="bg-gradient-to-r from-sky-50 to-blue-50/50 p-4 rounded-2xl border border-sky-200/80 space-y-3">
            <span className="text-xs font-extrabold text-[#0C4A6E] uppercase tracking-wider block flex items-center gap-1.5">
              <Sparkle className="w-4 h-4 text-[#0284C7]" /> Quick 1-Click Header Badge Presets:
            </span>
            <div className="flex items-center gap-2.5 flex-wrap">
              {['ADMIN', 'ADMIN PORTAL', 'WORKSHOP PORTAL', 'GARAGE ADMIN', 'SYSTEM PORTAL'].map((txt) => (
                <button
                  key={txt}
                  type="button"
                  onClick={() => applyPresetBadge(txt)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-white hover:bg-[#0284C7] text-slate-700 hover:text-white border border-slate-200/90 hover:border-[#0284C7] transition-all shadow-2xs active:scale-95"
                >
                  + "{txt}"
                </button>
              ))}
            </div>
          </div>

          {/* Form Input Rows */}
          <div className="space-y-6 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input
                label="Topbar Header Badge Text"
                placeholder="e.g. ADMIN or ADMIN PORTAL"
                value={formData.portalBadgeText}
                onChange={(e) => handleChange('portalBadgeText', e.target.value)}
                helpText="Yahi text Topbar me blue badge ke andar dikhega."
              />
              <Input
                label="Topbar Context Text"
                placeholder="e.g. Workshop System"
                value={formData.topbarContextText}
                onChange={(e) => handleChange('topbarContextText', e.target.value)}
                helpText="Default: Workshop System."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <Input
                label="Sidebar Brand Main Name"
                placeholder="e.g. National Auto"
                value={formData.brandNameMain}
                onChange={(e) => handleChange('brandNameMain', e.target.value)}
              />
              <Input
                label="Sidebar Brand Sub-title"
                placeholder="e.g. Garage Portal"
                value={formData.brandNameSub}
                onChange={(e) => handleChange('brandNameSub', e.target.value)}
              />
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Textarea
                label="Invoice Print Footer Note"
                placeholder="e.g. Thank you for choosing National Auto Garage! Safe Riding."
                value={formData.invoiceFooterNote}
                onChange={(e) => handleChange('invoiceFooterNote', e.target.value)}
                rows={3}
                helpText="Printed bills ke sabse niche yahi message print hoga."
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-200">
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Changes reflect website-wide instantly upon saving.
            </span>
            <Button
              type="submit"
              disabled={saving}
              className="px-8 py-3 text-xs font-black bg-[#0284C7] hover:bg-[#0369A1] shadow-lg shadow-sky-900/20"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving Changes...' : 'Save All Settings'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};
