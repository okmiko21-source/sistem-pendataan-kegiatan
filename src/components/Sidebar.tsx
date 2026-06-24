import { useState } from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  PlusCircle, 
  Database, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  FolderHeart
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  integrationMode: 'local' | 'gas';
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  darkMode, 
  setDarkMode, 
  isMobileOpen, 
  setIsMobileOpen,
  integrationMode
}: SidebarProps) {

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'list', label: 'Data Kegiatan', icon: Calendar },
    { id: 'form', label: 'Tambah Kegiatan', icon: PlusCircle },
    { id: 'integration', label: 'Integrasi Sheets & Drive', icon: Database },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-md border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          aria-label="Toggle Menu"
          id="btn-sidebar-toggle"
        >
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        id="sidebar-container"
        className={`fixed top-0 bottom-0 left-0 z-40 w-68 bg-white dark:bg-slate-900 border-r border-slate-200/60 dark:border-slate-800/60 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header/Brand */}
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 dark:bg-indigo-500 rounded-xl text-white shadow-lg shadow-indigo-500/20">
              <FolderHeart size={22} />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                Sispen Kegiatan
              </h1>
              <p className="text-xxs font-mono text-slate-500 dark:text-slate-400 mt-0.5 uppercase tracking-wider">
                PRO EDITION v1.0
              </p>
            </div>
          </div>

          {/* Integration Status Badge */}
          <div className="mt-6 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">Mode:</span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xxs font-semibold ${
              integrationMode === 'gas' 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
            }`}>
              {integrationMode === 'gas' ? 'Google Sheets' : 'Local Storage'}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="px-4 py-2 space-y-1.5 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`btn-menu-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-slate-900 text-white dark:bg-indigo-600 dark:text-white shadow-md' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <button
            id="btn-theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            <span className="flex items-center gap-3">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              <span>{darkMode ? 'Mode Terang' : 'Mode Gelap'}</span>
            </span>
            <div className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-300 ${
              darkMode ? 'bg-indigo-600' : 'bg-slate-300'
            }`}>
              <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                darkMode ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}
