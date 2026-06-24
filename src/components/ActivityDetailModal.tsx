import { useState, useEffect } from 'react';
import { Kegiatan, JenisKegiatan } from '../types';
import { 
  X, 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  BookOpen, 
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface ActivityDetailModalProps {
  kegiatan: Kegiatan | null;
  onClose: () => void;
}

const CATEGORY_COLORS: Record<JenisKegiatan, { bg: string; text: string; border: string; accent: string }> = {
  'FGD': { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20', accent: 'bg-blue-600' },
  'Metra': { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/20', accent: 'bg-purple-600' },
  'Reses': { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/20', accent: 'bg-amber-600' },
  'Pertemuan Internal': { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20', accent: 'bg-emerald-600' },
  'Kegiatan Lainnya': { bg: 'bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-500/20', accent: 'bg-slate-600' }
};

export default function ActivityDetailModal({ kegiatan, onClose }: ActivityDetailModalProps) {
  if (!kegiatan) return null;

  // Image Gallery State
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Reset index when kegiatan changes
  useEffect(() => {
    setActiveImageIndex(0);
  }, [kegiatan]);

  const hasPhotos = kegiatan.fotos && kegiatan.fotos.length > 0;
  const currentPhoto = hasPhotos ? kegiatan.fotos[activeImageIndex] : null;

  const handleNextPhoto = () => {
    if (hasPhotos) {
      setActiveImageIndex((prev) => (prev + 1) % kegiatan.fotos.length);
    }
  };

  const handlePrevPhoto = () => {
    if (hasPhotos) {
      setActiveImageIndex((prev) => (prev - 1 + kegiatan.fotos.length) % kegiatan.fotos.length);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6" id="activity-detail-modal">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" 
      />

      {/* Modal Container */}
      <div className="relative bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-700/50 w-full max-w-4xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-black bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300 px-2.5 py-1 rounded-md">
              {kegiatan.id}
            </span>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Rincian Dokumentasi Kegiatan</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-300 transition-colors"
            id="btn-close-modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto p-6 flex-1 space-y-6">
          {/* Main Title & Category Badge */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${CATEGORY_COLORS[kegiatan.jenisKegiatan].bg} ${CATEGORY_COLORS[kegiatan.jenisKegiatan].text} ${CATEGORY_COLORS[kegiatan.jenisKegiatan].border}`}>
                {kegiatan.jenisKegiatan}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Dibuat pada: {new Date(kegiatan.tanggalDibuat).toLocaleString('id-ID')}
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-snug">
              {kegiatan.namaKegiatan}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* LEFT SIDE: Image Gallery & Previews (Col 7) */}
            <div className="md:col-span-7 flex flex-col gap-3">
              <div className="relative aspect-video rounded-2xl bg-slate-100 dark:bg-slate-900 overflow-hidden border border-slate-200/50 dark:border-slate-850">
                {currentPhoto ? (
                  <>
                    <img 
                      src={currentPhoto.url} 
                      alt="Active documentation" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Image navigation controls if multiple */}
                    {kegiatan.fotos.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevPhoto}
                          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-slate-900/60 hover:bg-slate-950/80 text-white rounded-full shadow-md transition-colors"
                          title="Foto Sebelumnya"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          onClick={handleNextPhoto}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-slate-900/60 hover:bg-slate-950/80 text-white rounded-full shadow-md transition-colors"
                          title="Foto Berikutnya"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </>
                    )}

                    {/* Image caption */}
                    <div className="absolute bottom-0 inset-x-0 bg-slate-950/60 backdrop-blur-xs px-4 py-2.5 flex items-center justify-between text-white text-[10px] font-medium">
                      <span className="truncate max-w-[70%]" title={currentPhoto.name || 'Foto Dokumentasi'}>
                        {currentPhoto.name || `Foto_${kegiatan.id}_${activeImageIndex + 1}.jpg`}
                      </span>
                      <span>
                        {activeImageIndex + 1} / {kegiatan.fotos.length}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400">
                    <ImageIcon size={42} />
                    <span className="text-xs font-semibold">Tidak Ada Dokumentasi Foto</span>
                  </div>
                )}
              </div>

              {/* Mini gallery thumbnails list */}
              {hasPhotos && kegiatan.fotos.length > 1 && (
                <div className="grid grid-cols-5 gap-2 max-h-20 overflow-y-auto pr-0.5">
                  {kegiatan.fotos.map((foto, index) => (
                    <button
                      key={foto.id}
                      onClick={() => setActiveImageIndex(index)}
                      className={`relative aspect-video rounded-lg overflow-hidden border transition-all ${
                        index === activeImageIndex 
                          ? 'border-indigo-600 dark:border-indigo-500 ring-2 ring-indigo-500/20 scale-95' 
                          : 'border-slate-250 dark:border-slate-700 hover:border-slate-400 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img 
                        src={foto.url} 
                        alt="Documentation thumbnail" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT SIDE: Parameters & Details (Col 5) */}
            <div className="md:col-span-5 space-y-4">
              <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles size={12} className="text-indigo-500" />
                Informasi Pelaksanaan
              </h4>

              {/* Specs Grid */}
              <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                {/* Date/Day */}
                <div className="flex items-start gap-3 text-xs">
                  <Calendar size={15} className="text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 font-medium">Hari & Tanggal</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {kegiatan.hari}, {kegiatan.tanggal}
                    </p>
                  </div>
                </div>

                {/* Clock / Time */}
                <div className="flex items-start gap-3 text-xs">
                  <Clock size={15} className="text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 font-medium">Waktu Pelaksanaan</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {kegiatan.waktu || 'Sesuai Jadwal'}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-3 text-xs">
                  <MapPin size={15} className="text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 font-medium">Lokasi</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 break-all">
                      {kegiatan.lokasi}
                    </p>
                  </div>
                </div>

                {/* Participants */}
                <div className="flex items-start gap-3 text-xs">
                  <Users size={15} className="text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 font-medium">Jumlah Peserta</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {kegiatan.jumlahPeserta} Orang
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Area: Large Detailed Description */}
          <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-700/50">
            <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <BookOpen size={12} className="text-indigo-500" />
              Deskripsi & Hasil Kegiatan
            </h4>
            <div className="bg-slate-50/50 dark:bg-slate-900/20 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal whitespace-pre-line">
                {kegiatan.deskripsi || 'Tidak ada deskripsi rincian yang diberikan untuk kegiatan ini.'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700/50 flex justify-end bg-slate-50/50 dark:bg-slate-800/30 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 text-white dark:bg-indigo-600 dark:text-white rounded-xl text-xs font-bold hover:bg-slate-800 dark:hover:bg-indigo-700 shadow-sm transition-all"
            id="btn-close-modal-bottom"
          >
            Tutup Rincian
          </button>
        </div>

      </div>
    </div>
  );
}
