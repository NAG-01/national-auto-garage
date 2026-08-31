import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { Topbar } from './Topbar.jsx';

export const AppShell = ({ children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased selection:bg-[#0284C7] selection:text-white relative overflow-hidden">
      
      {/* Ambient Glassmorphism Gradient Glow Orbs */}
      <div className="fixed top-0 left-1/4 w-[28rem] h-[28rem] bg-sky-300/20 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="fixed top-1/3 right-10 w-[32rem] h-[32rem] bg-blue-300/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-1/4 left-10 w-[24rem] h-[24rem] bg-emerald-300/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-1/3 w-[26rem] h-[26rem] bg-indigo-300/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Layout Container */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Persistent Sidebar for Medium & Desktop Screens (768px+) */}
        <div className="hidden md:block md:w-68 md:shrink-0 h-screen sticky top-0 z-30">
          <Sidebar />
        </div>

        {/* Mobile Slide-over Drawer Overlay */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-40 md:hidden transition-opacity duration-300 animate-in fade-in"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Mobile Slide-over Sidebar Drawer */}
        <div
          className={`fixed inset-y-0 left-0 w-[84vw] max-w-[320px] bg-slate-950/95 backdrop-blur-2xl z-50 transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] md:hidden shadow-2xl rounded-r-3xl border-r border-slate-800/80 overflow-hidden flex flex-col ${
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar onClose={() => setMobileSidebarOpen(false)} />
        </div>

        {/* Main Content Viewport */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto overflow-x-hidden">
          <Topbar onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />
          <main className="flex-1 p-3 sm:p-5 md:p-6 max-w-7xl w-full mx-auto space-y-5 overflow-x-hidden">
            {children || <Outlet />}
          </main>
        </div>
      </div>
    </div>
  );
};
