import React, { useState } from 'react';
import { Phone, MessageSquare, ChevronRight, ChevronLeft, Sparkles, MousePointerClick } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal.jsx';

const STATS = [
  { id: 'exp', value: '15+', label: 'Years of Experience', color: 'text-[#0284C7]' },
  { id: 'bikes', value: '10,000+', label: 'Bikes Serviced', color: 'text-emerald-600' },
  { id: 'rating', value: '4.9 ★', label: 'Happy Customers', color: 'text-amber-600' },
  { id: 'pricing', value: '100%', label: 'Honest Pricing', color: 'text-slate-900' },
];

export const HeroSection = () => {
  const [deckOrder, setDeckOrder] = useState([0, 1, 2, 3]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [flippingCardId, setFlippingCardId] = useState(null);

  const cycleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    const activeIndex = deckOrder[0];
    setFlippingCardId(STATS[activeIndex].id);

    setTimeout(() => {
      setDeckOrder((prev) => {
        const next = [...prev];
        const top = next.shift();
        next.push(top);
        return next;
      });
      setFlippingCardId(null);
      setIsAnimating(false);
    }, 400);
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
    setTimeout(() => setIsAnimating(false), 350);
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
    setTimeout(() => setIsAnimating(false), 350);
  };

  return (
    <section id="home" className="relative bg-transparent text-slate-900 pt-10 pb-16 sm:pt-16 sm:pb-24 border-b border-slate-200/60 select-none overflow-hidden scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-5 sm:space-y-6">
          
          {/* Main Headline Reveal */}
          <ScrollReveal direction="up" delay={0}>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight uppercase leading-[1.2] sm:leading-[1.15]">
              Complete Bike Service &{' '}
              <span className="text-[#0284C7] drop-shadow-xs">
                Engine Repair
              </span>
            </h1>
          </ScrollReveal>

          {/* Subtitle Reveal */}
          <ScrollReveal direction="up" delay={100}>
            <p className="text-xs sm:text-base text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto px-2">
              Run by <strong>Imran Pathan & Naim Pathan</strong>. Full bike servicing, oil change, engine repair, battery check, and brake repair in Mosali.
            </p>
          </ScrollReveal>

          {/* Glass Action CTAs Reveal */}
          <ScrollReveal direction="up" delay={200}>
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
          </ScrollReveal>

        </div>

        {/* 1. DESKTOP VIEW: Full 4-Metric Grid (Hidden on Mobile) */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mt-12 sm:mt-16">
          {STATS.map((st, idx) => (
            <ScrollReveal key={st.id} direction="up" delay={idx * 100}>
              <div className="p-4 sm:p-6 rounded-3xl bg-white/60 hover:bg-white/85 backdrop-blur-xl border border-white/80 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center">
                <div className={`text-xl sm:text-3xl font-black ${st.color}`}>{st.value}</div>
                <div className="text-[11px] sm:text-xs text-slate-600 font-bold uppercase tracking-wider mt-1">
                  {st.label}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* 2. MOBILE VIEW ONLY: Interactive Stacked Card Deck (Hidden on Desktop) */}
        <div className="block sm:hidden mt-10">
          <ScrollReveal direction="up" delay={100}>
            <div className="max-w-xs mx-auto relative px-1 pb-2">
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-1 text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-[#0284C7] animate-pulse" />
                  <span>Highlight {deckOrder[0] + 1} of {STATS.length}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                  <MousePointerClick className="w-3 h-3 text-slate-500" />
                  <span>Tap card</span>
                </div>
              </div>

              <div
                className="relative w-full h-[120px] cursor-pointer touch-pan-y"
                onClick={cycleNext}
                tabIndex={0}
                role="button"
                aria-label="Cycle next highlight metric"
              >
                {STATS.map((st, originalIndex) => {
                  const stackPos = deckOrder.indexOf(originalIndex);
                  const isFront = stackPos === 0;
                  const isFlipping = flippingCardId === st.id;

                  const translateY = Math.min(stackPos * 10, 30);
                  const scale = Math.max(1 - stackPos * 0.04, 0.88);
                  const opacity = isFront ? 1 : Math.max(1 - stackPos * 0.15, 0.6);
                  const zIndex = 30 - stackPos * 5;

                  return (
                    <div
                      key={st.id}
                      className={`absolute inset-x-0 top-0 p-4 rounded-3xl backdrop-blur-2xl border transition-all ease-[cubic-bezier(0.16,1,0.3,1)] select-none text-center flex flex-col justify-center ${
                        isFlipping
                          ? 'duration-400 -translate-y-6 -translate-x-4 scale-90 opacity-30 z-40 rotate-[-1.5deg]'
                          : 'duration-500'
                      } ${
                        isFront
                          ? 'bg-white/95 border-white shadow-xl shadow-slate-900/10'
                          : 'bg-white/75 border-white/80 shadow-md'
                      }`}
                      style={{
                        transform: isFlipping
                          ? 'translate3d(-16px, -24px, 0) scale(0.9) rotate(-1.5deg)'
                          : `translate3d(0px, ${translateY}px, 0px) scale(${scale})`,
                        opacity: isFlipping ? 0.3 : opacity,
                        zIndex: isFlipping ? 40 : zIndex,
                      }}
                    >
                      <div className={`text-2xl font-black ${st.color}`}>{st.value}</div>
                      <div className="text-xs text-slate-600 font-bold uppercase tracking-wider mt-1">
                        {st.label}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between mt-8 px-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    cyclePrev();
                  }}
                  disabled={isAnimating}
                  className="p-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1.5">
                  {STATS.map((_, idx) => (
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
                  className="p-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs cursor-pointer"
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
