import React from 'react';
import { Phone, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal.jsx';

const STATS = [
  { id: 'exp', value: '15+', label: 'Years of Experience', color: 'text-[#0284C7]' },
  { id: 'bikes', value: '10,000+', label: 'Bikes Serviced', color: 'text-emerald-600' },
  { id: 'rating', value: '4.9 ★', label: 'Happy Customers', color: 'text-amber-600' },
  { id: 'pricing', value: '100%', label: 'Honest Pricing', color: 'text-slate-900' },
];

export const HeroSection = () => {
  return (
    <section id="home" className="relative bg-transparent text-slate-900 pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-slate-200/60 select-none overflow-hidden scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-6 sm:space-y-7">
          
          {/* Top Luxury Pill Badge */}
          <ScrollReveal direction="down" delay={0}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-xl border border-white/90 text-[#0284C7] text-[11px] sm:text-xs font-black tracking-wider uppercase shadow-md shadow-sky-500/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>Mosali's Premier Two-Wheeler Workshop</span>
            </div>
          </ScrollReveal>

          {/* Luxury Main Headline */}
          <ScrollReveal direction="up" delay={100}>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight uppercase leading-[1.2] sm:leading-[1.12]">
              <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
                Complete Bike Service &{' '}
              </span>
              <span className="bg-gradient-to-r from-[#0284C7] via-sky-600 to-blue-700 bg-clip-text text-transparent drop-shadow-xs">
                Engine Repair
              </span>
            </h1>
          </ScrollReveal>

          {/* Subtitle */}
          <ScrollReveal direction="up" delay={200}>
            <p className="text-xs sm:text-base text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto px-2">
              Run by <strong>Imran Pathan & Naim Pathan</strong>. Periodic bike servicing, precision engine rebuilding, oil change, battery load testing, and brake overhaul in Mosali.
            </p>
          </ScrollReveal>

          {/* Glass Action Buttons */}
          <ScrollReveal direction="up" delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href="tel:+919624844188"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider text-white bg-gradient-to-r from-[#0284C7] to-blue-600 hover:from-[#0369A1] hover:to-blue-700 backdrop-blur-md shadow-lg shadow-sky-500/25 border border-sky-400/30 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 font-mono"
              >
                <Phone className="w-4 h-4" />
                <span>Imran: 96248 44188</span>
              </a>

              <a
                href="tel:+918128144350"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 bg-white/80 hover:bg-white backdrop-blur-md border border-white/90 shadow-md shadow-slate-900/5 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 font-mono"
              >
                <Phone className="w-4 h-4 text-[#0284C7]" />
                <span>Naim: 81281 44350</span>
              </a>

              <a
                href="https://api.whatsapp.com/send?phone=919624844188&text=Hello%20National%20Auto%20Garage,%20I%20want%20to%20inquire%20about%20bike%20service."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 backdrop-blur-md shadow-lg shadow-emerald-600/25 border border-emerald-400/30 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </ScrollReveal>

        </div>

        {/* 4 Separate Metric Cards (100% Equal Height & Uniform Grid Size) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mt-14 sm:mt-18 items-stretch">
          {STATS.map((st, idx) => (
            <ScrollReveal key={st.id} direction="up" delay={idx * 80} className="h-full">
              <div className="h-full flex flex-col items-center justify-center p-5 sm:p-6 rounded-3xl bg-white/70 hover:bg-white/95 backdrop-blur-xl border border-white/90 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:border-[#0284C7]/40 transition-all duration-300 hover:-translate-y-1 text-center min-h-[115px] sm:min-h-[135px]">
                <div className={`text-2xl sm:text-3xl font-black tracking-tight ${st.color}`}>{st.value}</div>
                <div className="text-[10px] sm:text-xs text-slate-600 font-extrabold uppercase tracking-wider mt-1 text-center leading-tight">
                  {st.label}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

      </div>
    </section>
  );
};
