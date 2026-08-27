import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  LayoutDashboard,
  Package,
  Truck,
  ShoppingCart,
  Wrench,
  Flame,
  FileText,
  CreditCard,
  Receipt,
  Calculator,
  Tag,
  ArrowRight,
  HelpCircle,
  Search,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { SearchInput } from '../../components/ui/Input.jsx';

export const UserGuidePage = () => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');

  const modules = [
    {
      id: 'dashboard',
      title: 'Operational Dashboard',
      to: '/dashboard',
      icon: LayoutDashboard,
      badge: 'Live Overview',
      color: 'border-sky-200 bg-sky-50/50 text-[#0284C7]',
      summary: 'Garage revenue, active job cards, low-stock warnings, aur customer dues ka real-time overview dekhne ke liye.',
      steps: [
        'Dashboard open karte hi aapko 4 key metric cards dikhenge: Total Revenue, Active Jobs, Low Stock Items, aur Customer Dues.',
        'Garage Stock Alert Monitor Card par aane wale low-stock items ke aage "Restock Karein" dabakar direct inventory me restock kar sakte hain.',
        'Quick Operations Grid se 1-click me kisi bhi feature page par navigate karein.',
      ],
    },
    {
      id: 'inventory',
      title: 'Products & Inventory Management',
      to: '/inventory',
      icon: Package,
      badge: 'Stock & Parts',
      color: 'border-emerald-200 bg-emerald-50/50 text-emerald-600',
      summary: 'Spare parts, oils aur consumables ka catalogue, cost vs MRP selling price, aur stock quantity manage karne ke liye.',
      steps: [
        'Add New Item form me Spare Part Name, SKU/OEM Number, Category, Purchase Price, Selling Price, aur Initial Stock bharein.',
        'Minimum Stock Alert threshold set karein (e.g. 5) taaki stock kam hote hi warning alert mil jaye.',
        'Service Job Card complete hote hi spare parts ka stock automatically double-entry ledger se minus ho jata hai.',
        'Negative Stock Guard ke tehat stock 0 hone par sale strictly block hoti hai.',
      ],
    },
    {
      id: 'suppliers',
      title: 'Suppliers Directory & WhatsApp Orders',
      to: '/suppliers',
      icon: Truck,
      badge: 'Vendor Orders',
      color: 'border-amber-200 bg-amber-50/50 text-amber-600',
      summary: 'Spare part vendor directory manage karein aur purchase orders banakar direct WhatsApp par bhejain.',
      steps: [
        'Suppliers page (/suppliers) par vendor dukan ka naam, address, phone number, aur GSTIN add karein.',
        'Supplier Orders page (/supplier-orders) par "+ Create Order" dabakar spare parts ki list taiyar karein.',
        '"Send via WhatsApp" button dabate hi vendor ke phone par formatted purchase order list ka WhatsApp message Chala jayega.',
      ],
    },
    {
      id: 'full-service',
      title: 'Full Service Job Cards',
      to: '/jobs/full-service',
      icon: Wrench,
      badge: 'Bike Servicing',
      color: 'border-indigo-200 bg-indigo-50/50 text-indigo-600',
      summary: 'Customer bike servicing job cards, customer complaints, assigned mechanics, aur spare parts usage track karein.',
      steps: [
        '"+ New Service Job" dabakar Customer Name, Phone, Bike Model, Registration No. (e.g. GJ01AB1234), aur KM Reading bharein.',
        'Customer ki complaints aur required service work list add karein.',
        'Assigned technician mechanic select karein aur labour charges enter karein.',
        'Used Spare Parts add karein — parts select hote hi stock auto-deduct ho jayega aur estimated total calculate ho jayega.',
        'Job Status "READY_FOR_BILLING" karke customer invoice banayein.',
      ],
    },
    {
      id: 'engine-job',
      title: 'Engine Jobs & Heavy Repairs',
      to: '/jobs/engine-job',
      icon: Flame,
      badge: 'Engine Repair',
      color: 'border-rose-200 bg-rose-50/50 text-rose-600',
      summary: 'Engine overhaul, cylinder boring, head work, aur heavy repairing jobs ke dedicated job cards.',
      steps: [
        'Engine Job page (/jobs/engine-job) par engine overhaul job cards maintain karein.',
        'Heavy labour charges, lathe machine charges, aur replacement engine parts details log karein.',
      ],
    },
    {
      id: 'invoices',
      title: 'Bills & Invoicing',
      to: '/invoices',
      icon: FileText,
      badge: 'GST Invoices',
      color: 'border-cyan-200 bg-cyan-50/50 text-cyan-600',
      summary: 'Official customer GST/Non-GST invoices (`INV-2026-0001`) generate karein aur payments record karein.',
      steps: [
        'Completed Job Card se ya direct "+ Create Invoice" dabakar bill generate karein.',
        'Subtotal, Discount, Tax (GST), aur Customer Advance Payment adjust karein.',
        'Paid amount enter karte hi bill status UNPAID, PARTIALLY_PAID, ya PAID me auto-update hoga.',
        'Print button dabakar customer ko clean physical printed invoice dein.',
      ],
    },
    {
      id: 'outstanding',
      title: 'Customer Khata / Outstanding Register',
      to: '/outstanding',
      icon: CreditCard,
      badge: 'Khata Dues',
      color: 'border-purple-200 bg-purple-50/50 text-purple-600',
      summary: 'Grahakon ke baki baqaya khata dues (`DUE-0001`) aur partial payment settlements track karein.',
      steps: [
        'Customer Dues Register me customer name, mobile, bike model, aur baki pending amount record karein.',
        'Jab customer baki paise jama kare, tab "Record Payment" dabakar balance clear karein.',
      ],
    },
    {
      id: 'expenses',
      title: 'Operating Expenses (OPEX)',
      to: '/expenses',
      icon: Receipt,
      badge: 'Garage OPEX',
      color: 'border-orange-200 bg-orange-50/50 text-orange-600',
      summary: 'Daily garage expenses (Rent, Electricity, Tea, Tools, Salary) aur 3-Account Notebook Ledger math.',
      steps: [
        'Expense Title, Category, aur Amount enter karein.',
        'Paid From Account select karein: Garage Account, Imran Pathan Account, ya Naim Pathan Account.',
        '3-Account Notebook Summary widget me har account ka total kharcha alag-alag dikhega.',
      ],
    },
    {
      id: 'calculator',
      title: 'Live Settlement Calculator',
      to: '/calculator',
      icon: Calculator,
      badge: 'Equity Share',
      color: 'border-blue-200 bg-blue-50/50 text-blue-600',
      summary: 'Partner 50/50 equity profit distribution aur advance draws ka live calculation.',
      steps: [
        'Total Revenue aur Garage Expenses enter karte hi Net Profit live calculate ho jayega.',
        'Naim Pathan Advance Draw aur Imran Pathan Advance Draw enter karein.',
        'System Naim Pathan (50%) aur Imran Pathan (50%) ka Net Payout Share live calculate karke dikhayega.',
      ],
    },
    {
      id: 'keywords',
      title: 'Smart Keywords Master',
      to: '/keywords',
      icon: Tag,
      badge: 'Auto-Suggestions',
      color: 'border-teal-200 bg-teal-50/50 text-teal-600',
      summary: 'Global Master Terms list aur typo-tolerant recommendation engine manage karein.',
      steps: [
        'Master Keywords page par naye terms (e.g. Tyre, Brake Pad, Engine Oil) add, edit, ya delete karein.',
        'Poori website ke har input box me typing karte waqt smart recommendations automatic show hongi.',
        'Typo-Tolerant Engine spelling mistake karne par bhi sahi word suggest karega (e.g. `tayer` ➔ Tyre, `brek` ➔ Brake Pad).',
      ],
    },
  ];

  const filteredModules = modules.filter((m) => {
    const matchesSearch =
      !search ||
      m.title.toLowerCase().includes(search.trim().toLowerCase()) ||
      m.summary.toLowerCase().includes(search.trim().toLowerCase());
    const matchesTab = activeTab === 'ALL' || m.id === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <PageHeader
        title="User Guide & System Manual"
        subtitle="National Auto Garage website ke har ek feature, workflow, shortcuts, aur calculation ko samajhne ke liye complete official guide."
      />

      {/* Hero Quick Search & Overview Card */}
      <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0284C7]/30 border border-sky-400/40 text-sky-300 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" /> Official Help Center & Documentation
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            National Auto Garage Management System Ko Kaise Use Karein?
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            Is interactive user manual me sabhi 11 core modules ki step-by-step details aur direct clickable page links hain. Kisi bhi topic ko khojne ke liye niche search karein.
          </p>

          <div className="pt-2 max-w-md">
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
              placeholder="Search help topics (e.g. Job Card, Bill, Tyre, Expense)..."
              className="bg-white/10 text-white border-slate-700 placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>



      {/* Module Step-by-Step Documentation Cards */}
      <div className="space-y-6 pt-4">
        <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#0284C7]" /> Modules Step-by-Step Operating Instructions
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredModules.map((m) => {
            const Icon = m.icon;
            return (
              <Card key={m.id} className="p-5 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2.5 rounded-xl border ${m.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900 tracking-tight">
                          {m.title}
                        </h3>
                        <span className="text-xs font-medium text-slate-500">
                          Route: <code className="text-[#0284C7] font-bold">{m.to}</code>
                        </span>
                      </div>
                    </div>

                    <Link
                      to={m.to}
                      className="px-3 py-1.5 rounded-xl bg-sky-50 text-[#0284C7] hover:bg-[#0284C7] hover:text-white font-extrabold text-xs transition-all flex items-center gap-1 shrink-0 border border-sky-200"
                    >
                      Open Page <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {m.summary}
                  </p>

                  <div className="space-y-2 pt-2">
                    <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Operating Steps:
                    </h4>
                    <ul className="space-y-2">
                      {m.steps.map((st, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-800 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{st}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full uppercase border border-slate-200">
                    {m.badge}
                  </span>
                  <Link
                    to={m.to}
                    className="text-xs font-bold text-[#0284C7] hover:underline flex items-center gap-1"
                  >
                    Go to {m.title} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Global Shortcuts & Helpful Tips */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <ShieldCheck className="w-5 h-5 text-[#0284C7]" />
          <h2 className="text-base font-black text-slate-900 uppercase tracking-wider">
            Important Garage Staff Guidelines & Tips
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700 font-medium">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
            <div className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" /> Topbar Logo Redirect
            </div>
            <p>
              Kisi bhi page se Topbar me **`ADMIN PORTAL`** ya Sidebar logo (**`N NATIONAL AUTO GARAGE PORTAL`**) par click karke aap turant **Dashboard** par ja sakte hain.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
            <div className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-[#0284C7]" /> Smart Auto-Suggest
            </div>
            <p>
              Job Cards, Invoices, ya Search bars me typing karte waqt galat spelling par bhi smart recommendations aati hain (e.g. `tayer` ➔ **Tyre**, `brek` ➔ **Brake Pad**).
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
            <div className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-emerald-500" /> WhatsApp Vendor Orders
            </div>
            <p>
              Supplier Orders page se spare parts order banakar **"Send via WhatsApp"** dabate hi formatted purchase order vendor ke WhatsApp par direct bhej sakte hain.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
