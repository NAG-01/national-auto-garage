import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Building2,
  Tag,
  FileText,
  Save,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Globe,
  UserCheck,
  Plus,
  Trash2,
  Wrench,
  HelpCircle,
  Sparkle,
  KeyRound,
  Lock,
  User,
  Mail,
  Send,
  ShieldAlert,
  Unlock,
  Check,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input, Textarea } from '../../components/ui/Input.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import api from '../../api/client.js';

export const SettingsPage = () => {
  const { settings, updateSettings, loading: settingsLoading } = useSettings();
  const { user } = useAuth();
  const toast = useToast();
  const showSuccess = toast.showSuccess || toast.success || console.log;
  const showError = toast.showError || toast.error || console.error;

  const [activeTab, setActiveTab] = useState('ui'); // 'ui' | 'branding' | 'prefixes' | 'mechanics' | 'username' | 'password'

  const [formData, setFormData] = useState({
    // Section 1: Dynamic UI Labels & Badges
    portalBadgeText: '',
    topbarContextText: '',
    brandNameMain: '',
    brandNameSub: '',
    invoiceFooterNote: '',

    // Section 2: Garage Branding & Information
    garageName: '',
    tagline: '',
    phone: '',
    alternatePhone: '',
    email: '',
    address: '',
    gstNumber: '',

    // Section 3: Prefixes & Formats
    currencySymbol: '₹',
    invoicePrefix: 'INV',
    jobIdPrefix: 'NAG',
    duesPrefix: 'DUE',
    expensePrefix: 'EXP',
  });

  // Password Change 2-Step Gate State
  const [passStep, setPassStep] = useState(1); // 1: Verify Current Pass, 2: Enter New Pass
  const [currentPass, setCurrentPass] = useState('');
  const [verifyingPass, setVerifyingPass] = useState(false);
  const [passVerified, setPassVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPass, setSavingPass] = useState(false);

  // Email / Username Change State & OTP Modal State
  const [newEmail, setNewEmail] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [generatedOtpHint, setGeneratedOtpHint] = useState('');
  const [inputOtp, setInputOtp] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const [mechanicsList, setMechanicsList] = useState([
    { id: 1, name: 'Imran Pathan', role: 'Head Technician', phone: '+91 98765 00001' },
    { id: 2, name: 'Naim Pathan', role: 'Senior Mechanic', phone: '+91 98765 00002' },
  ]);
  const [newMechName, setNewMechName] = useState('');
  const [newMechRole, setNewMechRole] = useState('Mechanic');

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        portalBadgeText: settings.portalBadgeText || 'ADMIN PORTAL',
        topbarContextText: settings.topbarContextText || 'Workshop System',
        brandNameMain: settings.brandNameMain || 'National Auto',
        brandNameSub: settings.brandNameSub || 'Garage Portal',
        invoiceFooterNote: settings.invoiceFooterNote || 'Thank you for choosing National Auto Garage! Safe Riding.',

        garageName: settings.garageName || 'National Auto Garage',
        tagline: settings.tagline || 'Two-Wheeler Service & Repair Specialists',
        phone: settings.phone || '+91 98765 43210',
        alternatePhone: settings.alternatePhone || '',
        email: settings.email || 'contact@nationalautogarage.com',
        address: settings.address || 'Shop No. 4, Garage Hub, Main Road, City',
        gstNumber: settings.gstNumber || '',

        currencySymbol: settings.currencySymbol || '₹',
        invoicePrefix: settings.invoicePrefix || 'INV',
        jobIdPrefix: settings.jobIdPrefix || 'NAG',
        duesPrefix: settings.duesPrefix || 'DUE',
        expensePrefix: settings.expensePrefix || 'EXP',
      });
    }
    if (user?.email) {
      setNewEmail(user.email);
    }
  }, [settings, user]);

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleAddMechanic = (e) => {
    e.preventDefault();
    if (!newMechName.trim()) return;
    setMechanicsList([
      ...mechanicsList,
      { id: Date.now(), name: newMechName.trim(), role: newMechRole, phone: '' },
    ]);
    setNewMechName('');
    showSuccess(`Added technician '${newMechName.trim()}'`);
  };

  const handleRemoveMechanic = (id) => {
    setMechanicsList(mechanicsList.filter((m) => m.id !== id));
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

  // STEP 1: Verify Current Password Gate
  const handleVerifyCurrentPassword = async (e) => {
    e.preventDefault();
    if (!currentPass) {
      showError('Please enter your current password.');
      return;
    }
    setVerifyingPass(true);
    try {
      const res = await api.post('/auth/verify-password', { currentPassword: currentPass });
      const payload = res.data || res;
      if (payload) {
        setPassVerified(true);
        setPassStep(2);
        showSuccess('Current password verified! Step 2 unlocked. Enter your new password below.');
      }
    } catch (err) {
      showError(err.message || 'Current password is incorrect.');
      setPassVerified(false);
    } finally {
      setVerifyingPass(false);
    }
  };

  // STEP 2: Save New Password after Gate
  const handleSaveNewPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      showError('New password must be at least 4 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showError('New password and Confirm password do not match.');
      return;
    }

    setSavingPass(true);
    try {
      const res = await api.put('/auth/update-password', { newPassword });
      const payload = res.data || res;
      if (payload && payload.token) {
        localStorage.setItem('nag_token', payload.token);
        localStorage.setItem('nag_user', JSON.stringify(payload.user));
      }
      showSuccess('Admin password updated successfully!');
      // Reset gate
      setCurrentPass('');
      setNewPassword('');
      setConfirmPassword('');
      setPassVerified(false);
      setPassStep(1);
    } catch (err) {
      showError(err.message || 'Failed to update password');
    } finally {
      setSavingPass(false);
    }
  };

  // EMAIL OTP FLOW 1: Request 6-Digit Code
  const handleRequestEmailOtp = async (e) => {
    e.preventDefault();
    if (!newEmail || !newEmail.trim()) {
      showError('Please enter a valid Email address.');
      return;
    }
    setSendingOtp(true);
    try {
      const res = await api.post('/auth/request-email-otp', { newEmail: newEmail.trim() });
      const payload = res.data || res;
      if (payload && payload.otp) {
        setGeneratedOtpHint(payload.otp);
        setOtpModalOpen(true);
        showSuccess(`Confirmation OTP sent to ${newEmail.trim()}! Please check your email.`);
      }
    } catch (err) {
      showError(err.message || 'Failed to send OTP code');
    } finally {
      setSendingOtp(false);
    }
  };

  // EMAIL OTP FLOW 2: Verify Code and Update Username/Email
  const handleVerifyEmailOtp = async (e) => {
    e.preventDefault();
    if (!inputOtp || inputOtp.trim().length !== 6) {
      showError('Please enter the full 6-digit OTP code.');
      return;
    }

    setVerifyingOtp(true);
    try {
      const res = await api.post('/auth/verify-email-otp', {
        otpCode: inputOtp.trim(),
        newEmail: newEmail.trim(),
      });
      const payload = res.data || res;
      if (payload && payload.token) {
        localStorage.setItem('nag_token', payload.token);
        localStorage.setItem('nag_user', JSON.stringify(payload.user));
      }

      showSuccess(`Email & Username successfully changed to '${newEmail.trim()}'!`);
      setOtpModalOpen(false);
      setInputOtp('');
    } catch (err) {
      showError(err.message || 'OTP Verification failed');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const applyPresetBadge = (badgeText) => {
    setFormData((prev) => ({ ...prev, portalBadgeText: badgeText }));
    showSuccess(`Applied preset header badge: '${badgeText}'`);
  };

  const tabs = [
    { id: 'ui', label: '1. Dynamic UI Badges & Titles', icon: Tag },
    { id: 'branding', label: '2. Garage Branding & Address', icon: Building2 },
    { id: 'prefixes', label: '3. System ID Prefixes', icon: Sliders },
    { id: 'mechanics', label: '4. Technicians Directory', icon: UserCheck },
    { id: 'username', label: '5. Change Admin Email / Username', icon: Mail },
    { id: 'password', label: '6. Change Password (2-Step Gate)', icon: KeyRound },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      <PageHeader
        title="System Settings"
        subtitle="Header Badges, Garage Branding, Prefixes, Email Username OTP Verification, aur 2-Step Security Password Gate."
      />

      {/* Sleek Tab Selection Pills */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-2 overflow-x-auto no-scrollbar">
        {tabs.map((tb) => {
          const Icon = tb.icon;
          const isActive = activeTab === tb.id;
          return (
            <button
              key={tb.id}
              type="button"
              onClick={() => setActiveTab(tb.id)}
              className={`px-4 py-3 rounded-xl text-xs font-black transition-all flex items-center gap-2.5 shrink-0 ${
                isActive
                  ? 'bg-[#0284C7] text-white shadow-md shadow-sky-900/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-bold'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tb.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Tab Content Area (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* TAB 1: Dynamic Website Titles & Header Badges */}
          {activeTab === 'ui' && (
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
          )}

          {/* TAB 2: Garage Branding & Contact Details */}
          {activeTab === 'branding' && (
            <form onSubmit={handleSubmit}>
              <Card className="p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 bg-white">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 shrink-0">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 tracking-tight">
                      Garage Branding & Information
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Official bills, invoices, aur reports me use hone wali garage details.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input
                      label="Garage Name"
                      value={formData.garageName}
                      onChange={(e) => handleChange('garageName', e.target.value)}
                    />
                    <Input
                      label="Business Tagline"
                      value={formData.tagline}
                      onChange={(e) => handleChange('tagline', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
                    <Input
                      label="Primary Phone"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                    />
                    <Input
                      label="Alternate Phone"
                      value={formData.alternatePhone}
                      onChange={(e) => handleChange('alternatePhone', e.target.value)}
                    />
                    <Input
                      label="Official Email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <Textarea
                      label="Garage Shop Address"
                      value={formData.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <Input
                      label="GSTIN / Business Registration Number (Optional)"
                      value={formData.gstNumber}
                      onChange={(e) => handleChange('gstNumber', e.target.value)}
                      placeholder="e.g. 24AAAAA0000A1Z5"
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
          )}

          {/* TAB 3: System ID Prefixes & Formats */}
          {activeTab === 'prefixes' && (
            <form onSubmit={handleSubmit}>
              <Card className="p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 bg-white">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 shrink-0">
                    <Sliders className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 tracking-tight">
                      System ID Prefixes & Currency
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Sequential IDs ke dynamic prefixes aur formatting controls.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input
                      label="Invoice ID Prefix"
                      value={formData.invoicePrefix}
                      onChange={(e) => handleChange('invoicePrefix', e.target.value)}
                      helpText="Example: INV ➔ INV-2026-0001"
                    />
                    <Input
                      label="Job Card Prefix"
                      value={formData.jobIdPrefix}
                      onChange={(e) => handleChange('jobIdPrefix', e.target.value)}
                      helpText="Example: NAG ➔ NAG-2026-0001"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
                    <Input
                      label="Customer Dues Prefix"
                      value={formData.duesPrefix}
                      onChange={(e) => handleChange('duesPrefix', e.target.value)}
                      helpText="Example: DUE ➔ DUE-0001"
                    />
                    <Input
                      label="Expense Log Prefix"
                      value={formData.expensePrefix}
                      onChange={(e) => handleChange('expensePrefix', e.target.value)}
                      helpText="Example: EXP ➔ EXP-2026-0001"
                    />
                    <Input
                      label="Currency Symbol"
                      value={formData.currencySymbol}
                      onChange={(e) => handleChange('currencySymbol', e.target.value)}
                      helpText="Default: ₹"
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
          )}

          {/* TAB 4: Technicians / Mechanics Register */}
          {activeTab === 'mechanics' && (
            <Card className="p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 bg-white">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200 shrink-0">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 tracking-tight">
                    Technicians & Mechanics Directory
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Service Job Cards me mechanic assignment ke liye active staff.
                  </p>
                </div>
              </div>

              {/* Add New Technician Form */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                  + Add New Mechanic / Technician:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-6">
                    <Input
                      placeholder="Mechanic Full Name (e.g. Rahul Sharma)"
                      value={newMechName}
                      onChange={(e) => setNewMechName(e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <Input
                      placeholder="Role (e.g. Senior Mechanic)"
                      value={newMechRole}
                      onChange={(e) => setNewMechRole(e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Button
                      type="button"
                      onClick={handleAddMechanic}
                      className="w-full h-full justify-center text-xs font-black bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                  </div>
                </div>
              </div>

              {/* Active Staff List */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-extrabold text-[#0C4A6E] uppercase tracking-wider block">
                  Active Technicians List ({mechanicsList.length}):
                </span>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  {mechanicsList.map((m) => (
                    <div key={m.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3.5">
                        <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 font-black text-sm flex items-center justify-center border border-purple-200">
                          {m.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-extrabold text-slate-900">{m.name}</div>
                          <span className="text-[11px] text-slate-500 font-medium">{m.role}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMechanic(m.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
                        title="Remove Technician"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* DEDICATED TAB 5: Change Admin Email / Username with OTP Confirmation */}
          {activeTab === 'username' && (
            <form onSubmit={handleRequestEmailOtp}>
              <Card className="p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 bg-white">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="p-3 rounded-2xl bg-sky-50 text-[#0284C7] border border-sky-200 shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 tracking-tight">
                      Change Admin Email & Username (Email OTP Verification)
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Apna Naya Email address enter karein. Email par OTP jayega aur verification ke baad change ho jayega.
                    </p>
                  </div>
                </div>

                <div className="bg-sky-50/80 p-4 rounded-2xl border border-sky-200 text-sky-950 text-xs font-medium space-y-1">
                  <div className="font-extrabold flex items-center gap-1.5 text-sky-900">
                    <ShieldCheck className="w-4 h-4 text-[#0284C7]" /> Email Confirmation Security
                  </div>
                  <p className="text-[11px] leading-relaxed text-sky-800">
                    Security ke liye, Naya Email/Username tabhi active hoga jab aap <strong>6-digit Email OTP Code</strong> verify karenge.
                  </p>
                </div>

                <div className="space-y-6 max-w-lg">
                  <Input
                    type="email"
                    label="New Admin Email Address / Username *"
                    placeholder="e.g. naim@nag.com or admin@nationalautogarage.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    icon={Mail}
                    required
                    helpText="Apna Naya Official Admin Email Address enter karein."
                  />
                </div>

                <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-200">
                  <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                    A 6-digit confirmation code will be sent to your email.
                  </span>
                  <Button
                    type="submit"
                    disabled={sendingOtp}
                    className="px-8 py-3 text-xs font-black bg-[#0284C7] hover:bg-[#0369A1] text-white shadow-lg shadow-sky-900/20"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {sendingOtp ? 'Sending OTP Code...' : 'Send Email Confirmation OTP'}
                  </Button>
                </div>
              </Card>
            </form>
          )}

          {/* DEDICATED TAB 6: Change Password (2-Step Verification Gate) */}
          {activeTab === 'password' && (
            <Card className="p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 bg-white">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="p-3 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 shrink-0">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 tracking-tight">
                    Change Admin Password (2-Step Verification Gate)
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Step 1: Current password verify karein ➔ Step 2: Naya password enter karke change karein.
                  </p>
                </div>
              </div>

              {/* Progress Indicator Pills */}
              <div className="flex items-center gap-4">
                <div className={`flex-1 p-3 rounded-xl border text-xs font-extrabold flex items-center justify-between transition-all ${
                  passStep === 1
                    ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                }`}>
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-white text-slate-900 text-[10px] font-black flex items-center justify-center border">
                      1
                    </span>
                    Step 1: Verify Current Password
                  </span>
                  {passVerified ? <Check className="w-4 h-4 text-emerald-600" /> : <Lock className="w-4 h-4 text-amber-600" />}
                </div>

                <div className={`flex-1 p-3 rounded-xl border text-xs font-extrabold flex items-center justify-between transition-all ${
                  passStep === 2
                    ? 'bg-sky-50 border-sky-300 text-sky-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                }`}>
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-white text-slate-900 text-[10px] font-black flex items-center justify-center border">
                      2
                    </span>
                    Step 2: Set New Password
                  </span>
                  {passStep === 2 ? <Unlock className="w-4 h-4 text-[#0284C7]" /> : <Lock className="w-4 h-4" />}
                </div>
              </div>

              {/* STEP 1 FORM: VERIFY CURRENT PASSWORD */}
              {passStep === 1 && (
                <form onSubmit={handleVerifyCurrentPassword} className="space-y-6 pt-2">
                  <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200/90 text-amber-950 text-xs font-medium space-y-1">
                    <div className="font-extrabold flex items-center gap-1.5 text-amber-900">
                      <ShieldAlert className="w-4 h-4 text-amber-600" /> Current Password Verification Needed
                    </div>
                    <p className="text-[11px] leading-relaxed text-amber-800">
                      Naya password page unlock karne ke liye pehle apna <strong>Current Password</strong> (e.g. <code>admin123</code>) enter karein.
                    </p>
                  </div>

                  <div className="max-w-md">
                    <Input
                      type="password"
                      label="Current Admin Password *"
                      placeholder="Enter current password (e.g. admin123)"
                      value={currentPass}
                      onChange={(e) => setCurrentPass(e.target.value)}
                      required
                      icon={Lock}
                      helpText="Pehle isko verify karein."
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={verifyingPass}
                      className="px-8 py-3 text-xs font-black bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-900/20"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      {verifyingPass ? 'Verifying Password...' : 'Verify Password to Unlock Step 2'}
                    </Button>
                  </div>
                </form>
              )}

              {/* STEP 2 FORM: ENTER NEW PASSWORD (ONLY SHOWS AFTER STEP 1 VERIFICATION) */}
              {passStep === 2 && (
                <form onSubmit={handleSaveNewPassword} className="space-y-6 pt-2">
                  <div className="bg-emerald-50/90 p-4 rounded-2xl border border-emerald-200 text-emerald-950 text-xs font-medium space-y-1">
                    <div className="font-extrabold flex items-center gap-1.5 text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Current Password Verified Successfully!
                    </div>
                    <p className="text-[11px] leading-relaxed text-emerald-800">
                      Step 2 Unlocked! Ab apna Naya Password enter karke Save karein.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input
                      type="password"
                      label="New Admin Password *"
                      placeholder="Enter new password (min 4 chars)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      icon={Lock}
                    />
                    <Input
                      type="password"
                      label="Confirm New Password *"
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      icon={Lock}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-200">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setPassStep(1);
                        setPassVerified(false);
                      }}
                      className="text-xs font-bold"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Cancel / Reset
                    </Button>

                    <Button
                      type="submit"
                      disabled={savingPass}
                      className="px-8 py-3 text-xs font-black bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-900/20"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {savingPass ? 'Saving New Password...' : 'Save New Admin Password'}
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          )}
        </div>

        {/* Right Live Preview Card (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 border-2 border-sky-100 bg-gradient-to-br from-white via-sky-50/30 to-blue-50/40 shadow-xs space-y-6 sticky top-24">
            <div className="flex items-center justify-between pb-4 border-b border-sky-100">
              <div className="flex items-center gap-2.5">
                <Globe className="w-5 h-5 text-[#0284C7]" />
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Live Security Preview
                </span>
              </div>
              <span className="text-[10px] font-extrabold bg-sky-100 text-[#0284C7] px-2.5 py-1 rounded-full uppercase border border-sky-200">
                Real-Time
              </span>
            </div>

            {/* Current Admin Account Email Widget */}
            <div className="space-y-2 text-xs">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Active Admin Username / Email:
              </span>
              <div className="font-extrabold text-slate-900 bg-white p-3 rounded-2xl border border-slate-200 text-xs flex items-center gap-2">
                <User className="w-4 h-4 text-[#0284C7]" />
                <span className="truncate">{user?.email || user?.username || 'admin@nag.com'}</span>
              </div>
            </div>

            {/* Password Security Status Widget */}
            <div className="space-y-2 text-xs pt-4 border-t border-sky-100">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Password Gate Status:
              </span>
              <div className={`p-3 rounded-2xl border text-xs font-extrabold flex items-center gap-2 ${
                passVerified
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                {passVerified ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Lock className="w-4 h-4 text-amber-600" />}
                <span>{passVerified ? 'Step 2 Unlocked (New Pass Active)' : 'Step 1 Locked (Current Pass Required)'}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-sky-50 text-[#0C4A6E] text-xs font-medium space-y-1.5 border border-sky-200">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <ShieldCheck className="w-4.5 h-4.5 text-[#0284C7]" />
                Double Verification Security
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600">
                Password change aur Email/Username change dono ko 2 alag pages me divide kiya gaya hai complete safety ke liye.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* 6-DIGIT EMAIL OTP VERIFICATION MODAL */}
      {otpModalOpen && (
        <Modal
          isOpen={otpModalOpen}
          onClose={() => setOtpModalOpen(false)}
          title="Verify 6-Digit Email Confirmation Code"
          size="md"
        >
          <form onSubmit={handleVerifyEmailOtp} className="space-y-5 py-2">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-[#0284C7] font-black text-xl flex items-center justify-center mx-auto border border-sky-200">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-black text-slate-900">
                Enter 6-Digit OTP Code
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                We sent a 6-digit verification code to <strong>{newEmail}</strong>
              </p>
            </div>

            {/* Instant Demo OTP Hint Badge */}
            {generatedOtpHint && (
              <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white p-4 rounded-2xl text-center space-y-2 shadow-md">
                <span className="text-[10px] font-black uppercase tracking-widest text-sky-100 block">
                  SECURITY EMAIL CONFIRMATION CODE
                </span>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl font-black tracking-widest font-mono select-all">
                    {generatedOtpHint}
                  </span>
                  <button
                    type="button"
                    onClick={() => setInputOtp(generatedOtpHint)}
                    className="px-3 py-1 rounded-xl text-xs font-extrabold bg-white text-[#0284C7] hover:bg-sky-50 active:scale-95 transition-all shadow-xs"
                  >
                    ⚡ Auto-Fill
                  </button>
                </div>
                <span className="text-[10px] text-sky-100 block font-semibold">
                  (Type or click Auto-Fill to confirm email change)
                </span>
              </div>
            )}

            <div className="max-w-xs mx-auto">
              <Input
                type="text"
                placeholder="Enter 6-Digit OTP"
                value={inputOtp}
                onChange={(e) => setInputOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                required
                className="text-center text-lg font-mono font-black tracking-widest"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOtpModalOpen(false)}
                className="text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={verifyingOtp}
                className="px-6 py-2.5 text-xs font-black bg-[#0284C7] hover:bg-[#0369A1] text-white shadow-md shadow-sky-900/20"
              >
                {verifyingOtp ? 'Verifying OTP...' : 'Confirm & Update Email'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
