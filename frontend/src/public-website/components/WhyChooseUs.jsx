import React from 'react';
import {
  ShieldCheck,
  Award,
  Zap,
  ThumbsUp,
} from 'lucide-react';

const ADVANTAGES = [
  {
    icon: Award,
    title: '15+ Years Experience',
    desc: 'Imran and Naim Pathan have over 15 years of experience fixing bikes and scooters.',
    color: 'text-[#0284C7] bg-sky-50/90 border-sky-200/60',
  },
  {
    icon: ShieldCheck,
    title: 'Original Spare Parts',
    desc: 'We only fit 100% original company parts and trusted engine oil in every service.',
    color: 'text-emerald-700 bg-emerald-50/90 border-emerald-200/60',
  },
  {
    icon: Zap,
    title: 'Fast Same-Day Service',
    desc: 'Quick oil change, general tuneup, and minor repairs finished on the same day.',
    color: 'text-amber-700 bg-amber-50/90 border-amber-200/60',
  },
  {
    icon: ThumbsUp,
    title: 'Clear & Honest Bills',
    desc: 'No hidden charges. Get a clear digital bill directly sent to your WhatsApp.',
    color: 'text-purple-700 bg-purple-50/90 border-purple-200/60',
  },
];

export const WhyChooseUs = () => {
  return (
    <section id="why-us" className="py-14 sm:py-18 bg-transparent text-slate-900 relative select-none border-b border-slate-200/60 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-white/80 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2.5 shadow-xs">
            <Award className="w-3.5 h-3.5" /> Why Us
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">
            Why Bike Owners Trust Us
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1.5">
            Honest work, original parts, and friendly mechanics you can rely on in Mosali.
          </p>
        </div>

        {/* 4 Concise Advantage Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {ADVANTAGES.map((adv, idx) => {
            const Icon = adv.icon;
            return (
              <div
                key={idx}
                className="p-5 sm:p-6 rounded-3xl bg-white/65 hover:bg-white/95 backdrop-blur-xl border border-white/80 shadow-md shadow-slate-200/30 hover:shadow-xl hover:border-[#0284C7]/40 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border mb-4 backdrop-blur-md ${adv.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-black text-slate-900 mb-1.5">
                    {adv.title}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-2">
                    {adv.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
