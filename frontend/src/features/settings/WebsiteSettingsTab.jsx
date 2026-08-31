import React, { useState, useEffect } from 'react';
import {
  Globe,
  Save,
  RotateCcw,
  ExternalLink,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Phone,
  MessageSquare,
  MapPin,
  Clock,
  Wrench,
  Award,
  ShieldCheck,
  Zap,
  CheckCircle,
  Eye,
} from 'lucide-react';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input, Textarea } from '../../components/ui/Input.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import api from '../../api/client.js';
import garageLogoDefault from '../../assets/garage_logo.jpg';

export const WebsiteSettingsTab = () => {
  const toast = useToast();
  const showSuccess = toast.showSuccess || toast.success || console.log;
  const showError = toast.showError || toast.error || console.error;

  const [activeSubTab, setActiveSubTab] = useState('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  const [formData, setFormData] = useState({
    garageName: 'National Auto Garage',
    tagline: 'Two-Wheeler Service & Repair Specialists',
    logoUrl: '',
    headlineLine1: 'COMPLETE BIKE SERVICE &',
    headlineLine2: 'ENGINE REPAIR',
    heroSubtitle:
      'Expert 2-wheeler mechanics Imran & Naim Pathan at Mosali Chowkdi. Fast general service, engine overhaul, wiring & genuine spare parts.',
    mechanic1Name: 'Imran Pathan',
    mechanic1Phone: '9624844188',
    mechanic2Name: 'Naim Pathan',
    mechanic2Phone: '8128144350',
    whatsappPhone: '9624844188',
    whatsappInquiryText: 'Hello National Auto Garage, I want to inquire about bike service.',
    stats: [
      { label: 'Years Experience', value: '20+', subtext: 'Serving Mosali since 2004' },
      { label: 'Bikes Serviced', value: '1,000+', subtext: 'Motorcycles & Scooters' },
      { label: 'Customer Rating', value: '4.9 ★', subtext: 'Trusted by locals' },
      { label: 'Honest Pricing', value: '100%', subtext: 'No hidden charges' },
    ],
    services: [],
    advantages: [],
    garageAddressName: 'National Auto Garage',
    addressLine1: 'Near White House Petrol Pump, Mosali Chowkdi',
    addressLine2: 'Mosali, Mangrol, Surat - 394421',
    googleMapsUrl: 'https://maps.app.goo.gl/skxxbgWa1k7Zrzef9',
    openingHoursMonSat: '9:00 AM - 9:00 PM',
    openingHoursSun: '9:00 AM - 2:00 PM',
    footerAboutText:
      "National Auto Garage is Mosali's premier two-wheeler workshop providing transparent, reliable bike servicing and repairs by Imran & Naim Pathan.",
  });

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await api.get('/website-config');
      const data = res.data || res.config || res;
      if (data) {
        setFormData((prev) => ({
          ...prev,
          ...data,
          stats: Array.isArray(data.stats) && data.stats.length > 0 ? data.stats : prev.stats,
          services: Array.isArray(data.services) && data.services.length > 0 ? data.services : prev.services,
          advantages: Array.isArray(data.advantages) && data.advantages.length > 0 ? data.advantages : prev.advantages,
        }));
      }
    } catch (err) {
      console.warn('Failed to load website config, using defaults:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleStatChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.stats];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, stats: updated };
    });
  };

  const handleServiceChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.services];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, services: updated };
    });
  };

  const handleAdvantageChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.advantages];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, advantages: updated };
    });
  };

  // High-performance image compressor: Resizes large images to max 800x800 and compresses with quality 0.82
  // Reduces 2MB-5MB photos down to ~40KB - 80KB (95%+ storage saved, blazing fast database sync!)
  const handleImageUpload = (file, callback) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showError('Please select an image smaller than 10MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
        callback(compressedDataUrl);
        showSuccess('Image compressed & uploaded successfully (Storage optimized)!');
      };
      img.onerror = () => {
        showError('Could not process this image file.');
      };
      img.src = readerEvent.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await api.put('/website-config', formData);
      showSuccess('Visiting Website CMS Settings updated successfully! Changes are live.');
    } catch (err) {
      showError(err.message || 'Failed to update website configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    const confirmReset = window.confirm(
      'Are you sure you want to reset all visiting website text, stats, and cards to default settings?'
    );
    if (!confirmReset) return;

    setResetting(true);
    try {
      const res = await api.post('/website-config/reset');
      const data = res.data || res.config || res;
      if (data) {
        setFormData(data);
      }
      showSuccess('Website configuration reset to original factory defaults!');
    } catch (err) {
      showError(err.message || 'Failed to reset settings');
    } finally {
      setResetting(false);
    }
  };

  const SUB_TABS = [
    { id: 'hero', label: 'Hero & Headlines', icon: Sparkles },
    { id: 'stats', label: 'Stats Badges', icon: Award },
    { id: 'services', label: 'Services (6 Cards)', icon: Wrench },
    { id: 'why-us', label: 'Why Us Pillars', icon: ShieldCheck },
    { id: 'contact', label: 'Address & Timings', icon: MapPin },
    { id: 'brand', label: 'Logo & Identity', icon: ImageIcon },
  ];

  if (loading) {
    return (
      <Card className="p-12 text-center text-slate-500 bg-white border border-slate-200">
        <div className="animate-spin w-8 h-8 border-3 border-[#0284C7] border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-xs font-bold uppercase tracking-wider">Loading Website CMS...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-sky-500 via-[#0284C7] to-blue-700 text-white shadow-lg shadow-sky-500/15 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-md shrink-0">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-base font-black uppercase tracking-tight">Visiting Website Live CMS</h2>
            <p className="text-xs text-sky-100 font-medium">
              Yahan se aap visiting website ke saare texts, numbers, images, aur cards direct live update kar sakte hain.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white text-white hover:text-slate-900 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md transition-all shadow-sm active:scale-95"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Live Site</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {SUB_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#0284C7] text-white shadow-md shadow-sky-500/25 scale-[1.02]'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 shadow-2xs'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* ========================================================================= */}
        {/* 1. HERO SECTION SUBTAB */}
        {/* ========================================================================= */}
        {activeSubTab === 'hero' && (
          <Card className="p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 bg-white">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#0284C7]" /> Hero Section Banner & Headlines
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Main top headline, subtitle description, aur direct call contact buttons.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Headline Line 1 (Dark Text)"
                  value={formData.headlineLine1}
                  onChange={(e) => handleChange('headlineLine1', e.target.value)}
                  placeholder="e.g. COMPLETE BIKE SERVICE &"
                />
                <Input
                  label="Headline Line 2 (Blue Gradient Text)"
                  value={formData.headlineLine2}
                  onChange={(e) => handleChange('headlineLine2', e.target.value)}
                  placeholder="e.g. ENGINE REPAIR"
                />
              </div>

              <Textarea
                label="Hero Subtitle / Description"
                value={formData.heroSubtitle}
                onChange={(e) => handleChange('heroSubtitle', e.target.value)}
                rows={3}
                placeholder="Mechanics introduction and garage location..."
              />

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                  Top CTA Call Buttons (Hero Call Section)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3 p-3 rounded-xl bg-white border border-slate-200">
                    <Input
                      label="Mechanic 1 Name"
                      value={formData.mechanic1Name}
                      onChange={(e) => handleChange('mechanic1Name', e.target.value)}
                      placeholder="e.g. Imran Pathan"
                    />
                    <Input
                      label="Mechanic 1 Phone"
                      value={formData.mechanic1Phone}
                      onChange={(e) => handleChange('mechanic1Phone', e.target.value)}
                      placeholder="e.g. 9624844188"
                    />
                  </div>

                  <div className="space-y-3 p-3 rounded-xl bg-white border border-slate-200">
                    <Input
                      label="Mechanic 2 Name"
                      value={formData.mechanic2Name}
                      onChange={(e) => handleChange('mechanic2Name', e.target.value)}
                      placeholder="e.g. Naim Pathan"
                    />
                    <Input
                      label="Mechanic 2 Phone"
                      value={formData.mechanic2Phone}
                      onChange={(e) => handleChange('mechanic2Phone', e.target.value)}
                      placeholder="e.g. 8128144350"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* ========================================================================= */}
        {/* 2. STATS BADGES SUBTAB */}
        {/* ========================================================================= */}
        {activeSubTab === 'stats' && (
          <Card className="p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 bg-white">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" /> Hero Stats Badges (4 Metric Cards)
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Hero section ke niche aane wale 4 trust metric cards (Experience, Bikes Serviced, Ratings, Pricing).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {formData.stats.map((st, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-[#0284C7]">Stat Card #{idx + 1}</span>
                    <span className="text-xs font-mono font-black text-slate-900">{st.value || '--'}</span>
                  </div>
                  <Input
                    label="Value / Metric Number"
                    value={st.value}
                    onChange={(e) => handleStatChange(idx, 'value', e.target.value)}
                    placeholder="e.g. 20+, 1,000+, 4.9 ★, 100%"
                  />
                  <Input
                    label="Card Title / Label"
                    value={st.label}
                    onChange={(e) => handleStatChange(idx, 'label', e.target.value)}
                    placeholder="e.g. Years of Experience"
                  />
                  <Input
                    label="Subtext Note (Optional)"
                    value={st.subtext || ''}
                    onChange={(e) => handleStatChange(idx, 'subtext', e.target.value)}
                    placeholder="e.g. Serving Mosali since 2004"
                  />
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ========================================================================= */}
        {/* 3. SERVICES SECTION SUBTAB (6 CARDS) */}
        {/* ========================================================================= */}
        {activeSubTab === 'services' && (
          <Card className="p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 bg-white">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Wrench className="w-5 h-5 text-[#0284C7]" /> Bike Services Manager (6 Cards)
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Har service card ka title, badge, description, image, aur active visibility set karein.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.services.map((srv, idx) => (
                <div key={srv.id || idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                    <span className="text-xs font-black uppercase text-[#0284C7]">Service #{idx + 1}</span>
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={srv.isActive !== false}
                        onChange={(e) => handleServiceChange(idx, 'isActive', e.target.checked)}
                        className="rounded text-[#0284C7] focus:ring-[#0284C7]"
                      />
                      <span>Active</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Service Title"
                      value={srv.title}
                      onChange={(e) => handleServiceChange(idx, 'title', e.target.value)}
                      placeholder="e.g. Full Bike Service"
                    />
                    <Input
                      label="Badge (Optional)"
                      value={srv.badge || ''}
                      onChange={(e) => handleServiceChange(idx, 'badge', e.target.value)}
                      placeholder="e.g. Popular / 100% Original"
                    />
                  </div>

                  <Textarea
                    label="Description"
                    value={srv.description}
                    onChange={(e) => handleServiceChange(idx, 'description', e.target.value)}
                    rows={2}
                    placeholder="Short description of service..."
                  />

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Custom 3D Card Image (Upload or URL)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        id={`service-img-${idx}`}
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) handleImageUpload(file, (dataUrl) => handleServiceChange(idx, 'bgImage', dataUrl));
                        }}
                      />
                      <label
                        htmlFor={`service-img-${idx}`}
                        className="px-3 py-2 rounded-xl bg-white border border-slate-300 hover:border-[#0284C7] text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95 shrink-0"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#0284C7]" />
                        <span>Upload Photo</span>
                      </label>
                      {srv.bgImage && (
                        <button
                          type="button"
                          onClick={() => handleServiceChange(idx, 'bgImage', '')}
                          className="text-[11px] text-rose-600 font-bold hover:underline"
                        >
                          Reset to 3D Graphic
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ========================================================================= */}
        {/* 4. WHY CHOOSE US SUBTAB (4 PILLARS) */}
        {/* ========================================================================= */}
        {activeSubTab === 'why-us' && (
          <Card className="p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 bg-white">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" /> Why Bike Owners Trust Us (4 Pillars)
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                4 key advantage cards (Experience, Original Spares, Fast Service, Honest Billing).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.advantages.map((adv, idx) => (
                <div key={adv.id || idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                    <span className="text-xs font-black uppercase text-emerald-700">Pillar #{idx + 1}</span>
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={adv.isActive !== false}
                        onChange={(e) => handleAdvantageChange(idx, 'isActive', e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Active</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Title"
                      value={adv.title}
                      onChange={(e) => handleAdvantageChange(idx, 'title', e.target.value)}
                      placeholder="e.g. 20+ Years Experience"
                    />
                    <Input
                      label="Badge"
                      value={adv.badge || ''}
                      onChange={(e) => handleAdvantageChange(idx, 'badge', e.target.value)}
                      placeholder="e.g. Master Mechanics"
                    />
                  </div>

                  <Textarea
                    label="Description"
                    value={adv.description || adv.desc}
                    onChange={(e) => handleAdvantageChange(idx, 'description', e.target.value)}
                    rows={2}
                    placeholder="Advantage description..."
                  />

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Custom 3D Card Image
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        id={`why-img-${idx}`}
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) handleImageUpload(file, (dataUrl) => handleAdvantageChange(idx, 'bgImage', dataUrl));
                        }}
                      />
                      <label
                        htmlFor={`why-img-${idx}`}
                        className="px-3 py-2 rounded-xl bg-white border border-slate-300 hover:border-emerald-600 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95 shrink-0"
                      >
                        <Upload className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Upload Photo</span>
                      </label>
                      {adv.bgImage && (
                        <button
                          type="button"
                          onClick={() => handleAdvantageChange(idx, 'bgImage', '')}
                          className="text-[11px] text-rose-600 font-bold hover:underline"
                        >
                          Reset to 3D Graphic
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ========================================================================= */}
        {/* 5. LOCATION, CONTACTS & TIMINGS SUBTAB */}
        {/* ========================================================================= */}
        {activeSubTab === 'contact' && (
          <Card className="p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 bg-white">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose-600" /> Location, WhatsApp & Opening Hours
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Garage address, Google Maps link, WhatsApp inquiries, aur working hours.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-xs font-black uppercase text-slate-800 tracking-wider block flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-500" /> Workshop Address & Maps Link
                </span>
                <Input
                  label="Garage Display Name"
                  value={formData.garageAddressName || formData.garageName}
                  onChange={(e) => handleChange('garageAddressName', e.target.value)}
                  placeholder="e.g. National Auto Garage"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Address Line 1"
                    value={formData.addressLine1}
                    onChange={(e) => handleChange('addressLine1', e.target.value)}
                    placeholder="Near White House Petrol Pump, Mosali Chowkdi"
                  />
                  <Input
                    label="Address Line 2 (City & Pincode)"
                    value={formData.addressLine2}
                    onChange={(e) => handleChange('addressLine2', e.target.value)}
                    placeholder="Mosali, Mangrol, Surat - 394421"
                  />
                </div>
                <Input
                  label="Google Maps Direct URL"
                  value={formData.googleMapsUrl}
                  onChange={(e) => handleChange('googleMapsUrl', e.target.value)}
                  placeholder="https://maps.app.goo.gl/..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="text-xs font-black uppercase text-slate-800 tracking-wider block flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-emerald-600" /> WhatsApp Direct Link
                  </span>
                  <Input
                    label="Official WhatsApp Mobile Number"
                    value={formData.whatsappPhone}
                    onChange={(e) => handleChange('whatsappPhone', e.target.value)}
                    placeholder="e.g. 9624844188"
                  />
                  <Textarea
                    label="Default WhatsApp Inquiry Message"
                    value={formData.whatsappInquiryText}
                    onChange={(e) => handleChange('whatsappInquiryText', e.target.value)}
                    rows={2}
                    placeholder="Hello National Auto Garage..."
                  />
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="text-xs font-black uppercase text-slate-800 tracking-wider block flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-600" /> Opening Hours
                  </span>
                  <Input
                    label="Monday - Saturday Timing"
                    value={formData.openingHoursMonSat}
                    onChange={(e) => handleChange('openingHoursMonSat', e.target.value)}
                    placeholder="e.g. 9:00 AM - 9:00 PM"
                  />
                  <Input
                    label="Sunday Timing"
                    value={formData.openingHoursSun}
                    onChange={(e) => handleChange('openingHoursSun', e.target.value)}
                    placeholder="e.g. 9:00 AM - 2:00 PM"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <Textarea
                  label="Footer About Garage Text"
                  value={formData.footerAboutText}
                  onChange={(e) => handleChange('footerAboutText', e.target.value)}
                  rows={2}
                  placeholder="Premier two-wheeler workshop at Mosali Chowkdi..."
                />
              </div>
            </div>
          </Card>
        )}

        {/* ========================================================================= */}
        {/* 6. LOGO & BRANDING SUBTAB */}
        {/* ========================================================================= */}
        {activeSubTab === 'brand' && (
          <Card className="p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 bg-white">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-purple-600" /> Garage Logo & Identity
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Garage brand name, tagline, aur official logo update karein.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Garage Brand Name"
                  value={formData.garageName}
                  onChange={(e) => handleChange('garageName', e.target.value)}
                  placeholder="National Auto Garage"
                />
                <Input
                  label="Tagline / Slogan"
                  value={formData.tagline}
                  onChange={(e) => handleChange('tagline', e.target.value)}
                  placeholder="Two-Wheeler Service & Repair Specialists"
                />
              </div>

              {/* Logo Upload Card */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center gap-6">
                <div className="relative shrink-0">
                  <img
                    src={formData.logoUrl || garageLogoDefault}
                    alt="Garage Logo Preview"
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover shadow-lg border-2 border-white ring-2 ring-[#0284C7]"
                  />
                  <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white" />
                </div>

                <div className="space-y-2 text-center sm:text-left flex-1">
                  <h4 className="text-sm font-black text-slate-900">Garage Official Logo</h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Upload a high-resolution square logo image (PNG/JPG, max 2MB).
                  </p>

                  <div className="flex items-center justify-center sm:justify-start gap-3 pt-1">
                    <input
                      type="file"
                      accept="image/*"
                      id="brand-logo-upload"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) handleImageUpload(file, (dataUrl) => handleChange('logoUrl', dataUrl));
                      }}
                    />
                    <label
                      htmlFor="brand-logo-upload"
                      className="px-4 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md shadow-sky-500/20 active:scale-95 transition-all"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload New Logo</span>
                    </label>

                    {formData.logoUrl && (
                      <button
                        type="button"
                        onClick={() => handleChange('logoUrl', '')}
                        className="text-xs text-rose-600 font-bold hover:underline"
                      >
                        Reset to Default Logo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Global Save Actions Footer Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleReset}
            disabled={resetting}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{resetting ? 'Resetting...' : 'Reset Factory Defaults'}</span>
          </button>

          <Button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3 text-xs font-black uppercase tracking-wider bg-[#0284C7] hover:bg-[#0369A1] text-white shadow-lg shadow-sky-500/25 cursor-pointer active:scale-98"
          >
            <Save className="w-4 h-4 mr-2" />
            <span>{saving ? 'Saving Live Changes...' : 'Save All Website Changes'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
