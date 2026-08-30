import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Flame,
  Shield,
  Zap,
  Disc,
  Layers,
  ChevronRight,
  ChevronLeft,
  MousePointerClick,
  Sparkles,
} from 'lucide-react';
import { ScrollReveal } from './ScrollReveal.jsx';

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
    iconBg: 'bg-[#0284C7]/10 text-[#0284C7] border border-sky-200/60',
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
  // Mobile Stacked Deck State
  const [deckOrder, setDeckOrder] = useState([0, 1, 2, 3, 4, 5]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [flippingCardId, setFlippingCardId] = useState(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const cycleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    const activeIndex = deckOrder[0];
    setFlippingCardId(SERVICES[activeIndex].id);

    // Instant soft dissolve (200ms) for 100% friction-free switch
    setTimeout(
      () => {
        setDeckOrder((prev) => {
          const next = [...prev];
          const top = next.shift();
          next.push(top);
          return next;
        });
        setFlippingCardId(null);
        setIsAnimating(false);
      },
      prefersReducedMotion ? 40 : 200
    );
  };

  const cyclePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDeckOrder((prev) => {
      const next = [...prev];
      const bottom = next.pop();
      next.unshift(bottom);
      return next;
    });
    setTimeout(() => setIsAnimating(false), prefersReducedMotion ? 40 : 200);
  };

  const jumpToCard = (targetIdx) => {
    if (isAnimating || deckOrder[0] === targetIdx) return;
    setIsAnimating(true);
    setDeckOrder((prev) => {
      const currentPos = prev.indexOf(targetIdx);
      if (currentPos === -1) return prev;
      const next = [...prev];
      const moved = next.splice(currentPos, 1)[0];
      next.unshift(moved);
      return next;
    });
    setTimeout(() => setIsAnimating(false), prefersReducedMotion ? 40 : 200);
  };

  return (
    <section id="services" className="py-14 sm:py-18 bg-transparent text-slate-900 relative select-none border-b border-slate-200/60 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <ScrollReveal direction="up" delay={0}>
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
        </ScrollReveal>

        {/* 1. DESKTOP VIEW: Clean 6-Card Grid (Hidden on Mobile) */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {SERVICES.map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <ScrollReveal key={srv.id} direction="up" delay={idx * 80}>
                <div className="group relative p-5 sm:p-6 rounded-3xl bg-white/65 hover:bg-white/95 backdrop-blur-xl border border-white/80 hover:border-[#0284C7]/40 shadow-md shadow-slate-200/30 hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between h-full">
                  <div>
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
                    <h3 className="text-base font-black text-slate-900 group-hover:text-[#0284C7] transition-colors mb-1.5">
                      {srv.title}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mb-4 line-clamp-2">
                      {srv.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {srv.tags.map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100/90 text-slate-600 border border-slate-200/60">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* 2. MOBILE VIEW ONLY: Seamless Soft Dissolve Card Deck (Hidden on Desktop) */}
        <div className="block md:hidden">
          <ScrollReveal direction="up" delay={100}>
            <div className="max-w-md mx-auto relative px-1 pb-2">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-1 text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-[#0284C7] animate-pulse" />
                  <span>{deckOrder[0] + 1} of {SERVICES.length}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                  <MousePointerClick className="w-3 h-3 text-slate-500" />
                  <span>Tap card to cycle</span>
                </div>
              </div>

              <div
                className="relative w-full h-[270px] cursor-pointer touch-pan-y"
                onClick={cycleNext}
                tabIndex={0}
                role="button"
                aria-label="Cycle next service"
              >
                {SERVICES.map((srv, originalIndex) => {
                  const stackPos = deckOrder.indexOf(originalIndex);
                  const isFront = stackPos === 0;
                  const isFlipping = flippingCardId === srv.id;
                  const Icon = srv.icon;

                  const translateY = Math.min(stackPos * 12, 36);
                  const scale = Math.max(1 - stackPos * 0.04, 0.88);
                  const opacity = isFront ? 1 : Math.max(1 - stackPos * 0.15, 0.6);
                  const zIndex = 30 - stackPos * 5;

                  return (
                    <div
                      key={srv.id}
                      className={`absolute inset-x-0 top-0 p-5 rounded-3xl backdrop-blur-2xl border select-none flex flex-col justify-between will-change-transform ${
                        isFlipping
                          ? 'duration-200 ease-out z-40'
                          : 'duration-300 ease-out'
                      } ${
                        isFront
                          ? 'bg-white/95 border-white shadow-xl shadow-slate-900/10'
                          : 'bg-white/80 border-white/90 shadow-md'
                      }`}
                      style={{
                        transform: isFlipping
                          ? 'translate3d(0px, -18px, 0px) scale(0.98)'
                          : `translate3d(0px, ${translateY}px, 0px) scale(${scale})`,
                        opacity: isFlipping ? 0 : opacity,
                        zIndex: isFlipping ? 40 : zIndex,
                        transitionProperty: 'transform, opacity, scale',
                      }}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className={`p-2.5 rounded-2xl ${srv.iconBg} backdrop-blur-md shadow-2xs`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          {srv.badge && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/90 border border-slate-200/80 text-slate-700 shadow-2xs">
                              {srv.badge}
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-black text-slate-900 mb-1.5">
                          {srv.title}
                        </h3>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed mb-4 line-clamp-2">
                          {srv.description}
                        </p>

                        <div className="flex flex-wrap gap-1.5">
                          {srv.tags.map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100/90 text-slate-700 border border-slate-200/70">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {isFront && (
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-slate-400">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0284C7]">
                            Tap to view next →
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-[#0284C7] animate-pulse" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Controls & Dots */}
              <div className="flex items-center justify-between mt-12 px-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    cyclePrev();
                  }}
                  disabled={isAnimating}
                  className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs cursor-pointer active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1.5">
                  {SERVICES.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        jumpToCard(idx);
                      }}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        deckOrder[0] === idx ? 'w-5 bg-[#0284C7]' : 'w-2 bg-slate-300'
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    cycleNext();
                  }}
                  disabled={isAnimating}
                  className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs cursor-pointer active:scale-95"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </ScrollReveal>
        </div>

      </div>
    </section>
  );
};
