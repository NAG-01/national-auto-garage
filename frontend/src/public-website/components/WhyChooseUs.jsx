import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Award,
  Zap,
  ThumbsUp,
  ChevronRight,
  ChevronLeft,
  MousePointerClick,
  Sparkles,
} from 'lucide-react';
import { ScrollReveal } from './ScrollReveal.jsx';
import whyUsExpBg from '../../assets/why_us_exp_bg.png';
import whyUsPartsBg from '../../assets/why_us_parts_bg.jpg';
import whyUsFastBg from '../../assets/why_us_fast_bg.jpg';
import whyUsBillBg from '../../assets/why_us_bill_bg.jpg';
import { useWebsiteConfig } from '../context/WebsiteConfigContext.jsx';

const DEFAULT_ADV_BG_MAP = {
  exp: whyUsExpBg,
  parts: whyUsPartsBg,
  fast: whyUsFastBg,
  bill: whyUsBillBg,
};

const ADV_ICON_MAP = {
  Award: Award,
  ShieldCheck: ShieldCheck,
  Zap: Zap,
  ThumbsUp: ThumbsUp,
};

const ADV_COLOR_MAP = {
  Award: 'text-[#0284C7] bg-sky-50/90 border-sky-200/60',
  ShieldCheck: 'text-emerald-700 bg-emerald-50/90 border-emerald-200/60',
  Zap: 'text-amber-700 bg-amber-50/90 border-amber-200/60',
  ThumbsUp: 'text-purple-700 bg-purple-50/90 border-purple-200/60',
};

