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
import fullServiceBg from '../../assets/full_service_bg.jpg';
import engineRepairBg from '../../assets/engine_repair_bg.jpg';
import brakesShockerBg from '../../assets/brakes_shocker_bg.jpg';
import wiringBatteryBg from '../../assets/wiring_battery_bg.jpg';
import chainGearsBg from '../../assets/chain_gears_bg.jpg';
import genuineSparesBg from '../../assets/genuine_spares_bg.jpg';
import { useWebsiteConfig } from '../context/WebsiteConfigContext.jsx';

const DEFAULT_BG_MAP = {
  'full-service': fullServiceBg,
  'engine-repair': engineRepairBg,
  'brakes-suspension': brakesShockerBg,
  'wiring-battery': wiringBatteryBg,
  'chain-gears': chainGearsBg,
  'genuine-spares': genuineSparesBg,
};

const ICON_MAP = {
  Wrench: Wrench,
  Flame: Flame,
  Disc: Disc,
  Zap: Zap,
  Layers: Layers,
  Shield: Shield,
};

const ICON_BG_MAP = {
  Wrench: 'bg-sky-100/80 text-[#0284C7] border border-sky-200/60',
  Flame: 'bg-rose-100/80 text-rose-600 border border-rose-200/60',
  Disc: 'bg-emerald-100/80 text-emerald-700 border border-emerald-200/60',
  Zap: 'bg-purple-100/80 text-purple-700 border border-purple-200/60',
  Layers: 'bg-blue-100/80 text-blue-700 border border-blue-200/60',
  Shield: 'bg-amber-100/80 text-amber-700 border border-amber-200/60',
};

