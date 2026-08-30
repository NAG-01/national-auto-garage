import React, { useState } from 'react';
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

const ADVANTAGES = [
  {
    id: 'exp',
    icon: Award,
    title: '15+ Years Experience',
    badge: 'Master Mechanics',
    desc: 'Imran and Naim Pathan have over 15 years of hands-on experience fixing all bikes and scooters.',
    color: 'text-[#0284C7] bg-sky-50/90 border-sky-200/60',
  },
  {
    id: 'parts',
    icon: ShieldCheck,
    title: 'Original Spare Parts',
    badge: '100% Genuine',
    desc: 'We only fit 100% original company parts and trusted high-grade engine oil in every service.',
    color: 'text-emerald-700 bg-emerald-50/90 border-emerald-200/60',
  },
  {
    id: 'fast',
    icon: Zap,
    title: 'Fast Same-Day Service',
    badge: 'Quick Delivery',
    desc: 'Quick oil change, general tuneup, and minor repairs finished efficiently on the same day.',
    color: 'text-amber-700 bg-amber-50/90 border-amber-200/60',
  },
  {
    id: 'bill',
    icon: ThumbsUp,
    title: 'Clear & Honest Bills',
    badge: 'Transparent',
    desc: 'No hidden charges or extra fees. Get a clear digital bill directly sent to your WhatsApp.',
    color: 'text-purple-700 bg-purple-50/90 border-purple-200/60',
  },
];

export const WhyChooseUs = () => {
  const [deckOrder, setDeckOrder] = useState([0, 1, 2, 3]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [flippingCardId, setFlippingCardId] = useState(null);

  const cycleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    const activeIndex = deckOrder[0];
    setFlippingCardId(ADVANTAGES[activeIndex].id);

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
    if (isAnimating) return;
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

        {/* 1. DESKTOP VIEW: Full 4-Pillar Grid (Hidden on Mobile) */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {ADVANTAGES.map((adv, idx) => {
            const Icon = adv.icon;
            return (
              <ScrollReveal key={idx} direction="up" delay={idx * 100}>
                <div className="group relative p-5 sm:p-6 rounded-3xl bg-white/65 hover:bg-white/95 backdrop-blur-xl border border-white/80 shadow-md shadow-slate-200/30 hover:shadow-xl hover:border-[#0284C7]/40 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between h-full overflow-hidden">
                  
                  {/* Subtle Background Watermark Graphic */}
                  <div className="absolute -bottom-4 -right-4 opacity-[0.06] group-hover:opacity-[0.14] pointer-events-none text-emerald-600 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6">
                    <Icon className="w-36 h-36" />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-2.5 rounded-2xl ${adv.color} backdrop-blur-md shadow-2xs`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      {adv.badge && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/90 border border-slate-200/80 text-slate-700 shadow-2xs">
                          {adv.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-black text-slate-900 mb-1.5">
                      {adv.title}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      {adv.desc}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* 2. MOBILE VIEW ONLY: Compact Card Deck with Watermark (Hidden on Desktop) */}
        <div className="block sm:hidden">
          <ScrollReveal direction="up" delay={100}>
            <div className="max-w-md mx-auto relative px-1 pb-2">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-1 text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                  <span>Feature {deckOrder[0] + 1} of {ADVANTAGES.length}</span>
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
                {ADVANTAGES.map((adv, originalIndex) => {
                  const stackPos = deckOrder.indexOf(originalIndex);
                  const isFront = stackPos === 0;
                  const isFlipping = flippingCardId === adv.id;
                  const Icon = adv.icon;

                  const translateY = Math.min(stackPos * 18, 54);
                  const scale = Math.max(1 - stackPos * 0.04, 0.88);
                  const opacity = isFront ? 1 : Math.max(1 - stackPos * 0.15, 0.70);
                  const zIndex = 30 - stackPos * 5;

                  return (
                    <div
                      key={adv.id}
                      className={`absolute inset-x-0 top-0 h-[210px] p-5 rounded-3xl backdrop-blur-2xl border select-none flex flex-col justify-between will-change-transform overflow-hidden ${
                        isFlipping
                          ? 'duration-200 ease-out z-40'
                          : 'duration-300 ease-out'
                      } ${
                        isFront
                          ? 'bg-white/95 border-white shadow-xl shadow-slate-900/10'
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
                      {/* Subtle Background Watermark Graphic */}
                      {isFront && (
                        <div className="absolute -bottom-3 -right-3 opacity-[0.08] pointer-events-none text-emerald-600">
                          <Icon className="w-32 h-32 transform -rotate-12" />
                        </div>
                      )}

                      {/* Hide inner text on rear cards while preserving h-[210px] height */}
                      <div className={isFront ? 'opacity-100 flex flex-col justify-between h-full relative z-10' : 'opacity-0 invisible h-full'}>
                        <div>
                          <div className="flex items-center justify-between mb-2.5">
                            <div className={`p-2 rounded-2xl ${adv.color} backdrop-blur-md shadow-2xs`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            {adv.badge && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/90 border border-slate-200/80 text-slate-700 shadow-2xs">
                                {adv.badge}
                              </span>
                            )}
                          </div>

                          <h3 className="text-base font-black text-slate-900 mb-1">
                            {adv.title}
                          </h3>
                          <p className="text-xs text-slate-600 font-medium leading-relaxed">
                            {adv.desc}
                          </p>
                        </div>

                        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-slate-400">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0284C7]">
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
                  {ADVANTAGES.map((_, idx) => (
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

      </div>
    </section>
  );
};