export const WhyChooseUs = () => {
  const { config } = useWebsiteConfig();
  const rawAdvantages = Array.isArray(config?.advantages) && config.advantages.length > 0 ? config.advantages : [];
  
  const advantages = rawAdvantages
    .filter((a) => a.isActive !== false)
    .map((adv, idx) => {
      const fallbackKeys = Object.keys(DEFAULT_ADV_BG_MAP);
      const fallbackKey = adv.id || fallbackKeys[idx % fallbackKeys.length];
      return {
        ...adv,
        bgImage: adv.bgImage || DEFAULT_ADV_BG_MAP[fallbackKey] || whyUsExpBg,
        iconComponent: ADV_ICON_MAP[adv.icon] || Award,
        color: ADV_COLOR_MAP[adv.icon] || 'text-[#0284C7] bg-sky-50/90 border-sky-200/60',
      };
    });

  const [deckOrder, setDeckOrder] = useState(advantages.map((_, i) => i));
  const [isAnimating, setIsAnimating] = useState(false);
  const [flippingCardId, setFlippingCardId] = useState(null);

  useEffect(() => {
    setDeckOrder(advantages.map((_, i) => i));
  }, [advantages.length]);

  const cycleNext = () => {
    if (isAnimating || advantages.length === 0) return;
    setIsAnimating(true);
    const activeIndex = deckOrder[0];
    setFlippingCardId(advantages[activeIndex]?.id);

    setTimeout(() => {
      setDeckOrder((prev) => {
        const next = [...prev];
        const top = next.shift();
        next.push(top);
        return next;
      });
      setFlippingCardId(null);
      setIsAnimating(false);
    }, 200);
  };

  const cyclePrev = () => {
    if (isAnimating || advantages.length === 0) return;
    setIsAnimating(true);
    setDeckOrder((prev) => {
      const next = [...prev];
      const bottom = next.pop();
      next.unshift(bottom);
      return next;
    });
    setTimeout(() => setIsAnimating(false), 200);
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
    setTimeout(() => setIsAnimating(false), 200);
  };

  return (
    <section id="why-us" className="py-14 sm:py-18 bg-transparent text-slate-900 relative select-none border-b border-slate-200/60 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <ScrollReveal direction="up" delay={0}>
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-white/80 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2.5 shadow-xs">
              <Award className="w-3.5 h-3.5" /> Why Us
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#0284C7] tracking-tight uppercase">
              Why Bike Owners Trust Us
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1.5">
              Honest work, original parts, and friendly mechanics you can rely on in Mosali.
            </p>
          </div>
        </ScrollReveal>

        {/* 1. DESKTOP VIEW: Full 4-Pillar Grid */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {advantages.map((adv, idx) => {
            const Icon = adv.iconComponent;
            return (
              <ScrollReveal key={adv.id || idx} direction="up" delay={idx * 100}>
                <div className="group relative p-5 sm:p-6 rounded-3xl bg-white backdrop-blur-xl border border-slate-200/80 hover:border-[#0284C7]/40 shadow-md shadow-slate-200/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between h-full overflow-hidden min-h-[220px]">
                  
                  {/* Custom Background Image with Precision Gradient Mask */}
                  {adv.bgImage && (
                    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-3xl">
                      <img
                        src={adv.bgImage}
                        alt={adv.title}
                        className="w-full h-full object-cover object-right opacity-100 transition-all duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,#ffffff_0%,#ffffff_26%,rgba(255,255,255,0.5)_38%,transparent_52%)]" />
                    </div>
                  )}

                  <div className="relative z-10 max-w-[54%]">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2.5 rounded-2xl ${adv.color} backdrop-blur-md shadow-2xs`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      {adv.badge && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-white/95 border border-slate-200/80 text-slate-800 shadow-2xs">
                          {adv.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-black text-slate-900 mb-1.5">
                      {adv.title}
                    </h3>
                    <p className="text-xs text-slate-800 font-extrabold leading-relaxed">
                      {adv.desc || adv.description}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* 2. MOBILE VIEW ONLY: Compact Card Deck */}
        {advantages.length > 0 && (
          <div className="block sm:hidden">
            <ScrollReveal direction="up" delay={100}>
              <div className="max-w-md mx-auto relative px-1 pb-2">
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                    <span>Feature {deckOrder[0] + 1} of {advantages.length}</span>
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
                  aria-label="Cycle next feature"
                >
                  {advantages.map((adv, originalIndex) => {
                    const stackPos = deckOrder.indexOf(originalIndex);
                    const isFront = stackPos === 0;
                    const isFlipping = flippingCardId === adv.id;
                    const Icon = adv.iconComponent;

                    const translateY = Math.min(stackPos * 18, 54);
                    const scale = Math.max(1 - stackPos * 0.04, 0.88);
                    const opacity = isFront ? 1 : Math.max(1 - stackPos * 0.15, 0.70);
                    const zIndex = 30 - stackPos * 5;

                    return (
                      <div
                        key={adv.id || originalIndex}
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
                        {/* Custom Uploaded Background Image for Front Card */}
                        {isFront && adv.bgImage && (
                          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-3xl">
                            <img
                              src={adv.bgImage}
                              alt={adv.title}
                              className="w-full h-full object-cover object-right opacity-100"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-[linear-gradient(90deg,#ffffff_0%,#ffffff_26%,rgba(255,255,255,0.5)_38%,transparent_52%)]" />
                          </div>
                        )}

                        {/* Hide inner text on rear cards while preserving h-[210px] height */}
                        <div className={isFront ? 'opacity-100 flex flex-col justify-between h-full relative z-10' : 'opacity-0 invisible h-full'}>
                          <div className="max-w-[56%]">
                            <div className="flex items-center justify-between mb-2">
                              <div className={`p-2 rounded-2xl ${adv.color} backdrop-blur-md shadow-2xs`}>
                                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                              </div>
                              {adv.badge && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-white/95 border border-slate-200/80 text-slate-800 shadow-2xs">
                                  {adv.badge}
                                </span>
                              )}
                            </div>

                            <h3 className="text-sm sm:text-base font-black text-slate-900 mb-1 leading-tight">
                              {adv.title}
                            </h3>
                            <p className="text-[10px] sm:text-xs text-slate-800 font-extrabold leading-relaxed line-clamp-2">
                              {adv.desc || adv.description}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-400">
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
                    {advantages.map((_, idx) => (
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
