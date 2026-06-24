import { useState, FormEvent } from 'react';
import { IntegrationSettings, Kegiatan } from '../types';
import { 
  Database, 
  Copy, 
  Check, 
  HelpCircle, 
  Settings, 
  FileSpreadsheet, 
  FolderOpen, 
  Globe, 
  Sparkles,
  Info,
  Link2,
  AlertTriangle,
  Play
} from 'lucide-react';
import { APPS_SCRIPT_CODE } from '../utils/gasClient';

interface IntegrationConfigProps {
  settings: IntegrationSettings;
  onSaveSettings: (settings: IntegrationSettings) => void;
  kegiatanList: Kegiatan[];
  onImportMockData: () => void;
}

export default function IntegrationConfig({ 
  settings, 
  onSaveSettings, 
  kegiatanList, 
  onImportMockData 
}: IntegrationConfigProps) {
  const [mode, setMode] = useState<'local' | 'gas'>(settings.mode);
  const [gasUrl, setGasUrl] = useState(settings.gasUrl);
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      mode,
      gasUrl: mode === 'gas' ? gasUrl.trim() : ''
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto" id="integration-view">
      {/* Introduction Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xxs font-bold uppercase tracking-wider">
            <Sparkles size={12} />
            Tanpa Firebase & Database Rumit
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
            Koneksi Google Sheets & Drive Gratis!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Sistem ini didesain agar dapat bekerja secara mandiri dengan browser Anda menggunakan <strong>Local Storage</strong> untuk demo instan, atau diintegrasikan langsung dengan **Google Sheets (sebagai Database)** dan **Google Drive (sebagai penyimpanan foto)** menggunakan teknologi Google Apps Script gratis.
          </p>
        </div>
      </div>

      {/* Configuration Form */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6 shadow-sm">
        <div className="flex items-center gap-2.5 mb-5">
          <Settings className="text-indigo-600 dark:text-indigo-400" size={20} />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Pengaturan Jalur Data
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Mode Switch Radio Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Local Storage Option */}
            <label className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-2 ${
              mode === 'local' 
                ? 'border-indigo-600 bg-indigo-50/10 dark:bg-indigo-500/5 dark:border-indigo-500' 
                : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600 bg-transparent'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-950 dark:text-white">1. Mode Local Storage (Demo)</span>
                <input
                  type="radio"
                  name="integrationMode"
                  checked={mode === 'local'}
                  onChange={() => setMode('local')}
                  className="accent-indigo-600"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                Menyimpan data kegiatan dan gambar base64 langsung di dalam browser Anda. Tidak memerlukan persiapan backend apa pun, langsung siap dicoba.
              </p>
            </label>

            {/* Google Sheets Option */}
            <label className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-2 ${
              mode === 'gas' 
                ? 'border-indigo-600 bg-indigo-50/10 dark:bg-indigo-500/5 dark:border-indigo-500' 
                : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600 bg-transparent'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-950 dark:text-white">2. Mode Live Google Sheets & Drive</span>
                <input
                  type="radio"
                  name="integrationMode"
                  checked={mode === 'gas'}
                  onChange={() => setMode('gas')}
                  className="accent-indigo-600"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                Menyambungkan aplikasi dengan Google Sheets Anda secara online. Data rincian terisi di Sheets dan foto tersimpan di folder Drive Anda secara langsung.
              </p>
            </label>
          </div>

          {/* Web App URL input (show only if GAS mode is selected) */}
          {mode === 'gas' && (
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-150 dark:border-slate-800 space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="space-y-1">
                <label htmlFor="gasUrlInput" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Link2 size={13} className="text-indigo-600" />
                  URL Web App Google Apps Script
                </label>
                <input
                  id="gasUrlInput"
                  type="url"
                  required
                  value={gasUrl}
                  onChange={(e) => setGasUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono placeholder-slate-400"
                />
              </div>
              <div className="p-3 bg-indigo-500/5 rounded-lg text-xxs text-slate-600 dark:text-slate-400 flex items-start gap-1.5 leading-normal">
                <Info size={14} className="text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                <span>Pastikan URL berakhiran <strong>/exec</strong>. URL ini didapatkan setelah Anda menerapkan (deploy) kode Apps Script yang disediakan di bawah ini sebagai Aplikasi Web publik dengan akses 'Anyone'.</span>
              </div>
            </div>
          )}

          {/* Save Settings button */}
          <div className="flex items-center justify-between pt-2">
            <div>
              {saveSuccess && (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-pulse">
                  <Check size={14} /> Pengaturan disimpan! Berhasil beralih ke {mode === 'gas' ? 'Google Sheets' : 'Local Storage'}.
                </span>
              )}
            </div>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-xl transition-all shadow-md shadow-indigo-600/10"
              id="btn-save-settings"
            >
              Simpan Jalur Data
            </button>
          </div>
        </form>
      </div>

      {/* Accordion / Tab Guide for Developers */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden shadow-sm">
        {/* Accordion title */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle size={16} className="text-indigo-600" />
            Panduan Lengkap Penyusunan & Integrasi
          </h3>
          <p className="text-xxs text-slate-500 dark:text-slate-400 mt-0.5">
            Ikuti 5 langkah mudah berikut untuk membangun database Google Sheets & Drive Anda secara utuh.
          </p>
        </div>

        {/* Content Tabs/Sections */}
        <div className="p-6 space-y-6 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          {/* 1. Google Sheets Structure */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-950 text-white font-mono flex items-center justify-center text-[10px]">1</span>
              Struktur Google Sheets (Database)
            </h4>
            <p className="text-slate-600 dark:text-slate-400 pl-7 text-[11px]">
              Buat spreadsheet kosong di Google Sheets dan namai lembar kerja pertama dengan nama <strong className="text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded font-mono">Kegiatan</strong>. Tuliskan header kolom persis seperti berikut di baris pertama (<strong className="text-indigo-600 font-mono">A1 sampai L1</strong>):
            </p>
            
            <div className="pl-7 pt-1 overflow-x-auto">
              <table className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden text-xxs font-mono text-left w-full">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="p-2 border-r border-slate-200 dark:border-slate-700">Kolom</th>
                    <th className="p-2 border-r border-slate-200 dark:border-slate-700">Nama Header (Baris 1)</th>
                    <th className="p-2">Tipe Data / Deskripsi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-slate-700/80 text-slate-800 dark:text-slate-300">
                  <tr>
                    <td className="p-2 border-r border-slate-200 dark:border-slate-700 font-bold">A</td>
                    <td className="p-2 border-r border-slate-200 dark:border-slate-700 font-bold">ID</td>
                    <td className="p-2 text-slate-500">Kunci Utama (Contoh: KGT-001)</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-slate-200 dark:border-slate-700 font-bold">B</td>
                    <td className="p-2 border-r border-slate-200 dark:border-slate-700 font-bold">Nama Kegiatan</td>
                    <td className="p-2 text-slate-500">Teks Judul Acara/Kegiatan</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-slate-200 dark:border-slate-700 font-bold">C</td>
                    <td className="p-2 border-r border-slate-200 dark:border-slate-700 font-bold">Hari</td>
                    <td className="p-2 text-slate-500">Hari (Senin - Minggu)</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-slate-200 dark:border-slate-700 font-bold">D</td>
                    <td className="p-2 border-r border-slate-200 dark:border-slate-700 font-bold">Tanggal</td>
                    <td className="p-2 text-slate-500">Tanggal format Date (YYYY-MM-DD)</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-slate-200 dark:border-slate-700 font-bold">E</td>
                    <td className="p-2 border-r border-slate-200 dark:border-slate-700 font-bold">Waktu</td>
                    <td className="p-2 text-slate-500">String Jam (Contoh: 09:00 - 12:00)</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-slate-200 dark:border-slate-700 font-bold">F</td>
                    <td className="p-2 border-r border-slate-200 dark:border-slate-700 font-bold">Lokasi</td>
                    <td className="p-2 text-slate-500">Teks Alamat / Ruangan</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-slate-200 dark:border-slate-700 font-bold">G</td>
                    <td className="p-2 border-r border-slate-200 dark:border-slate-700 font-bold">Jumlah Peserta</td>
                    <td className="p-2 text-slate-500">Angka Peserta Terdaftar</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-slate-200 dark:border-slate-700 font-bold">H</td>
                    <td className="p-2 border-r border-slate-200 dark:border-slate-700 font-bold">Jenis Kegiatan</td>
                    <td className="p-2 text-slate-500">FGD / Metra / Reses / Pertemuan Internal / Kegiatan Lainnya</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-slate-200 dark:border-slate-700 font-bold">I</td>
                    <td className="p-2 border-r border-slate-200 dark:border-slate-700 font-bold">Deskripsi</td>
                    <td className="p-2 text-slate-500">Teks Deskripsi / Uraian Detail</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-slate-200 dark:border-slate-700 font-bold">J</td>
                    <td className="p-2 border-r border-slate-200 dark:border-slate-700 font-bold">Foto URLs</td>
                    <td className="p-2 text-slate-500">Teks Terpisah Koma berisi Direct Link Gambar di Google Drive</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-slate-200 dark:border-slate-700 font-bold">K</td>
                    <td className="p-2 border-r border-slate-200 dark:border-slate-700 font-bold">Foto File IDs</td>
                    <td className="p-2 text-slate-500">Teks Terpisah Koma berisi ID File Dokumen Drive (Untuk Hapus Foto)</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-r border-slate-200 dark:border-slate-700 font-bold">L</td>
                    <td className="p-2 border-r border-slate-200 dark:border-slate-700 font-bold">Tanggal Dibuat</td>
                    <td className="p-2 text-slate-500">Waktu ISO Pembuatan Baris Data</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. Google Drive Folder */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-950 text-white font-mono flex items-center justify-center text-[10px]">2</span>
              Struktur Folder Google Drive (Penyimpanan Foto)
            </h4>
            <div className="pl-7 space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
              <p>Buat folder baru di Google Drive Anda untuk menampung seluruh dokumentasi foto kegiatan (misalnya beri nama **"Foto Dokumentasi Kegiatan"**).</p>
              <p>Dapatkan **Folder ID** dengan cara membuka folder tersebut di browser Anda, lalu salin rangkaian kode karakter di baris alamat URL setelah kata <code className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded text-rose-500 font-mono text-[10px]">folders/...</code>.</p>
              <p className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg font-mono text-[10px] text-slate-500">
                Misal URL folder Anda: https://drive.google.com/drive/folders/<strong>1aBcDeFg_HiJkLmNoPqRsTuVwXyZ</strong><br />
                Maka Folder ID Anda adalah: <strong className="text-indigo-600">1aBcDeFg_HiJkLmNoPqRsTuVwXyZ</strong>
              </p>
            </div>
          </div>

          {/* 3. Apps Script Code and Deploy (The Script) */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-950 text-white font-mono flex items-center justify-center text-[10px]">3</span>
              Kode Google Apps Script & Deploy Web App
            </h4>
            <p className="text-slate-600 dark:text-slate-400 pl-7 text-[11px]">
              Klik menu <strong className="text-slate-900 dark:text-white">Ekstensi (Extensions) &gt; Apps Script</strong> pada Google Sheets Anda. Hapus seluruh kode default yang muncul di editor, lalu salin dan tempel (paste) kode Apps Script lengkap berikut:
            </p>

            {/* Apps script copy box */}
            <div className="pl-7 relative">
              <div className="absolute top-2.5 right-6 z-10">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-950 text-white dark:bg-slate-700 dark:hover:bg-slate-600 text-xxs font-bold rounded-lg transition-all shadow-sm border border-slate-700/30"
                >
                  {copied ? (
                    <>
                      <Check size={11} className="text-emerald-500" />
                      Tersalin!
                    </>
                  ) : (
                    <>
                      <Copy size={11} />
                      Salin Kode GS
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 bg-slate-950 text-slate-200 font-mono text-[10px] rounded-xl overflow-x-auto max-h-72 border border-slate-800 leading-relaxed scrollbar-thin">
                {APPS_SCRIPT_CODE}
              </pre>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 italic">
                *PENTING: Pastikan Anda mengganti variabel <code className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 px-1 rounded">FOLDER_ID</code> di baris ke-18 di dalam kode editor Apps Script Anda dengan Folder ID Google Drive asli Anda yang didapatkan dari langkah kedua.
              </p>
            </div>

            {/* Step 4: Web App Deploying */}
            <div className="pl-7 pt-3 space-y-2 text-[11px] text-slate-600 dark:text-slate-400">
              <h5 className="font-bold text-slate-900 dark:text-white">Cara Menerapkan (Deploy) Apps Script:</h5>
              <ol className="list-decimal pl-4 space-y-1.5">
                <li>Di halaman Google Apps Script, klik tombol **Terapkan (Deploy)** di kanan atas, lalu pilih **Penerapan baru (New deployment)**.</li>
                <li>Klik ikon roda gigi (Tipe) di samping kata "Pilih jenis", lalu pilih **Aplikasi Web (Web App)**.</li>
                <li>Pada opsi **Jalankan sebagai (Execute as)**, pilih **Saya (Me - email Anda sendiri)**.</li>
                <li>Pada opsi **Siapa yang memiliki akses (Who has access)**, pilih **Siapa saja (Anyone)**. Ini sangat krusial agar sistem web frontend dapat mengirimkan data tanpa hambatan login OAuth yang membingungkan.</li>
                <li>Klik tombol **Terapkan (Deploy)**. Berikan izin akses Google Drive dan Sheets kepada script Anda (Otorisasi Akun Google Anda).</li>
                <li>Setelah selesai, Anda akan menerima tautan **URL Aplikasi Web (Web App URL)**. Salin URL tersebut, masukkan ke input form "Jalur Data" di atas, klik simpan, dan mulailah bersenang-senang mengelola data secara nyata!</li>
              </ol>
            </div>
          </div>

          {/* 4. GitHub Pages Deploying */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-950 text-white font-mono flex items-center justify-center text-[10px]">4</span>
              Cara Deploy ke GitHub Pages
            </h4>
            <div className="pl-7 space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
              <p>Untuk meluncurkan aplikasi ini secara online secara penuh lewat GitHub Pages secara gratis:</p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Ekspor atau unduh file aplikasi ini sebagai format ZIP dari menu pengaturan Editor AI Studio Anda.</li>
                <li>Buat repositori baru di GitHub dengan nama <strong className="text-slate-900 dark:text-white font-mono">sistem-pendataan-kegiatan</strong>.</li>
                <li>Unggah file-file proyek Anda (atau push repositori lokal Anda) ke GitHub.</li>
                <li>Buka menu **Settings** repositori Anda di GitHub, lalu cari menu **Pages** di panel kiri.</li>
                <li>Pada pilihan **Build and deployment &gt; Source**, pilih **GitHub Actions** atau **Deploy from a branch (pilih branch main / root)**.</li>
                <li>Aplikasi Anda akan segera aktif di tautan: <code className="text-indigo-600 dark:text-indigo-400 font-bold font-mono">https://username.github.io/sistem-pendataan-kegiatan/</code></li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
