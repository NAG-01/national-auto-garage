import React from 'react';
import { Phone } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal.jsx';

const STATS = [
  { id: 'exp', value: '20+', label: 'Years of Experience', color: 'text-[#0284C7]' },
  { id: 'bikes', value: '1,000+', label: 'Bikes Serviced', color: 'text-emerald-600' },
  { id: 'rating', value: '4.9 ★', label: 'Happy Customers', color: 'text-amber-600' },
  { id: 'pricing', value: '100%', label: 'Honest Pricing', color: 'text-slate-900' },
];

export const HeroSection = () => {
  return (
    <section id="home" className="relative bg-transparent text-slate-900 pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-slate-200/60 select-none overflow-hidden scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-6 sm:space-y-7">
          
          {/* Luxury Main Headline */}
          <ScrollReveal direction="up" delay={0}>
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
          <ScrollReveal direction="up" delay={100}>
            <p className="text-xs sm:text-base text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto px-2">
              Master mechanics <span className="font-bold text-slate-900">Imran Pathan</span> and <span className="font-bold text-slate-900">Naim Pathan</span> provide expert repair, genuine spare parts, and fast same-day service near White House Petrol Pump, Mosali.
            </p>
          </ScrollReveal>

          {/* Call-To-Action Buttons (Call Imran & Call Naim) */}
          <ScrollReveal direction="up" delay={200}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              
              {/* Call Imran */}
              <a
                href="tel:+919624844188"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white/90 hover:bg-white text-slate-800 text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-md shadow-slate-200/50 border border-slate-200/80 transition-all duration-300 hover:border-[#0284C7]/40 hover:text-[#0284C7] active:scale-98"
              >
                <Phone className="w-4 h-4 text-[#0284C7]" />
                <span>Call Imran: 96248 44188</span>
              </a>

              {/* Call Naim */}
              <a
                href="tel:+918128144350"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white/90 hover:bg-white text-slate-800 text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-md shadow-slate-200/50 border border-slate-200/80 transition-all duration-300 hover:border-[#0284C7]/40 hover:text-[#0284C7] active:scale-98"
              >
                <Phone className="w-4 h-4 text-[#0284C7]" />
                <span>Call Naim: 81281 44350</span>
              </a>

            </div>
          </ScrollReveal>
        </div>

        {/* 4 Stats Cards Grid - Equal Heights */}
        <div className="mt-12 sm:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 items-stretch">
          {STATS.map((st, idx) => (
            <ScrollReveal key={st.id} direction="up" delay={300 + idx * 80}>
              <div className="h-full min-h-[100px] sm:min-h-[110px] p-4 sm:p-5 rounded-3xl bg-white/70 hover:bg-white/95 backdrop-blur-xl border border-white/80 shadow-md shadow-slate-200/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center flex flex-col justify-center items-center">
                <div className={`text-2xl sm:text-3xl font-black ${st.color} tracking-tight font-mono mb-1`}>
                  {st.value}
                </div>
                <div className="text-[11px] sm:text-xs text-slate-600 font-bold uppercase tracking-wider">
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
