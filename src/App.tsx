import { useState, useEffect } from 'react';
import { Kegiatan, IntegrationSettings, FotoInfo } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ActivityForm from './components/ActivityForm';
import ActivityList from './components/ActivityList';
import ActivityDetailModal from './components/ActivityDetailModal';
import IntegrationConfig from './components/IntegrationConfig';
import { api, getSettings, saveSettings } from './utils/gasClient';
import { 
  Database, 
  CheckCircle, 
  X, 
  AlertCircle, 
  Info,
  ServerCrash
} from 'lucide-react';

export default function App() {
  // Tabs & Layout state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  // Settings & Theme
  const [integrationSettings, setIntegrationSettings] = useState<IntegrationSettings>({ mode: 'local', gasUrl: '' });
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Main Data States
  const [kegiatanList, setKegiatanList] = useState<Kegiatan[]>([]);
  const [editingKegiatan, setEditingKegiatan] = useState<Kegiatan | null>(null);
  const [viewingKegiatan, setViewingKegiatan] = useState<Kegiatan | null>(null);

  // Status indicators
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Load initial settings and data
  useEffect(() => {
    // 1. Theme Loading
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setDarkMode(isDark);

    // 2. Integration Settings Loading
    const settings = getSettings();
    setIntegrationSettings(settings);
  }, []);

  // Sync theme to DOM
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Load Kegiatan list whenever settings change
  const fetchKegiatan = async (settings: IntegrationSettings) => {
    setIsLoading(true);
    try {
      const data = await api.getKegiatanList(settings);
      setKegiatanList(data);
    } catch (err: any) {
      console.error(err);
      triggerAlert('error', 'Gagal menyinkronkan data dari Google Sheets. Pastikan URL Web App Anda benar dan status deployment aktif.');
      // Auto fallback to local if Sheets fetch crashed and URL is empty
      if (!settings.gasUrl) {
        const fallbackSettings: IntegrationSettings = { mode: 'local', gasUrl: '' };
        setIntegrationSettings(fallbackSettings);
        saveSettings(fallbackSettings);
        const localData = await api.getKegiatanList(fallbackSettings);
        setKegiatanList(localData);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKegiatan(integrationSettings);
  }, [integrationSettings]);

  // Alert/Toast manager helper
  const triggerAlert = (type: 'success' | 'error' | 'info', message: string) => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert(null);
    }, 5000);
  };

  // Switch Settings & Save
  const handleSaveSettings = (newSettings: IntegrationSettings) => {
    setIntegrationSettings(newSettings);
    saveSettings(newSettings);
    triggerAlert('success', `Berhasil beralih ke Mode ${newSettings.mode === 'gas' ? 'Google Sheets' : 'Local Storage (Demo)'}`);
  };

  // Add / Edit submission
  const handleSaveKegiatan = async (
    kegiatan: Omit<Kegiatan, 'id' | 'fotos' | 'tanggalDibuat'>,
    newFiles?: { name: string; type: string; base64: string }[],
    deletedFotoIds?: string[]
  ) => {
    setIsLoading(true);
    try {
      if (editingKegiatan) {
        // Edit Mode
        const updated = await api.updateKegiatan(
          integrationSettings,
          editingKegiatan.id,
          kegiatan,
          newFiles,
          deletedFotoIds
        );
        triggerAlert('success', `Berhasil memperbarui data kegiatan: ${updated.namaKegiatan}`);
      } else {
        // Create Mode
        const created = await api.createKegiatan(
          integrationSettings,
          kegiatan,
          newFiles
        );
        triggerAlert('success', `Berhasil menambahkan kegiatan baru: ${created.namaKegiatan}`);
      }
      
      // Reload lists, reset editing state and return to lists
      setEditingKegiatan(null);
      await fetchKegiatan(integrationSettings);
      setActiveTab('list');
    } catch (err: any) {
      console.error(err);
      triggerAlert('error', err.message || 'Terjadi kesalahan saat menyimpan data kegiatan.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Action with secure user confirmation
  const handleDeleteKegiatan = async (id: string) => {
    const isConfirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus data kegiatan (${id})?\n\nPERINGATAN: Seluruh foto dokumentasi kegiatan ini di Google Drive Anda juga akan ikut terhapus secara permanen.`
    );

    if (!isConfirmed) return;

    setIsLoading(true);
    try {
      await api.deleteKegiatan(integrationSettings, id);
      triggerAlert('success', `Data kegiatan dengan ID ${id} berhasil dihapus.`);
      await fetchKegiatan(integrationSettings);
    } catch (err: any) {
      console.error(err);
      triggerAlert('error', err.message || 'Gagal menghapus kegiatan dari database Google Sheets.');
    } finally {
      setIsLoading(false);
    }
  };

  // Edit Navigation trigger
  const handleTriggerEdit = (kegiatan: Kegiatan) => {
    setEditingKegiatan(kegiatan);
    setActiveTab('form');
  };

  // Navigasi ke form kosong
  const handleTriggerCreateNew = () => {
    setEditingKegiatan(null);
    setActiveTab('form');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-850 dark:bg-slate-950 dark:text-slate-100 flex transition-colors duration-300">
      
      {/* Sidebar navigation */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'form') {
            setEditingKegiatan(null); // Clear editing if navigating to blank form
          }
        }}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        integrationMode={integrationSettings.mode}
      />

      {/* Main Content Pane */}
      <main className="flex-1 min-w-0 flex flex-col lg:pl-68 pt-16 lg:pt-0 relative">
        
        {/* Dynamic Page Alert Toasts */}
        {alert && (
          <div className="fixed top-6 right-6 z-50 max-w-sm w-full bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl shadow-xl p-4 flex gap-3.5 items-start animate-in slide-in-from-top-4 duration-300">
            {alert.type === 'success' ? (
              <CheckCircle size={20} className="text-emerald-500 mt-0.5 flex-shrink-0" />
            ) : alert.type === 'error' ? (
              <AlertCircle size={20} className="text-rose-500 mt-0.5 flex-shrink-0" />
            ) : (
              <Info size={20} className="text-indigo-500 mt-0.5 flex-shrink-0" />
            )}
            
            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-extrabold text-slate-950 dark:text-white uppercase tracking-wider font-mono">
                {alert.type === 'success' ? 'Sukses' : alert.type === 'error' ? 'Gagal' : 'Pemberitahuan'}
              </h5>
              <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed mt-1 font-medium">
                {alert.message}
              </p>
            </div>

            <button 
              onClick={() => setAlert(null)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 dark:text-slate-500 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Global connection failure warning bar */}
        {integrationSettings.mode === 'gas' && !integrationSettings.gasUrl && (
          <div className="bg-amber-600 text-white text-xs py-2.5 px-4 flex items-center justify-between gap-4 font-semibold text-center shadow-md">
            <span className="flex items-center gap-2 justify-center mx-auto">
              <ServerCrash size={14} />
              Anda memilih Mode Google Sheets, namun belum mengatur URL Web App. Silakan hubungkan lewat menu 'Integrasi Sheets' atau gunakan Mode Local Storage.
            </span>
            <button
              onClick={() => setActiveTab('integration')}
              className="px-3 py-1 bg-white hover:bg-slate-100 text-amber-700 font-extrabold text-[10px] rounded-lg transition-all shadow-xs"
            >
              Atur Sekarang
            </button>
          </div>
        )}

        {/* Content Wrapper */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <Dashboard 
              kegiatanList={kegiatanList}
              onNavigateToTab={(tab) => {
                setActiveTab(tab);
                if (tab === 'form') setEditingKegiatan(null);
              }}
              onViewDetail={setViewingKegiatan}
            />
          )}

          {activeTab === 'list' && (
            <ActivityList 
              kegiatanList={kegiatanList}
              onEdit={handleTriggerEdit}
              onDelete={handleDeleteKegiatan}
              onViewDetail={setViewingKegiatan}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'form' && (
            <ActivityForm 
              editingKegiatan={editingKegiatan}
              onSave={handleSaveKegiatan}
              onCancel={() => {
                setEditingKegiatan(null);
                setActiveTab('list');
              }}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'integration' && (
            <IntegrationConfig 
              settings={integrationSettings}
              onSaveSettings={handleSaveSettings}
              kegiatanList={kegiatanList}
              onImportMockData={() => fetchKegiatan({ mode: 'local', gasUrl: '' })}
            />
          )}
        </div>

        {/* Beautiful Footer */}
        <footer className="py-6 px-8 border-t border-slate-200/40 dark:border-slate-800 text-center text-xxs font-mono text-slate-400 dark:text-slate-500 mt-auto flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto w-full">
          <span>&copy; {new Date().getFullYear()} Sistem Pendataan Kegiatan. All Rights Reserved.</span>
          <span>Bebas Firebase &bull; Didukung Google Apps Script, Sheets, dan Drive</span>
        </footer>
      </main>

      {/* Activity Detail Modal overlay */}
      {viewingKegiatan && (
        <ActivityDetailModal 
          kegiatan={viewingKegiatan}
          onClose={() => setViewingKegiatan(null)}
        />
      )}

    </div>
  );
}
