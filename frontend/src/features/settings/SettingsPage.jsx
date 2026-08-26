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
  const { settings, updateSettings, loading: settingsLoading } = useSettings();
  const { user, login } = useAuth();
  const toast = useToast();
  const showSuccess = toast.showSuccess || toast.success || console.log;
  const showError = toast.showError || toast.error || console.error;

  const [activeTab, setActiveTab] = useState('ui'); // 'ui' | 'branding' | 'prefixes' | 'mechanics' | 'security'

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

  // Admin Credentials Change Form State
  const [credForm, setCredForm] = useState({
    currentPassword: '',
    newUsername: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [savingCreds, setSavingCreds] = useState(false);

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
    if (user?.username) {
      setCredForm((prev) => ({ ...prev, newUsername: user.username }));
    }
  }, [settings, user]);

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleCredChange = (field, val) => {
    setCredForm((prev) => ({ ...prev, [field]: val }));
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

  const handleUpdateCredentials = async (e) => {
    e.preventDefault();
    if (!credForm.currentPassword) {
      showError('Current Password is required to update admin credentials.');
      return;
    }
    if (credForm.newPassword && credForm.newPassword !== credForm.confirmPassword) {
      showError('New password and Confirm password do not match.');
      return;
    }

    setSavingCreds(true);
    try {
      const res = await api.put('/auth/update-credentials', {
        currentPassword: credForm.currentPassword,
        newUsername: credForm.newUsername,
        newPassword: credForm.newPassword,
      });

      const payload = res.data || res;
      if (payload && payload.token) {
        localStorage.setItem('nag_token', payload.token);
        localStorage.setItem('nag_user', JSON.stringify(payload.user));
      }

      setCredForm((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));

      showSuccess('Admin Username & Password updated successfully!');
    } catch (err) {
      showError(err.message || 'Failed to update credentials');
    } finally {
      setSavingCreds(false);
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
    { id: 'security', label: '5. Admin Username & Password', icon: KeyRound },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      <PageHeader
        title="System Settings"
        subtitle="Header Badges, Portal Names, Garage Branding, Contact Details, Prefixes, aur Admin Login Credentials ko yahan se dynamically configure karein."
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
              className={`px-5 py-3 rounded-xl text-xs font-black transition-all flex items-center gap-2.5 shrink-0 ${
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

                {/* Form Input Rows with Generous Gaps */}
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

          {/* TAB 5: Admin Username & Password Change Form */}
          {activeTab === 'security' && (
            <form onSubmit={handleUpdateCredentials}>
              <Card className="p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 bg-white">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="p-3 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 shrink-0">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 tracking-tight">
                      Admin Username & Password Management
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Admin login credentials ko direct yahan se change karein.
                    </p>
                  </div>
                </div>

                <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200/80 text-rose-900 text-xs font-medium space-y-1">
                  <div className="font-extrabold flex items-center gap-1.5 text-rose-900">
                    <Lock className="w-4 h-4 text-rose-600" /> Security Verification Required
                  </div>
                  <p className="text-[11px] leading-relaxed text-rose-800">
                    Username ya Password badalne ke liye pehle apna <strong>Current Password</strong> enter karein.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="max-w-md">
                    <Input
                      type="password"
                      label="Current Admin Password *"
                      placeholder="Enter your current password"
                      value={credForm.currentPassword}
                      onChange={(e) => handleCredChange('currentPassword', e.target.value)}
                      required
                      helpText="Required to authorize changes to admin credentials."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                    <Input
                      type="text"
                      label="New Admin Username"
                      placeholder="e.g. admin or naim_pathan"
                      value={credForm.newUsername}
                      onChange={(e) => handleCredChange('newUsername', e.target.value)}
                      icon={User}
                      helpText="Admin login username badalne ke liye enter karein."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                    <Input
                      type="password"
                      label="New Admin Password"
                      placeholder="Enter new password (min 4 chars)"
                      value={credForm.newPassword}
                      onChange={(e) => handleCredChange('newPassword', e.target.value)}
                      icon={Lock}
                    />
                    <Input
                      type="password"
                      label="Confirm New Password"
                      placeholder="Re-enter new password"
                      value={credForm.confirmPassword}
                      onChange={(e) => handleCredChange('confirmPassword', e.target.value)}
                      icon={Lock}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-200">
                  <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                    Updated credentials will take effect immediately.
                  </span>
                  <Button
                    type="submit"
                    disabled={savingCreds}
                    className="px-8 py-3 text-xs font-black bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-900/20"
                  >
                    <KeyRound className="w-4 h-4 mr-2" />
                    {savingCreds ? 'Updating Credentials...' : 'Update Admin Credentials'}
                  </Button>
                </div>
              </Card>
            </form>
          )}
        </div>

        {/* Right Live Preview Card (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 border-2 border-sky-100 bg-gradient-to-br from-white via-sky-50/30 to-blue-50/40 shadow-xs space-y-6 sticky top-24">
            <div className="flex items-center justify-between pb-4 border-b border-sky-100">
              <div className="flex items-center gap-2.5">
                <Globe className="w-5 h-5 text-[#0284C7]" />
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Live UI Mockup
                </span>
              </div>
              <span className="text-[10px] font-extrabold bg-sky-100 text-[#0284C7] px-2.5 py-1 rounded-full uppercase border border-sky-200">
                Real-Time
              </span>
            </div>

            {/* Topbar Preview Widget */}
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Topbar Header Badge Preview:
              </span>
              <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-2xs">
                <span className="text-xs font-semibold text-slate-500">
                  {formData.topbarContextText || 'Workshop System'}
                </span>
                <span className="text-xs bg-sky-50 text-[#0284C7] font-black px-3.5 py-1.5 rounded-full border border-sky-200 uppercase tracking-wider shadow-2xs">
                  {formData.portalBadgeText || 'ADMIN PORTAL'}
                </span>
              </div>
            </div>

            {/* Sidebar Logo Preview Widget */}
            <div className="space-y-2 pt-4 border-t border-sky-100">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Sidebar Brand Logo Preview:
              </span>
              <div className="p-4 bg-[#0F172A] text-white rounded-2xl flex items-center gap-3.5 shadow-md">
                <div className="w-9 h-9 rounded-xl bg-[#0284C7] font-black text-base flex items-center justify-center shadow-xs shrink-0">
                  {formData.brandNameMain ? formData.brandNameMain.charAt(0).toUpperCase() : 'N'}
                </div>
                <div>
                  <div className="text-xs font-black uppercase text-white leading-tight tracking-tight">
                    {formData.brandNameMain || 'National Auto'}
                  </div>
                  <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest mt-0.5 block">
                    {formData.brandNameSub || 'Garage Portal'}
                  </span>
                </div>
              </div>
            </div>

            {/* Current Admin Account Username Widget */}
            <div className="space-y-2 pt-4 border-t border-sky-100 text-xs">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Active Admin Username:
              </span>
              <div className="font-extrabold text-slate-900 bg-white p-3 rounded-2xl border border-slate-200 text-xs flex items-center gap-2">
                <User className="w-4 h-4 text-[#0284C7]" />
                <span>@{user?.username || 'admin'}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-sky-50 text-[#0C4A6E] text-xs font-medium space-y-1.5 border border-sky-200">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <ShieldCheck className="w-4.5 h-4.5 text-[#0284C7]" />
                Zero Code Editing Needed
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600">
                Aap Username ya Password yahan se change karenge to wo turant database me encrypted save ho jayega aur naye credentials se login ho sakega!
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
