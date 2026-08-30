import React from 'react';
import {
  MapPin,
  Phone,
  MessageSquare,
  Clock,
  Navigation,
} from 'lucide-react';

export const ContactSection = () => {
  return (
    <section id="contact" className="py-14 sm:py-18 bg-transparent text-slate-900 relative select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
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

        {/* Concise Contact Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Card 1: Accurate Workshop Address & Google Map Link */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white/65 hover:bg-white/95 backdrop-blur-xl border border-white/80 shadow-md shadow-slate-200/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between space-y-5">
            <div className="space-y-3.5">
              <div className="w-11 h-11 rounded-2xl bg-rose-50/90 border border-rose-200/60 text-rose-600 flex items-center justify-center backdrop-blur-md">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">Garage Address</h3>
              <div className="text-xs text-slate-700 font-medium leading-relaxed space-y-0.5">
                <div className="font-bold text-slate-900 text-sm">National Auto Garage</div>
                <div>Near White House Petrol Pump, Mosali Chowkdi,</div>
                <div>Mosali, Mangrol, Surat - 394421</div>
              </div>
            </div>

            <a
              href="https://maps.app.goo.gl/skxxbgWa1k7Zrzef9"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-2xl bg-slate-900/90 hover:bg-[#0284C7] backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 shadow-md active:scale-98"
            >
              <Navigation className="w-4 h-4 text-sky-400" />
              <span>Open in Google Maps</span>
            </a>
          </div>

          {/* Card 2: Contact Mechanics */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white/65 hover:bg-white/95 backdrop-blur-xl border border-white/80 shadow-md shadow-slate-200/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between space-y-5">
            <div className="space-y-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50/90 border border-emerald-200/60 text-emerald-600 flex items-center justify-center backdrop-blur-md">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">Contact Mechanics</h3>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Imran Pathan */}
                <a
                  href="tel:+919624844188"
                  className="p-2.5 rounded-2xl bg-white/80 border border-white/90 shadow-2xs hover:bg-sky-50 transition-colors block text-center"
                >
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Imran Pathan</span>
                  <span className="text-xs font-black font-mono text-[#0284C7]">96248 44188</span>
                </a>

                {/* Naim Pathan */}
                <a
                  href="tel:+918128144350"
                  className="p-2.5 rounded-2xl bg-white/80 border border-white/90 shadow-2xs hover:bg-sky-50 transition-colors block text-center"
                >
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Naim Pathan</span>
                  <span className="text-xs font-black font-mono text-[#0284C7]">81281 44350</span>
                </a>
              </div>
            </div>

            <a
              href="https://api.whatsapp.com/send?phone=919624844188&text=Hello%20National%20Auto%20Garage,%20I%20want%20to%20inquire%20about%20bike%20service."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-2xl bg-emerald-600/90 hover:bg-emerald-600 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all duration-200 active:scale-98"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>

          {/* Card 3: Working Hours */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white/65 hover:bg-white/95 backdrop-blur-xl border border-white/80 shadow-md shadow-slate-200/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between space-y-5">
            <div className="space-y-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-50/90 border border-amber-200/60 text-amber-700 flex items-center justify-center backdrop-blur-md">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">Opening Hours</h3>
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200/60 font-medium">
                  <span>Mon - Sat:</span>
                  <span className="font-bold text-slate-900 font-mono">9:00 AM - 9:00 PM</span>
                </div>
                <div className="flex items-center justify-between pb-1 border-b border-slate-200/60 font-medium">
                  <span>Sunday:</span>
                  <span className="font-bold text-emerald-700 font-mono">9:00 AM - 2:00 PM</span>
                </div>
              </div>
            </div>

            <a
              href="tel:+919624844188"
              className="w-full py-2.5 px-4 rounded-2xl bg-white/70 hover:bg-[#0284C7] backdrop-blur-md text-slate-800 hover:text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border border-white/90 hover:border-[#0284C7] transition-all duration-200 active:scale-98 shadow-2xs"
            >
              <Phone className="w-4 h-4" />
              <span>Call for Help</span>
            </a>
          </div>

        </div>

      </div>
    </section>
  );
};
