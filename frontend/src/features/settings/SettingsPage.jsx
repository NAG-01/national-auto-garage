import React, { useState, useEffect } from 'react';
import {
  Tag,
  Save,
  ShieldCheck,
  Sparkle,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input, Textarea } from '../../components/ui/Input.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export const SettingsPage = () => {
  const { settings, updateSettings } = useSettings();
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

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
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

  const applyPresetBadge = (badgeText) => {
    setFormData((prev) => ({ ...prev, portalBadgeText: badgeText }));
    showSuccess(`Applied preset header badge: '${badgeText}'`);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      <PageHeader
        title="System Settings"
        subtitle="Header Badges, Website Titles, Invoice Notes, and UI Customizations."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Content Area (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
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

        {/* Sidebar Info Card (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 border border-slate-200 bg-slate-900 text-white space-y-4 shadow-xl">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">System Settings Info</h3>
                <p className="text-[11px] text-slate-400">Workshop UI Configuration</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Header Badge:</span>
                <span className="font-bold text-sky-400">{formData.portalBadgeText || 'ADMIN PORTAL'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Context Text:</span>
                <span className="font-bold text-white">{formData.topbarContextText || 'Workshop System'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Brand Title:</span>
                <span className="font-bold text-emerald-400">{formData.brandNameMain || 'National Auto'}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
