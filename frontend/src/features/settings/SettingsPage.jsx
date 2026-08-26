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
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input, Textarea } from '../../components/ui/Input.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export const SettingsPage = () => {
  const { settings, updateSettings, loading: settingsLoading } = useSettings();
  const { showSuccess, showError } = useToast();

  const [activeTab, setActiveTab] = useState('ui'); // 'ui' | 'branding' | 'prefixes' | 'mechanics'

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
  }, [settings]);

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
      await updateSettings(formData);
      showSuccess('System Settings & Dynamic UI Configuration updated successfully!');
    } catch (err) {
      showError(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
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
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <PageHeader
        title="System Settings"
        subtitle="Header Badges, Portal Names, Garage Branding, Contact Details, Prefixes, aur Technicians List ko yahan se dynamically configure karein."
      />

      {/* Sleek Tabbed Selection Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 no-scrollbar">
        {tabs.map((tb) => {
          const Icon = tb.icon;
          const isActive = activeTab === tb.id;
          return (
            <button
              key={tb.id}
              type="button"
              onClick={() => setActiveTab(tb.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shrink-0 border ${
                isActive
                  ? 'bg-[#0284C7] text-white border-[#0284C7] shadow-md shadow-sky-900/20'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tb.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Tab Content Area (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* TAB 1: Dynamic Website Titles & Header Badges */}
          {activeTab === 'ui' && (
            <Card className="p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-sky-50 text-[#0284C7] border border-sky-200">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                      Dynamic UI Badges & Website Titles
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      Topbar header badges, sub-titles, aur brand logos ko live badlein.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Preset Badge Options */}
              <div className="bg-sky-50/70 p-3.5 rounded-2xl border border-sky-200 space-y-2">
                <span className="text-[11px] font-extrabold text-[#0C4A6E] uppercase tracking-wider block">
                  Quick 1-Click Header Badge Presets:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {['ADMIN', 'ADMIN PORTAL', 'WORKSHOP PORTAL', 'GARAGE ADMIN', 'SYSTEM PORTAL'].map((txt) => (
                    <button
                      key={txt}
                      type="button"
                      onClick={() => applyPresetBadge(txt)}
                      className="px-3 py-1 rounded-full text-xs font-extrabold bg-white hover:bg-[#0284C7] text-slate-700 hover:text-white border border-slate-200 hover:border-[#0284C7] transition-all shadow-2xs"
                    >
                      + "{txt}"
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
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

              <Textarea
                label="Invoice Print Footer Note"
                placeholder="e.g. Thank you for choosing National Auto Garage! Safe Riding."
                value={formData.invoiceFooterNote}
                onChange={(e) => handleChange('invoiceFooterNote', e.target.value)}
                rows={2}
                helpText="Printed bills ke sabse niche yahi message print hoga."
              />
            </Card>
          )}

          {/* TAB 2: Garage Branding & Contact Details */}
          {activeTab === 'branding' && (
            <Card className="p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    Garage Branding & Information
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Official bills, invoices, aur reports me use hone wali garage details.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

              <Textarea
                label="Garage Shop Address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                rows={2}
              />

              <Input
                label="GSTIN / Business Registration Number (Optional)"
                value={formData.gstNumber}
                onChange={(e) => handleChange('gstNumber', e.target.value)}
                placeholder="e.g. 24AAAAA0000A1Z5"
              />
            </Card>
          )}

          {/* TAB 3: System ID Prefixes & Formats */}
          {activeTab === 'prefixes' && (
            <Card className="p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    System ID Prefixes & Currency
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Sequential IDs ke dynamic prefixes aur formatting controls.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
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
            </Card>
          )}

          {/* TAB 4: Technicians / Mechanics Register */}
          {activeTab === 'mechanics' && (
            <Card className="p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                      Technicians & Mechanics Directory
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      Service Job Cards me mechanic assignment ke liye active staff.
                    </p>
                  </div>
                </div>
              </div>

              {/* Add New Technician */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-900 uppercase">
                  + Add New Mechanic / Technician:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
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
                      className="w-full h-full justify-center text-xs font-bold bg-purple-600 hover:bg-purple-700"
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                  </div>
                </div>
              </div>

              {/* Mechanics List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase">
                  Active Technicians List ({mechanicsList.length}):
                </span>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  {mechanicsList.map((m) => (
                    <div key={m.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 font-black text-xs flex items-center justify-center">
                          {m.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">{m.name}</div>
                          <span className="text-[10px] text-slate-500 font-medium">{m.role}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMechanic(m.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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

          {/* Bottom Save Bar */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Changes reflect website-wide instantly upon saving.
            </span>

            <Button
              type="submit"
              disabled={saving}
              className="px-6 text-xs font-black bg-[#0284C7] hover:bg-[#0369A1] shadow-md shadow-sky-900/20"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving Changes...' : 'Save Settings'}
            </Button>
          </div>
        </div>

        {/* Right Live Preview Card (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-5 border-2 border-sky-100 bg-gradient-to-br from-white to-sky-50/50 shadow-xs space-y-4 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-sky-100">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#0284C7]" />
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Live UI Mockup
                </span>
              </div>
              <span className="text-[10px] font-extrabold bg-sky-100 text-[#0284C7] px-2.5 py-0.5 rounded-full uppercase">
                Real-Time
              </span>
            </div>

            {/* Topbar Preview Widget */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase">
                Topbar Header Badge Preview:
              </span>
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-2xs">
                <span className="text-xs font-semibold text-slate-500">
                  {formData.topbarContextText || 'Workshop System'}
                </span>
                <span className="text-xs bg-sky-50 text-[#0284C7] font-black px-3 py-1 rounded-full border border-sky-200 uppercase tracking-wider">
                  {formData.portalBadgeText || 'ADMIN PORTAL'}
                </span>
              </div>
            </div>

            {/* Sidebar Logo Preview Widget */}
            <div className="space-y-1.5 pt-2 border-t border-sky-100">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase">
                Sidebar Brand Logo Preview:
              </span>
              <div className="p-3 bg-[#0F172A] text-white rounded-xl flex items-center gap-3 shadow-md">
                <div className="w-8 h-8 rounded-lg bg-[#0284C7] font-black text-sm flex items-center justify-center">
                  {formData.brandNameMain ? formData.brandNameMain.charAt(0).toUpperCase() : 'N'}
                </div>
                <div>
                  <div className="text-xs font-black uppercase text-white leading-tight">
                    {formData.brandNameMain || 'National Auto'}
                  </div>
                  <span className="text-[10px] font-bold text-sky-400 uppercase">
                    {formData.brandNameSub || 'Garage Portal'}
                  </span>
                </div>
              </div>
            </div>

            {/* Garage Name Preview */}
            <div className="space-y-1.5 pt-2 border-t border-sky-100 text-xs">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase block">
                Garage Name Preview:
              </span>
              <div className="font-extrabold text-slate-900 bg-white p-2.5 rounded-xl border border-slate-200">
                {formData.garageName || 'National Auto Garage'}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-sky-50 text-[#0C4A6E] text-xs font-medium space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <ShieldCheck className="w-4 h-4 text-[#0284C7]" />
                Zero Code Editing Needed
              </div>
              <p className="text-[11px] leading-relaxed">
                Aap yahan jo bhi badalenge, poori website me bina code edit kiye naya naam live show hone lagega!
              </p>
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
};
