import React from 'react';
import { WebsiteConfigProvider } from '../context/WebsiteConfigContext.jsx';
import { PublicNavbar } from '../components/PublicNavbar.jsx';
import { HeroSection } from '../components/HeroSection.jsx';
import { ServicesSection } from '../components/ServicesSection.jsx';
import { WhyChooseUs } from '../components/WhyChooseUs.jsx';
import { ContactSection } from '../components/ContactSection.jsx';
import { PublicFooter } from '../components/PublicFooter.jsx';

export const PublicHomePage = () => {
  return (
    <WebsiteConfigProvider>
      <div className="relative min-h-screen bg-slate-100/60 text-slate-900 flex flex-col font-sans selection:bg-[#0284C7] selection:text-white overflow-hidden pt-16 sm:pt-20">
        
        {/* Ambient Glassmorphism Gradient Glows */}
        <div className="fixed top-0 left-1/4 w-96 h-96 bg-sky-300/30 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
        <div className="fixed top-1/3 right-10 w-[30rem] h-[30rem] bg-blue-300/25 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="fixed bottom-1/4 left-10 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="fixed bottom-10 right-1/3 w-80 h-80 bg-indigo-300/20 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Top Fixed Navigation */}
        <PublicNavbar />

        {/* Hero Banner Section */}
        <HeroSection />

        {/* Workshop Services Section */}
        <ServicesSection />

        {/* Why Choose Us */}
        <WhyChooseUs />

        {/* Workshop Location & Timings */}
        <ContactSection />

        {/* Footer */}
        <PublicFooter />
      </div>
    </WebsiteConfigProvider>
  );
};
