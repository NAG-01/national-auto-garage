import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  MessageSquare,
  Clock,
  Navigation,
  ChevronRight,
  ChevronLeft,
  MousePointerClick,
  Sparkles,
} from 'lucide-react';
import { ScrollReveal } from './ScrollReveal.jsx';
import contactAddressBg from '../../assets/contact_address_bg.jpg';
import contactMechanicsBg from '../../assets/contact_mechanics_bg.jpg';
import contactHoursBg from '../../assets/contact_hours_bg.jpg';
import { useWebsiteConfig } from '../context/WebsiteConfigContext.jsx';

export const ContactSection = () => {
  const { config } = useWebsiteConfig();

  const m1Name = config?.mechanic1Name || 'Imran Pathan';
  const m1Phone = config?.mechanic1Phone || '9624844188';
  const m2Name = config?.mechanic2Name || 'Naim Pathan';
  const m2Phone = config?.mechanic2Phone || '8128144350';
  const whatsappPhone = config?.whatsappPhone || '9624844188';
  const whatsappInquiryText = config?.whatsappInquiryText || 'Hello National Auto Garage, I want to inquire about bike service.';
  const mapsUrl = config?.googleMapsUrl || 'https://maps.app.goo.gl/skxxbgWa1k7Zrzef9';
  const addressName = config?.garageAddressName || config?.garageName || 'National Auto Garage';
  const address1 = config?.addressLine1 || 'Near White House Petrol Pump, Mosali Chowkdi';
  const address2 = config?.addressLine2 || 'Mosali, Mangrol, Surat - 394421';
  const hoursMonSat = config?.openingHoursMonSat || '9:00 AM - 9:00 PM';
  const hoursSun = config?.openingHoursSun || '9:00 AM - 2:00 PM';

  const CONTACT_CARDS = [
    {
      id: 'address',
      icon: MapPin,
      iconBg: 'bg-rose-50 border-rose-200 text-rose-600',
      title: 'Garage Address',
      type: 'address',
      bgImage: contactAddressBg,
    },
    {
      id: 'mechanics',
      icon: Phone,
      iconBg: 'bg-emerald-50 border-emerald-200 text-emerald-600',
      title: 'Contact Mechanics',
      type: 'mechanics',
      bgImage: contactMechanicsBg,
    },
    {
      id: 'hours',
      icon: Clock,
      iconBg: 'bg-amber-50 border-amber-200 text-amber-700',
      title: 'Opening Hours',
      type: 'hours',
      bgImage: contactHoursBg,
    },
  ];

  const [deckOrder, setDeckOrder] = useState([0, 1, 2]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [flippingCardId, setFlippingCardId] = useState(null);

  const cycleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    const activeIndex = deckOrder[0];
    setFlippingCardId(CONTACT_CARDS[activeIndex].id);

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

  const renderCardBody = (item) => {
    if (item.type === 'address') {
      return (
        <div className="flex flex-col justify-between h-full relative z-10">
          <div className="space-y-1.5 max-w-[54%]">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shadow-2xs">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">Garage Address</h3>
            </div>
            <div className="text-[10px] sm:text-xs text-slate-800 font-extrabold leading-snug space-y-0.5">
              <div className="font-extrabold text-slate-900 text-xs">{addressName}</div>
              <div>{address1}</div>
              <div>{address2}</div>
            </div>
          </div>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-full py-2 px-3 rounded-xl bg-slate-900/95 hover:bg-[#0284C7] text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-98 relative z-20 shrink-0"
          >
            <Navigation className="w-3 h-3 text-sky-400" />
            <span>Open in Google Maps</span>
          </a>
        </div>
      );
    }

    if (item.type === 'mechanics') {
      return (
        <div className="flex flex-col justify-between h-full relative z-10">
          <div className="space-y-1.5 max-w-[54%]">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-2xs">
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">Contact Mechanics</h3>
            </div>
            
            <div className="flex flex-col gap-1 text-[10px] sm:text-xs">
              <a
                href={`tel:+91${m1Phone}`}
                onClick={(e) => e.stopPropagation()}
                className="p-1 px-2 rounded-lg bg-white/95 border border-slate-200 shadow-2xs hover:bg-sky-50 transition-colors block text-left"
              >
                <span className="text-[8px] text-slate-500 font-extrabold block uppercase leading-none">{m1Name}</span>
                <span className="text-[10px] sm:text-xs font-black font-mono text-[#0284C7]">{m1Phone}</span>
              </a>

              <a
                href={`tel:+91${m2Phone}`}
                onClick={(e) => e.stopPropagation()}
                className="p-1 px-2 rounded-lg bg-white/95 border border-slate-200 shadow-2xs hover:bg-sky-50 transition-colors block text-left"
              >
                <span className="text-[8px] text-slate-500 font-extrabold block uppercase leading-none">{m2Name}</span>
                <span className="text-[10px] sm:text-xs font-black font-mono text-[#0284C7]">{m2Phone}</span>
              </a>
            </div>
          </div>

          <a
            href={`https://api.whatsapp.com/send?phone=91${whatsappPhone}&text=${encodeURIComponent(whatsappInquiryText)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-98 relative z-20 shrink-0"
          >
            <MessageSquare className="w-3 h-3" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      );
    }

    return (
      <div className="flex flex-col justify-between h-full relative z-10">
        <div className="space-y-1.5 max-w-[54%]">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shadow-2xs">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">Opening Hours</h3>
          </div>
          <div className="space-y-1 text-[10px] sm:text-xs text-slate-800 font-extrabold">
            <div className="flex flex-col pb-0.5 border-b border-slate-200">
              <span className="text-[8px] text-slate-500 uppercase leading-none">Mon - Sat:</span>
              <span className="font-black text-slate-900 font-mono">{hoursMonSat}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 uppercase leading-none">Sunday:</span>
              <span className="font-black text-emerald-800 font-mono">{hoursSun}</span>
            </div>
          </div>
        </div>

        <a
          href={`tel:+91${m1Phone}`}
          onClick={(e) => e.stopPropagation()}
          className="w-full py-2 px-3 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm border border-sky-400/30 transition-all active:scale-98 cursor-pointer relative z-20 shrink-0"
        >
          <Phone className="w-3 h-3" />
          <span>Call for Help</span>
        </a>
      </div>
    );
  };

  return (
    <section id="contact" className="py-14 sm:py-18 bg-transparent text-slate-900 relative select-none scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <ScrollReveal direction="up" delay={0}>
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-white/80 text-[#0284C7] text-xs font-bold uppercase tracking-wider mb-2.5 shadow-xs">
              <MapPin className="w-3.5 h-3.5" /> Visit Us
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">
              Location & Contact Details
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1.5">
              Come visit us at Mosali Chowkdi for quick bike service, oil change, or engine repair.
            </p>
          </div>
        </ScrollReveal>

        {/* 1. DESKTOP VIEW: Full 3-Card Grid (Hidden on Mobile) */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-4 sm:gap-6">
          {CONTACT_CARDS.map((card, idx) => (
            <ScrollReveal key={card.id} direction="up" delay={idx * 100}>
              <div className="group relative p-5 sm:p-6 rounded-3xl bg-white backdrop-blur-xl border border-slate-200/80 hover:border-[#0284C7]/40 shadow-md shadow-slate-200/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full overflow-hidden min-h-[220px]">
                
                {/* Background Image with Precision Gradient Mask */}
                {card.bgImage && (
                  <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-3xl">
                    <img
                      src={card.bgImage}
                      alt={card.title}
                      className="w-full h-full object-cover object-right opacity-100 transition-all duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,#ffffff_0%,#ffffff_26%,rgba(255,255,255,0.5)_38%,transparent_52%)]" />
                  </div>
                )}

                {renderCardBody(card)}
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* 2. MOBILE VIEW ONLY: 3-Layered Rounded Deck (Hidden on Desktop) */}
        <div className="block lg:hidden">
          <ScrollReveal direction="up" delay={100}>
            <div className="max-w-md mx-auto relative px-1 pb-2">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-1 text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                  <span>Contact {deckOrder[0] + 1} of {CONTACT_CARDS.length}</span>
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
                aria-label="Cycle next contact info"
              >
                {CONTACT_CARDS.map((item, originalIndex) => {
                  const stackPos = deckOrder.indexOf(originalIndex);
                  const isFront = stackPos === 0;
                  const isFlipping = flippingCardId === item.id;

                  const translateY = Math.min(stackPos * 18, 54);
                  const scale = Math.max(1 - stackPos * 0.04, 0.88);
                  const opacity = isFront ? 1 : Math.max(1 - stackPos * 0.15, 0.70);
                  const zIndex = 30 - stackPos * 5;

                  return (
                    <div
                      key={item.id}
                      className={`absolute inset-x-0 top-0 h-[210px] p-4 rounded-3xl backdrop-blur-2xl border select-none will-change-transform overflow-hidden ${
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
                      {/* Background Image on Front Card */}
                      {isFront && item.bgImage && (
                        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-3xl">
                          <img
                            src={item.bgImage}
                            alt={item.title}
                            className="w-full h-full object-cover object-right opacity-100"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-[linear-gradient(90deg,#ffffff_0%,#ffffff_26%,rgba(255,255,255,0.5)_38%,transparent_52%)]" />
                        </div>
                      )}

                      {/* Hide inner text on rear cards */}
                      <div className={isFront ? 'opacity-100 h-full' : 'opacity-0 invisible h-full'}>
                        {renderCardBody(item)}
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
                  {CONTACT_CARDS.map((_, idx) => (
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
