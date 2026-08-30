import React from 'react';
import {
  Wrench,
  Flame,
  Shield,
  Zap,
  Disc,
  Layers,
} from 'lucide-react';

const SERVICES = [
  {
    id: 'full-service',
    title: 'Full Bike Service',
    badge: 'Popular',
    icon: Wrench,
    iconBg: 'bg-sky-100/80 text-[#0284C7] border border-sky-200/60',
    description: 'Complete bike checkup, fresh engine oil change, and carburetor wash.',
    tags: ['Oil Change', 'Washing', 'Brake Check'],
  },
  {
    id: 'engine-repair',
    title: 'Engine Repair & Tuning',
    badge: 'Specialist',
    icon: Flame,
    iconBg: 'bg-amber-100/80 text-amber-700 border border-amber-200/60',
    description: 'Engine rebuilding, fixing white smoke, piston work, and smooth pickup.',
    tags: ['Engine Rebuild', 'Piston Work', 'Clutch Plates'],
  },
  {
    id: 'brakes-suspension',
    title: 'Brakes & Shocker Service',
    icon: Disc,
    iconBg: 'bg-emerald-100/80 text-emerald-700 border border-emerald-200/60',
    description: 'New brake shoes, disc pads, front fork oil seal, and smooth shockers.',
    tags: ['Brake Shoes', 'Disc Pads', 'Shocker Oil'],
  },
  {
    id: 'wiring-battery',
    title: 'Wiring & Battery Check',
    icon: Zap,
    iconBg: 'bg-purple-100/80 text-purple-700 border border-purple-200/60',
    description: 'Starter motor repair, battery testing, indicator lights, and wiring fix.',
    tags: ['Self Start', 'Battery Test', 'Wiring Fix'],
  },
  {
    id: 'chain-gears',
    title: 'Chain & Gear System',
    icon: Layers,
    iconBg: 'bg-blue-100/80 text-blue-700 border border-blue-200/60',
    description: 'Smooth gear shift, new chain sprocket set, and clutch cable change.',
    tags: ['Chain Sprocket', 'Clutch Cable', 'Smooth Gears'],
  },
  {
    id: 'genuine-spares',
    title: 'Original Spare Parts',
    badge: '100% Original',
    icon: Shield,
    iconBg: 'bg-orange-100/80 text-orange-700 border border-orange-200/60',
    description: '100% original company parts, Castrol/Motul engine oil, and new filters.',
    tags: ['Castrol / Motul', 'Original Spares', 'New Filters'],
  },
];

export const ServicesSection = () => {
  return (
    <section id="services" className="py-14 sm:py-18 bg-transparent text-slate-900 relative select-none border-b border-slate-200/60 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-white/80 text-[#0284C7] text-xs font-bold uppercase tracking-wider mb-2.5 shadow-xs">
            <Wrench className="w-3.5 h-3.5" /> What We Offer
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">
            Our Bike Services
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1.5">
            Fast and reliable repair for all types of bikes and scooters in Mosali.
          </p>
        </div>

        {/* Services Grid with 2-Line Concise Cards & Smooth Hover Lift */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {SERVICES.map((srv) => {
            const Icon = srv.icon;
            return (
              <div
                key={srv.id}
                className="group relative p-5 sm:p-6 rounded-3xl bg-white/65 hover:bg-white/95 backdrop-blur-xl border border-white/80 hover:border-[#0284C7]/40 shadow-md shadow-slate-200/30 hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
              >
                <div>
                  {/* Top Icon & Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2.5 rounded-2xl ${srv.iconBg} backdrop-blur-md shadow-2xs group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {srv.badge && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/90 backdrop-blur-md border border-slate-200/80 text-slate-700 shadow-2xs">
                        {srv.badge}
                      </span>
                    )}
                  </div>

                  {/* Title & Short 2-Line Description */}
                  <h3 className="text-base font-black text-slate-900 group-hover:text-[#0284C7] transition-colors mb-1.5">
                    {srv.title}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed mb-4 line-clamp-2">
                    {srv.description}
                  </p>

                  {/* Quick Tags Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {srv.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100/90 text-slate-600 border border-slate-200/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
