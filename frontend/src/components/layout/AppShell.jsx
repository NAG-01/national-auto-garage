import React, { useState } from 'react';
import { Sidebar } from './Sidebar.jsx';
import { Topbar } from './Topbar.jsx';

export const AppShell = ({ children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-50 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Desktop Layout Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar (Fixed 64 / 256px width on lg screens) */}
        <div className="hidden lg:block lg:w-64 lg:shrink-0 h-screen sticky top-0 z-30">
          <Sidebar />
        </div>

        {/* Mobile Slide-over Drawer Overlay */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Mobile Slide-over Sidebar Content */}
        <div
          className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-[#0F172A] z-50 transform transition-transform duration-200 ease-in-out lg:hidden ${
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar onClose={() => setMobileSidebarOpen(false)} />
        </div>

        {/* Main Content Viewport */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
          <Topbar onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
