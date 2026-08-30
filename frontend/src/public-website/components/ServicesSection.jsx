import React, { useState, useRef, useEffect } from 'react';
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
  // State tracking the order of cards in the deck stack [0, 1, 2, 3, 4, 5]
  const [deckOrder, setDeckOrder] = useState([0, 1, 2, 3, 4, 5]);
  // Rapid click lock state
  const [isAnimating, setIsAnimating] = useState(false);
  // Tracking card ID currently executing flip transition
  const [flippingCardId, setFlippingCardId] = useState(null);
  
  // Check for reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Advance the top card to the back of the deck (Cyclic infinite loop)
  const cycleNext = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const activeIndex = deckOrder[0];
    const activeService = SERVICES[activeIndex];
    setFlippingCardId(activeService.id);

    // After animation duration, shift deck order array
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
      prefersReducedMotion ? 50 : 420
    );
  };

  // Cycle back to previous card
  const cyclePrev = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setDeckOrder((prev) => {
      const next = [...prev];
      const bottom = next.pop();
      next.unshift(bottom);
      return next;
    });

    setTimeout(
      () => {
        setIsAnimating(false);
      },
      prefersReducedMotion ? 50 : 350
    );
  };

  // Jump directly to a specific card index
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

    setTimeout(
      () => {
        setIsAnimating(false);
      },
      prefersReducedMotion ? 50 : 350
    );
  };

  const activeService = SERVICES[deckOrder[0]];

  return (
    <section id="services" className="py-14 sm:py-18 bg-transparent text-slate-900 relative select-none border-b border-slate-200/60 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <ScrollReveal direction="up" delay={0}>
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-white/80 text-[#0284C7] text-xs font-bold uppercase tracking-wider mb-2.5 shadow-xs">
              <Wrench className="w-3.5 h-3.5" /> What We Offer
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">
              Our Bike Services
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1.5">
              Click or tap the active card to cycle through our workshop services.
            </p>
          </div>
        </ScrollReveal>

        {/* Premium Interactive Stacked Card Deck Container */}
        <ScrollReveal direction="up" delay={150}>
          <div className="max-w-xl mx-auto relative px-2 sm:px-4 pb-4">
            
            {/* Top Helper Hint & Progress Pills */}
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#0284C7] animate-pulse" />
                <span>Service {deckOrder[0] + 1} of {SERVICES.length}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                <MousePointerClick className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Click card to cycle</span>
              </div>
            </div>

            {/* Stack Stage Container */}
            <div
              className="relative w-full h-[280px] sm:h-[300px] cursor-pointer touch-pan-y"
              onClick={cycleNext}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  cycleNext();
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`Current active service: ${activeService.title}. Click to view next service.`}
            >
              {SERVICES.map((srv, originalIndex) => {
                const stackPosition = deckOrder.indexOf(originalIndex);
                const isFront = stackPosition === 0;
                const isFlipping = flippingCardId === srv.id;
                const Icon = srv.icon;

                // Visual Offset Math for Stack Depth
                // Front card: 0px translateY, 1 scale, z-30
                // Card 2: 12px translateY, 0.96 scale, z-20
                // Card 3: 24px translateY, 0.92 scale, z-10
                // Cards 4+: 36px translateY, 0.88 scale, z-0
                const translateY = Math.min(stackPosition * 14, 42);
                const scale = Math.max(1 - stackPosition * 0.04, 0.88);
                const opacity = isFront ? 1 : Math.max(1 - stackPosition * 0.15, 0.6);
                const zIndex = 30 - stackPosition * 5;

                return (
                  <div
                    key={srv.id}
                    className={`absolute inset-x-0 top-0 p-6 sm:p-7 rounded-3xl backdrop-blur-2xl border transition-all ease-[cubic-bezier(0.16,1,0.3,1)] select-none flex flex-col justify-between ${
                      isFlipping
                        ? 'duration-450 -translate-y-8 -translate-x-6 scale-90 opacity-40 z-40 rotate-[-1.5deg]'
                        : 'duration-500'
                    } ${
                      isFront
                        ? 'bg-white/95 border-white shadow-xl shadow-slate-900/10 hover:shadow-2xl hover:border-sky-300 hover:scale-[1.01]'
                        : 'bg-white/75 border-white/80 shadow-md hover:bg-white/85'
                    }`}
                    style={{
                      transform: isFlipping
                        ? 'translate3d(-24px, -36px, 0) scale(0.9) rotate(-1.5deg)'
                        : `translate3d(0px, ${translateY}px, 0px) scale(${scale})`,
                      opacity: isFlipping ? 0.3 : opacity,
                      zIndex: isFlipping ? 40 : zIndex,
                    }}
                  >
                    <div>
                      {/* Top Icon & Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-2xl ${srv.iconBg} backdrop-blur-md shadow-2xs`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        {srv.badge && (
                          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/90 backdrop-blur-md border border-slate-200/80 text-slate-700 shadow-2xs">
                            {srv.badge}
                          </span>
                        )}
                      </div>

                      {/* Service Title */}
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-2">
                        {srv.title}
                      </h3>

                      {/* Concise Description */}
                      <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mb-5 line-clamp-2">
                        {srv.description}
                      </p>

                      {/* Tags Chips */}
                      <div className="flex flex-wrap gap-2">
                        {srv.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-100/90 text-slate-700 border border-slate-200/70"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Tap Indicator Bar */}
                    {isFront && (
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-slate-400">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0284C7]">
                          Tap to view next service →
                        </span>
                        <ChevronRight className="w-4 h-4 text-[#0284C7] animate-pulse" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Controls Bar & Direct Indicator Dots */}
            <div className="flex items-center justify-between mt-12 sm:mt-14 px-2">
              {/* Prev Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  cyclePrev();
                }}
                disabled={isAnimating}
                className="p-2.5 rounded-2xl bg-white/80 hover:bg-white text-slate-700 hover:text-[#0284C7] border border-white/90 shadow-sm transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50"
                aria-label="Previous card"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Indicator Dots */}
              <div className="flex items-center gap-2">
                {SERVICES.map((_, idx) => {
                  const isActive = deckOrder[0] === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        jumpToCard(idx);
                      }}
                      className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                        isActive
                          ? 'w-7 bg-[#0284C7]'
                          : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                      }`}
                      aria-label={`Jump to service ${idx + 1}`}
                    />
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  cycleNext();
                }}
                disabled={isAnimating}
                className="p-2.5 rounded-2xl bg-white/80 hover:bg-white text-slate-700 hover:text-[#0284C7] border border-white/90 shadow-sm transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50"
                aria-label="Next card"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

          </div>
        </ScrollReveal>

      </div>
    </section>
  );
};
