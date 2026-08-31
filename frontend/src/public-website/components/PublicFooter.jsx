import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ExternalLink,
  ChevronRight,
  MapPin,
  Phone,
} from 'lucide-react';
import garageLogo from '../../assets/garage_logo.jpg';
import { useWebsiteConfig } from '../context/WebsiteConfigContext.jsx';

export const PublicFooter = () => {
  const navigate = useNavigate();
  const { config } = useWebsiteConfig();

  const currentLogo = config?.logoUrl || garageLogo;
  const garageName = config?.garageName || 'National Auto Garage';
  const aboutText = config?.footerAboutText || 'Premier two-wheeler workshop at Mosali Chowkdi providing periodic maintenance, precision engine rebuilds, and genuine spare parts.';
  const addressName = config?.garageAddressName || garageName;
  const address1 = config?.addressLine1 || 'Near White House Petrol Pump, Mosali Chowkdi';
  const address2 = config?.addressLine2 || 'Mosali, Taluka: Mangrol, Dist: Surat, Gujarat – 394421';
  const mapsUrl = config?.googleMapsUrl || 'https://maps.app.goo.gl/skxxbgWa1k7Zrzef9';
  const m1Name = config?.mechanic1Name || 'Imran Pathan';
  const m1Phone = config?.mechanic1Phone || '9624844188';
  const m2Name = config?.mechanic2Name || 'Naim Pathan';
  const m2Phone = config?.mechanic2Phone || '8128144350';

  return (
    <footer className="relative bg-slate-950/90 backdrop-blur-2xl text-slate-400 border-t border-slate-800/80 pt-16 pb-12 select-none overflow-hidden">
      
      {/* Footer Ambient Background Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800/80 text-center sm:text-left">
          
          {/* Col 1: Official Logo & Brand Info */}
          <div className="space-y-4 flex flex-col items-center sm:items-start">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <img
                src={currentLogo}
                alt={`${garageName} Logo`}
                className="h-14 w-14 rounded-full object-cover shadow-xl border-2 border-slate-700/80 ring-2 ring-sky-500/20"
              />
              <div className="text-center sm:text-left">
                <span className="text-base font-black text-white uppercase tracking-tight block">
                  National Auto <span className="text-[#38BDF8]">Garage</span>
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Bike Service & Repair • Mosali
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-sm">
              {aboutText}
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3 flex flex-col items-center sm:items-start">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs font-semibold flex flex-col items-center sm:items-start">
              <li>
                <a href="#home" className="hover:text-sky-400 transition-colors duration-200 flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-slate-600 hidden sm:inline" /> Home
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-sky-400 transition-colors duration-200 flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-slate-600 hidden sm:inline" /> Bike Services
                </a>
              </li>
              <li>
                <a href="#why-us" className="hover:text-sky-400 transition-colors duration-200 flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-slate-600 hidden sm:inline" /> Why Us
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-sky-400 transition-colors duration-200 flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-slate-600 hidden sm:inline" /> Contact & Location
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Workshop Address - Professional Way */}
          <div className="space-y-3 flex flex-col items-center sm:items-start">
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400" /> Workshop Location
            </h4>
            <div className="text-xs text-slate-300 space-y-1 font-medium leading-relaxed">
              <div className="font-bold text-white text-sm">{addressName}</div>
              <div>{address1}</div>
              <div>{address2}</div>
              <div className="pt-2.5 flex justify-center sm:justify-start">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-sky-500 text-sky-400 hover:text-white border border-slate-800 hover:border-sky-400 text-[11px] font-bold tracking-wide transition-all duration-200 shadow-xs"
                >
                  <span>Get Directions on Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Col 4: Garage Direct Contacts */}
          <div className="space-y-3 flex flex-col items-center sm:items-start">
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" /> Phone Numbers
            </h4>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 font-bold block text-[10px] uppercase">{m1Name}</span>
                <a
                  href={`tel:+91${m1Phone}`}
                  className="text-white hover:text-sky-400 font-mono font-bold transition-colors duration-200 text-sm"
                >
                  +91 {m1Phone}
                </a>
              </div>

              <div>
                <span className="text-slate-500 font-bold block text-[10px] uppercase">{m2Name}</span>
                <a
                  href={`tel:+91${m2Phone}`}
                  className="text-white hover:text-sky-400 font-mono font-bold transition-colors duration-200 text-sm"
                >
                  +91 {m2Phone}
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright (Double click to open admin) & Developer Attribution */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-500 text-center sm:text-left">
          <div
            onDoubleClick={() => navigate('/admin')}
            title="Double-click for Admin Access"
            className="cursor-default hover:text-slate-300 transition-colors select-none"
          >
            © {new Date().getFullYear()} {garageName}. All rights reserved.
          </div>

          <div>
            <a
              href="https://www.linkedin.com/in/maazpathan07"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-slate-400 hover:text-[#38BDF8] font-bold transition-colors duration-200"
            >
              <span>Developed by Maaz Pathan</span>
              <ExternalLink className="w-3 h-3 inline" />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};
