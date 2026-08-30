import React from 'react';
import {
  Phone,
  MessageSquare,
} from 'lucide-react';

export const HeroSection = () => {
  return (
    <section id="home" className="relative bg-transparent text-slate-900 pt-10 pb-16 sm:pt-16 sm:pb-24 border-b border-slate-200/60 select-none overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-5 sm:space-y-6">
          
          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight uppercase leading-[1.2] sm:leading-[1.15] animate-in fade-in duration-500">
            Complete Bike Service &{' '}
            <span className="text-[#0284C7] drop-shadow-xs">
              Engine Repair
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-base text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto px-2">
            Run by <strong>Imran Pathan & Naim Pathan</strong>. Full bike servicing, oil change, engine repair, battery check, and brake repair in Mosali.
          </p>

          {/* Glass Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href="tel:+919624844188"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider text-white bg-[#0284C7]/90 hover:bg-[#0284C7] backdrop-blur-md shadow-lg shadow-sky-500/25 border border-sky-400/30 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 font-mono"
            >
              <Phone className="w-4 h-4" />
              <span>Imran: 96248 44188</span>
            </a>

            <a
              href="tel:+918128144350"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 bg-white/75 hover:bg-white backdrop-blur-md border border-white/90 shadow-md shadow-slate-900/5 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 font-mono"
            >
              <Phone className="w-4 h-4 text-[#0284C7]" />
              <span>Naim: 81281 44350</span>
            </a>

            <a
              href="https://api.whatsapp.com/send?phone=919624844188&text=Hello%20National%20Auto%20Garage,%20I%20want%20to%20inquire%20about%20bike%20service."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider text-white bg-emerald-600/90 hover:bg-emerald-600 backdrop-blur-md shadow-lg shadow-emerald-600/25 border border-emerald-400/30 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>

        </div>

        {/* 4 Frosted Glass Stats Metrics */}
        <div className="mt-12 sm:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <div className="p-4 sm:p-6 rounded-3xl bg-white/60 hover:bg-white/85 backdrop-blur-xl border border-white/80 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center">
            <div className="text-xl sm:text-3xl font-black text-[#0284C7]">15+</div>
            <div className="text-[11px] sm:text-xs text-slate-600 font-bold uppercase tracking-wider mt-1">
              Years of Experience
            </div>
          </div>

          <div className="p-4 sm:p-6 rounded-3xl bg-white/60 hover:bg-white/85 backdrop-blur-xl border border-white/80 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center">
            <div className="text-xl sm:text-3xl font-black text-emerald-600">10,000+</div>
            <div className="text-[11px] sm:text-xs text-slate-600 font-bold uppercase tracking-wider mt-1">
              Bikes Serviced
            </div>
          </div>

          <div className="p-4 sm:p-6 rounded-3xl bg-white/60 hover:bg-white/85 backdrop-blur-xl border border-white/80 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center">
            <div className="text-xl sm:text-3xl font-black text-amber-600">4.9 ★</div>
            <div className="text-[11px] sm:text-xs text-slate-600 font-bold uppercase tracking-wider mt-1">
              Happy Customers
            </div>
          </div>

          <div className="p-4 sm:p-6 rounded-3xl bg-white/60 hover:bg-white/85 backdrop-blur-xl border border-white/80 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center">
            <div className="text-xl sm:text-3xl font-black text-slate-900">100%</div>
            <div className="text-[11px] sm:text-xs text-slate-600 font-bold uppercase tracking-wider mt-1">
              Honest Pricing
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
