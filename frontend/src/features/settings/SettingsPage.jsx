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
      await updateSettings(formData);
      showSuccess('System Settings & Dynamic UI Labels updated successfully!');
    } catch (err) {
      showError(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    setFormData({
      portalBadgeText: 'ADMIN',
      topbarContextText: 'Workshop System',
      brandNameMain: 'National Auto',
      brandNameSub: 'Garage Portal',
      invoiceFooterNote: 'Thank you for choosing National Auto Garage! Safe Riding.',
      garageName: 'National Auto Garage',
      tagline: 'Two-Wheeler Service & Repair Specialists',
      phone: '+91 98765 43210',
      alternatePhone: '',
      email: 'contact@nationalautogarage.com',
      address: 'Shop No. 4, Garage Hub, Main Road, City',
      gstNumber: '',
      currencySymbol: '₹',
      invoicePrefix: 'INV',
      jobIdPrefix: 'NAG',
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <PageHeader
        title="System Settings"
        subtitle="Header Badges, Portal Names, Garage Branding, Contact Details, aur System Prefixes ko bina code badle yahan se dynamic edit karein."
      />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Settings Form (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Dynamic Website Titles & Header Badges */}
          <Card className="p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Tag className="w-5 h-5 text-[#0284C7]" />
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  1. Dynamic UI Badges & Website Titles
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Header badges, topbar context, aur sidebar titles ko yahan se live badlein.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Topbar Portal Badge Text"
                placeholder="e.g. ADMIN or ADMIN PORTAL"
                value={formData.portalBadgeText}
                onChange={(e) => handleChange('portalBadgeText', e.target.value)}
                helpText="Default: ADMIN PORTAL. Topbar header me yahi badge text live dikhega."
              />
              <Input
                label="Topbar Context Text"
                placeholder="e.g. Workshop System"
                value={formData.topbarContextText}
                onChange={(e) => handleChange('topbarContextText', e.target.value)}
                helpText="Default: Workshop System."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
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
              helpText="Printed bills ke footer me yahi message print hoga."
            />
          </Card>

          {/* Card 2: Garage Branding & Contact Details */}
          <Card className="p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Building2 className="w-5 h-5 text-[#0284C7]" />
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  2. Garage Branding & Contact Details
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Official invoices aur reports me use hone wali garage details.
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

          {/* Card 3: System Prefixes & Formats */}
          <Card className="p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Sliders className="w-5 h-5 text-[#0284C7]" />
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  3. System ID Prefixes & Currency
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Invoices, Job Cards, aur Currency Formatting.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Invoice ID Prefix"
                value={formData.invoicePrefix}
                onChange={(e) => handleChange('invoicePrefix', e.target.value)}
                helpText="e.g. INV ➔ INV-2026-0001"
              />
              <Input
                label="Job Card Prefix"
                value={formData.jobIdPrefix}
                onChange={(e) => handleChange('jobIdPrefix', e.target.value)}
                helpText="e.g. NAG ➔ NAG-2026-0001"
              />
              <Input
                label="Currency Symbol"
                value={formData.currencySymbol}
                onChange={(e) => handleChange('currencySymbol', e.target.value)}
                helpText="Default: ₹"
              />
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleResetToDefaults}
              className="text-xs font-bold"
            >
              <RotateCcw className="w-4 h-4 mr-2" /> Preset "ADMIN" Title
            </Button>

            <Button
              type="submit"
              disabled={saving}
              className="px-6 text-xs font-black bg-[#0284C7] hover:bg-[#0369A1]"
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
                  Live UI Preview
                </span>
              </div>
              <span className="text-[10px] font-extrabold bg-sky-100 text-[#0284C7] px-2.5 py-0.5 rounded-full uppercase">
                Instant Update
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
                Garage Name:
              </span>
              <div className="font-extrabold text-slate-900 bg-white p-2.5 rounded-xl border border-slate-200">
                {formData.garageName || 'National Auto Garage'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-sky-50 text-[#0C4A6E] text-xs font-medium space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <ShieldCheck className="w-4 h-4 text-[#0284C7]" />
                Zero Code Editing Required
              </div>
              <p className="text-[11px]">
                Aap jo bhi changes karenge wo turant MongoDB database me save ho jayenge aur puri website me bina code edit kiye badal jayenge!
              </p>
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
};
