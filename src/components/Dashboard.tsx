import { Kegiatan, JenisKegiatan } from '../types';
import { 
  Calendar, 
  Users, 
  Image as ImageIcon, 
  Award, 
  TrendingUp, 
  ChevronRight,
  MapPin,
  Clock,
  PlusCircle
} from 'lucide-react';

interface DashboardProps {
  kegiatanList: Kegiatan[];
  onNavigateToTab: (tab: string) => void;
  onViewDetail: (kegiatan: Kegiatan) => void;
}

const CATEGORY_COLORS: Record<JenisKegiatan, { bg: string; text: string; border: string; accent: string }> = {
  'FGD': { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20', accent: 'bg-blue-600' },
  'Metra': { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/20', accent: 'bg-purple-600' },
  'Reses': { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/20', accent: 'bg-amber-600' },
  'Pertemuan Internal': { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20', accent: 'bg-emerald-600' },
  'Kegiatan Lainnya': { bg: 'bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-500/20', accent: 'bg-slate-600' }
};

export default function Dashboard({ kegiatanList, onNavigateToTab, onViewDetail }: DashboardProps) {
  // 1. Calculations
  const totalKegiatan = kegiatanList.length;
  const totalPeserta = kegiatanList.reduce((sum, item) => sum + (Number(item.jumlahPeserta) || 0), 0);
  const totalFoto = kegiatanList.reduce((sum, item) => sum + (item.fotos?.length || 0), 0);
  const rataRataPeserta = totalKegiatan > 0 ? Math.round(totalPeserta / totalKegiatan) : 0;

  // 2. Statistics by Jenis Kegiatan
  const categories: JenisKegiatan[] = ['FGD', 'Metra', 'Reses', 'Pertemuan Internal', 'Kegiatan Lainnya'];
  const statsByCategory = categories.map(cat => {
    const list = kegiatanList.filter(k => k.jenisKegiatan === cat);
    const count = list.length;
    const peserta = list.reduce((sum, item) => sum + (Number(item.jumlahPeserta) || 0), 0);
    const percentage = totalKegiatan > 0 ? Math.round((count / totalKegiatan) * 100) : 0;
    return {
      name: cat,
      count,
      peserta,
      percentage,
      colors: CATEGORY_COLORS[cat]
    };
  });

  // Sort categories by count (descending)
  const sortedStats = [...statsByCategory].sort((a, b) => b.count - a.count);

  // Latest 3 activities
  const latestActivities = [...kegiatanList].slice(0, 3);

  return (
    <div className="space-y-6" id="dashboard-view">
      {/* Welcome header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Dashboard Utama
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Ringkasan data, statistik kegiatan, dan dokumentasi foto terintegrasi.
          </p>
        </div>
        <button
          onClick={() => onNavigateToTab('form')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl transition-colors shadow-md shadow-indigo-600/15"
          id="btn-quick-add"
        >
          <PlusCircle size={16} />
          Catat Kegiatan Baru
        </button>
      </div>

      {/* Grid Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Kegiatan */}
        <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-xs flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Kegiatan
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {totalKegiatan}
              </span>
              <span className="text-xs text-slate-400 font-medium">acara</span>
            </div>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
            <Calendar size={22} />
          </div>
        </div>

        {/* Total Peserta */}
        <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-xs flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Peserta
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {totalPeserta.toLocaleString('id-ID')}
              </span>
              <span className="text-xs text-slate-400 font-medium">orang</span>
            </div>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-500/10 rounded-xl text-purple-600 dark:text-purple-400">
            <Users size={22} />
          </div>
        </div>

        {/* Total Foto */}
        <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-xs flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Foto Dok.
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {totalFoto}
              </span>
              <span className="text-xs text-slate-400 font-medium">berkas</span>
            </div>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
            <ImageIcon size={22} />
          </div>
        </div>

        {/* Rata-rata Peserta */}
        <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-xs flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Rata-rata Peserta
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {rataRataPeserta}
              </span>
              <span className="text-xs text-slate-400 font-medium">/ kegiatan</span>
            </div>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400">
            <Award size={22} />
          </div>
        </div>
      </div>

      {/* Charts & Categorized Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Statistics of Jenis Kegiatan (2 columns on wide) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Statistik Jenis Kegiatan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Penyebaran frekuensi dan total jumlah peserta di setiap jenis kegiatan.
              </p>
            </div>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
              <TrendingUp size={16} />
            </div>
          </div>

          <div className="space-y-5">
            {sortedStats.map((stat) => (
              <div key={stat.name} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${stat.colors.accent}`} />
                    <span className="font-bold text-slate-800 dark:text-slate-200">{stat.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
                    <span>
                      <strong className="text-slate-900 dark:text-white">{stat.count}</strong> Kegiatan
                    </span>
                    <span className="hidden sm:inline">|</span>
                    <span>
                      <strong className="text-slate-900 dark:text-white">{stat.peserta.toLocaleString('id-ID')}</strong> Peserta
                    </span>
                    <span className="font-mono bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-xxs font-bold text-slate-800 dark:text-slate-300">
                      {stat.percentage}%
                    </span>
                  </div>
                </div>
                {/* Custom bar chart */}
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${stat.colors.accent}`} 
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Latest Kegiatan Sidebar (1 column) */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Kegiatan Terbaru
              </h3>
              <button 
                onClick={() => onNavigateToTab('list')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-0.5"
              >
                Lihat Semua <ChevronRight size={14} />
              </button>
            </div>

            <div className="space-y-4">
              {latestActivities.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Belum ada kegiatan terdaftar.</p>
                </div>
              ) : (
                latestActivities.map((k) => (
                  <div 
                    key={k.id} 
                    onClick={() => onViewDetail(k)}
                    className="group p-3 hover:bg-slate-50 dark:hover:bg-slate-700/40 rounded-xl border border-slate-100/50 dark:border-slate-700/30 transition-all cursor-pointer flex gap-3"
                  >
                    {/* Thumbnail */}
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 flex-shrink-0 relative">
                      {k.fotos && k.fotos.length > 0 ? (
                        <img 
                          src={k.fotos[0].url} 
                          alt={k.namaKegiatan} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <ImageIcon size={18} />
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 bg-slate-900/70 text-[8px] font-bold text-white px-1 py-0.5 rounded-tl">
                        {k.id}
                      </span>
                    </div>

                    {/* Meta info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${CATEGORY_COLORS[k.jenisKegiatan].bg} ${CATEGORY_COLORS[k.jenisKegiatan].text} ${CATEGORY_COLORS[k.jenisKegiatan].border}`}>
                          {k.jenisKegiatan}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {k.tanggal}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {k.namaKegiatan}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1 truncate">
                        <MapPin size={10} className="text-slate-400 flex-shrink-0" />
                        <span>{k.lokasi}</span>
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xxs text-slate-500 dark:text-slate-400">
              <span>Kecepatan Sinkronisasi:</span>
              <span className="font-bold text-emerald-500">Realtime (Aktif)</span>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-xxs text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
              <Clock size={12} className="text-slate-400 mt-0.5 flex-shrink-0" />
              <span>Gunakan menu 'Integrasi Sheets & Drive' di sidebar untuk menyinkronkan data dengan lembar kerja Google Anda secara nirkabel.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