export const ServicesSection = () => {
  const { config } = useWebsiteConfig();
  const rawServices = Array.isArray(config?.services) && config.services.length > 0 ? config.services : [];
  const services = rawServices
    .filter((s) => s.isActive !== false)
    .map((s, idx) => {
      const fallbackKeys = Object.keys(DEFAULT_BG_MAP);
      const fallbackKey = s.id || fallbackKeys[idx % fallbackKeys.length];
      return {
        ...s,
        bgImage: s.bgImage || DEFAULT_BG_MAP[fallbackKey] || fullServiceBg,
        iconComponent: ICON_MAP[s.icon] || Wrench,
        iconBg: ICON_BG_MAP[s.icon] || 'bg-sky-100/80 text-[#0284C7] border border-sky-200/60',
      };
    });

  // Mobile Stacked Deck State
  const [deckOrder, setDeckOrder] = useState(services.map((_, i) => i));
  const [isAnimating, setIsAnimating] = useState(false);
  const [flippingCardId, setFlippingCardId] = useState(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    setDeckOrder(services.map((_, i) => i));
  }, [services.length]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const cycleNext = () => {
    if (isAnimating || services.length === 0) return;
    setIsAnimating(true);
    const activeIndex = deckOrder[0];
    setFlippingCardId(services[activeIndex]?.id);

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
    if (isAnimating || services.length === 0) return;
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

        {/* 1. DESKTOP VIEW: 6-Card Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {services.map((srv, idx) => {
            const Icon = srv.iconComponent;
            return (
              <ScrollReveal key={srv.id || idx} direction="up" delay={idx * 80}>
                <div className="group relative p-5 sm:p-6 rounded-3xl bg-white backdrop-blur-xl border border-slate-200/80 hover:border-[#0284C7]/40 shadow-md shadow-slate-200/30 hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between h-full overflow-hidden min-h-[220px]">
                  
                  {/* Background Image with Precision Gradient Mask */}
                  <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-3xl">
                    <img
                      src={srv.bgImage}
                      alt={srv.title}
                      className={`w-full h-full object-cover ${srv.imgPosition || 'object-right'} opacity-100 transition-all duration-700 group-hover:scale-105`}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,#ffffff_0%,#ffffff_26%,rgba(255,255,255,0.5)_38%,transparent_52%)]" />
                  </div>

                  <div className="relative z-10 max-w-[54%]">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2.5 rounded-2xl ${srv.iconBg} backdrop-blur-md shadow-2xs group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      {srv.badge && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-white/95 backdrop-blur-md border border-slate-200/80 text-slate-800 shadow-2xs">
                          {srv.badge}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-black text-slate-900 group-hover:text-[#0284C7] transition-colors mb-1.5">
                      {srv.title}
                    </h3>
                    <p className="text-xs text-slate-800 font-extrabold leading-relaxed">
                      {srv.description}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* 2. MOBILE VIEW ONLY: Card Deck */}
        {services.length > 0 && (
          <div className="block md:hidden">
            <ScrollReveal direction="up" delay={100}>
              <div className="max-w-md mx-auto relative px-1 pb-2">
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-[#0284C7] animate-pulse" />
                    <span>{deckOrder[0] + 1} of {services.length}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                    <MousePointerClick className="w-3 h-3 text-slate-500" />
                    <span>Tap card to cycle</span>
                  </div>
                </div>

                {/* Compact 275px Stage Container for h-[210px] Cards */}
                <div
                  className="relative w-full h-[275px] cursor-pointer touch-pan-y"
                  onClick={cycleNext}
                  tabIndex={0}
                  role="button"
                  aria-label="Cycle next service"
                >
                  {services.map((srv, originalIndex) => {
                    const stackPos = deckOrder.indexOf(originalIndex);
                    const isFront = stackPos === 0;
                    const isFlipping = flippingCardId === srv.id;
                    const Icon = srv.iconComponent;

                    const translateY = Math.min(stackPos * 18, 54);
                    const scale = Math.max(1 - stackPos * 0.04, 0.88);
                    const opacity = isFront ? 1 : Math.max(1 - stackPos * 0.15, 0.70);
                    const zIndex = 30 - stackPos * 5;

                    return (
                      <div
                        key={srv.id || originalIndex}
                        className={`absolute inset-x-0 top-0 h-[210px] p-4 rounded-3xl backdrop-blur-2xl border select-none flex flex-col justify-between will-change-transform overflow-hidden ${
                          isFlipping
                            ? 'duration-200 ease-out z-40'
                            : 'duration-300 ease-out'
                        } ${
                          isFront
                            ? 'bg-white border-white shadow-xl shadow-slate-900/10'
                            : 'bg-white/85 border-white/90 shadow-md shadow-slate-900/10'
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
                        {/* Mobile Background Image */}
                        {isFront && (
                          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-3xl">
                            <img
                              src={srv.bgImage}
                              alt={srv.title}
                              className={`w-full h-full object-cover ${srv.imgPosition || 'object-right'} opacity-100`}
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-[linear-gradient(90deg,#ffffff_0%,#ffffff_26%,rgba(255,255,255,0.5)_38%,transparent_52%)]" />
                          </div>
                        )}

                        {/* Hide inner text on rear cards while preserving h-[210px] height */}
                        <div className={isFront ? 'opacity-100 flex flex-col justify-between h-full relative z-10' : 'opacity-0 invisible h-full'}>
                          <div className="max-w-[56%]">
                            <div className="flex items-center justify-between mb-2">
                              <div className={`p-2 rounded-2xl ${srv.iconBg} backdrop-blur-md shadow-2xs`}>
                                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                              </div>
                              {srv.badge && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-white/95 border border-slate-200/80 text-slate-800 shadow-2xs">
                                  {srv.badge}
                                </span>
                              )}
                            </div>

                            <h3 className="text-sm sm:text-base font-black text-slate-900 mb-1 leading-tight">
                              {srv.title}
                            </h3>
                            <p className="text-[10px] sm:text-xs text-slate-800 font-extrabold leading-relaxed line-clamp-2">
                              {srv.description}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-slate-400">
                            <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-[#0284C7]">
                              Tap to view next →
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-[#0284C7] animate-pulse" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Equal Controls */}
                <div className="flex items-center justify-between mt-6 px-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      cyclePrev();
                    }}
                    disabled={isAnimating}
                    className="p-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs cursor-pointer active:scale-95 transition-transform"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1.5">
                    {services.map((_, idx) => (
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
                    className="p-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs cursor-pointer active:scale-95 transition-transform"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        )}

      </div>
    </section>
  );
};
