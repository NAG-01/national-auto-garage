import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Phone,
  MessageSquare,
  Menu,
  X,
  ChevronRight,
  Navigation,
  Home,
  Wrench,
  Award,
  MapPin,
} from 'lucide-react';
import garageLogo from '../../assets/garage_logo.jpg';
import { useWebsiteConfig } from '../context/WebsiteConfigContext.jsx';

export const PublicNavbar = () => {
  const { config } = useWebsiteConfig();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);

      // Section scrollSpy
      const sections = ['home', 'services', 'why-us', 'contact'];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Close mobile menu on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const scrollToTop = (e) => {
    if (e) e.preventDefault();
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      window.location.href = '/';
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      window.location.href = `/#${id}`;
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const NAV_ITEMS = [
    { id: 'home', label: 'Home', icon: Home, desc: 'Overview & Highlights' },
    { id: 'services', label: 'Services', icon: Wrench, desc: 'Bike Service & Repairs' },
    { id: 'why-us', label: 'Why Us', icon: Award, desc: 'Experience & Trust' },
    { id: 'contact', label: 'Contact & Location', icon: MapPin, desc: 'Mosali Chowkdi Workshop' },
  ];

  const currentLogo = config?.logoUrl || garageLogo;
  const whatsappUrl = `https://api.whatsapp.com/send?phone=91${config?.whatsappPhone || '9624844188'}&text=${encodeURIComponent(
    config?.whatsappInquiryText || 'Hello National Auto Garage, I want to inquire about bike service.'
  )}`;

  return (
    <>
      {/* Apple-Style Floating Glass Navbar Header */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full select-none transition-all duration-300">
        <nav
          className={`w-full transition-all duration-300 ${
            isScrolled || mobileMenuOpen
              ? 'bg-white/85 backdrop-blur-2xl backdrop-saturate-180 shadow-lg shadow-slate-900/5 border-b border-white/80 py-2.5 sm:py-3'
              : 'bg-white/70 backdrop-blur-xl backdrop-saturate-150 border-b border-white/60 py-3 sm:py-4'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            
            {/* 3D Luxury Badge Logo & Brand Title (Click to Scroll Top) */}
            <button
              type="button"
              onClick={scrollToTop}
              className="flex items-center gap-3 sm:gap-3.5 group shrink-0 text-left cursor-pointer transition-transform duration-200 active:scale-95"
            >
              <div className="relative">
                <img
                  src={currentLogo}
                  alt={config?.garageName || 'National Auto Garage'}
                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover shadow-md shadow-sky-500/20 group-hover:scale-105 group-hover:rotate-6 transition-all duration-300 ring-2 ring-white/90 ring-offset-1 ring-offset-sky-100"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-2xs" />
              </div>
              <div className="leading-tight">
                <div className="text-sm sm:text-lg font-black text-slate-900 tracking-tight uppercase group-hover:text-[#0284C7] transition-colors flex items-center gap-1.5">
                  <span>National Auto</span>
                  <span className="text-[#0284C7] drop-shadow-xs">Garage</span>
                </div>
                <div className="text-[9px] sm:text-[10px] text-slate-500 font-extrabold tracking-wider uppercase flex items-center gap-1">
                  <span>Bike Service & Repair</span>
                  <span>•</span>
                  <span className="text-slate-700">Mosali</span>
                </div>
              </div>
            </button>

            {/* Desktop Navigation Links with Active Floating Pill */}
            <div className="hidden lg:flex items-center gap-1.5 p-1.5 rounded-full bg-slate-100/80 backdrop-blur-md border border-white/80 shadow-inner">
              {NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollToSection(item.id)}
                    className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'bg-white text-[#0284C7] shadow-md shadow-slate-900/5 scale-105'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Desktop Action Buttons (WhatsApp) */}
            <div className="hidden sm:flex items-center gap-2.5">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 backdrop-blur-md shadow-md shadow-emerald-600/20 border border-emerald-400/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="flex sm:hidden items-center">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`p-2.5 rounded-2xl border transition-all duration-300 active:scale-90 cursor-pointer shadow-xs ${
                  mobileMenuOpen
                    ? 'bg-sky-50 border-sky-200 text-[#0284C7]'
                    : 'bg-white/80 hover:bg-white text-slate-800 border-white/90'
                }`}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                <div className="relative w-5 h-5 flex items-center justify-center">
                  <Menu
                    className={`w-5 h-5 absolute transition-all duration-300 ${
                      mobileMenuOpen ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
                    }`}
                  />
                  <X
                    className={`w-5 h-5 absolute transition-all duration-300 ${
                      mobileMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
                    }`}
                  />
                </div>
              </button>
            </div>

          </div>
        </nav>
      </header>

      {/* Backdrop Dimmer */}
      <div
        className={`fixed inset-0 top-[57px] sm:top-[65px] bg-slate-900/30 backdrop-blur-xs transition-opacity duration-500 ease-out z-30 lg:hidden ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* iOS 18 / VisionOS Gliding Mobile Menu Panel */}
      <div
        className={`fixed inset-x-0 top-[57px] sm:top-[65px] bottom-0 z-40 lg:hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          mobileMenuOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-8 pointer-events-none'
        }`}
      >
        <div className="h-full bg-white/95 backdrop-blur-2xl flex flex-col justify-between p-5 overflow-y-auto shadow-2xl border-b border-slate-200/80">
          
          {/* Navigation Items */}
          <div className="space-y-2.5 pt-2">
            {NAV_ITEMS.map((item, idx) => {
              const ItemIcon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border flex items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] cursor-pointer group ${
                    isActive
                      ? 'bg-sky-50 border-sky-300 text-[#0284C7] shadow-sm'
                      : 'bg-slate-50/90 hover:bg-white border-slate-200/70 text-slate-900'
                  } ${mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{
                    transitionDelay: mobileMenuOpen ? `${idx * 45}ms` : '0ms',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl border shadow-2xs transition-colors duration-200 ${
                        isActive
                          ? 'bg-[#0284C7] text-white border-sky-400'
                          : 'bg-white text-[#0284C7] border-slate-200/60'
                      }`}
                    >
                      <ItemIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-black tracking-tight">{item.label}</div>
                      <div className="text-[10px] text-slate-400 font-medium normal-case">{item.desc}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0284C7] group-hover:translate-x-1 transition-all" />
                </button>
              );
            })}
          </div>

          {/* Fast Action Contacts */}
          <div
            className={`pt-4 pb-2 border-t border-slate-200/80 space-y-3 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{
              transitionDelay: mobileMenuOpen ? '200ms' : '0ms',
            }}
          >
            <div className="grid grid-cols-2 gap-2.5">
              <a
                href={`tel:+91${config?.mechanic1Phone || '9624844188'}`}
                className="py-3 px-3 rounded-2xl bg-white hover:bg-sky-50 text-slate-900 font-bold text-xs flex flex-col items-center justify-center gap-1 border border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-md transition-all duration-200 active:scale-98"
              >
                <div className="flex items-center gap-1 text-[#0284C7]">
                  <Phone className="w-3.5 h-3.5" />
                  <span className="text-[10px] uppercase font-bold text-slate-500">{config?.mechanic1Name || 'Imran Pathan'}</span>
                </div>
                <span className="font-mono font-black text-xs">{config?.mechanic1Phone || '96248 44188'}</span>
              </a>

              <a
                href={`tel:+91${config?.mechanic2Phone || '8128144350'}`}
                className="py-3 px-3 rounded-2xl bg-white hover:bg-sky-50 text-slate-900 font-bold text-xs flex flex-col items-center justify-center gap-1 border border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-md transition-all duration-200 active:scale-98"
              >
                <div className="flex items-center gap-1 text-[#0284C7]">
                  <Phone className="w-3.5 h-3.5" />
                  <span className="text-[10px] uppercase font-bold text-slate-500">{config?.mechanic2Name || 'Naim Pathan'}</span>
                </div>
                <span className="font-mono font-black text-xs">{config?.mechanic2Phone || '81281 44350'}</span>
              </a>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 hover:shadow-xl active:scale-98 transition-all duration-200"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
            </a>

            <a
              href={config?.googleMapsUrl || 'https://maps.app.goo.gl/skxxbgWa1k7Zrzef9'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-4 rounded-xl text-center text-slate-600 hover:text-[#0284C7] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5 text-sky-500" />
              <span>Mosali Chowkdi, Mangrol</span>
            </a>
          </div>

        </div>
      </div>
    </>
  );
};
