import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { Topbar } from './Topbar.jsx';

export const AppShell = ({ children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-[#0284C7] selection:text-white">
      {/* Main Layout Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Persistent Sidebar for Medium & Desktop Screens (768px+) */}
        <div className="hidden md:block md:w-64 md:shrink-0 h-screen sticky top-0 z-30">
          <Sidebar />
        </div>

        {/* Mobile Slide-over Drawer Overlay */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Mobile Slide-over Sidebar Content */}
        <div
          className={`fixed inset-y-0 left-0 w-64 bg-[#0F172A] z-50 transform transition-transform duration-200 ease-in-out md:hidden ${
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
