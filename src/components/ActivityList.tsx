import { useState, useMemo } from 'react';
import { Kegiatan, JenisKegiatan } from '../types';
import { 
  Search, 
  Filter, 
  Calendar, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Edit3, 
  Trash2, 
  Eye, 
  MapPin, 
  Users, 
  SlidersHorizontal,
  ChevronDown,
  LayoutGrid,
  Table,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface ActivityListProps {
  kegiatanList: Kegiatan[];
  onEdit: (kegiatan: Kegiatan) => void;
  onDelete: (id: string) => void;
  onViewDetail: (kegiatan: Kegiatan) => void;
  isLoading: boolean;
}

const CATEGORY_COLORS: Record<JenisKegiatan, { bg: string; text: string; border: string; bgSolid: string }> = {
  'FGD': { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20', bgSolid: 'bg-blue-600' },
  'Metra': { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/20', bgSolid: 'bg-purple-600' },
  'Reses': { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/20', bgSolid: 'bg-amber-600' },
  'Pertemuan Internal': { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20', bgSolid: 'bg-emerald-600' },
  'Kegiatan Lainnya': { bg: 'bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-500/20', bgSolid: 'bg-slate-600' }
};

export default function ActivityList({ kegiatanList, onEdit, onDelete, onViewDetail, isLoading }: ActivityListProps) {
  // Filter States
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'participants_desc' | 'participants_asc'>('newest');
  
  // Layout State
  const [viewLayout, setViewLayout] = useState<'grid' | 'table'>('grid');

  // Filter & Sort Logic
  const filteredAndSorted = useMemo(() => {
    let result = [...kegiatanList];

    // Realtime search by title, location, description, or ID
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(k => 
        k.id.toLowerCase().includes(q) ||
        k.namaKegiatan.toLowerCase().includes(q) ||
        k.lokasi.toLowerCase().includes(q) ||
        k.deskripsi.toLowerCase().includes(q)
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      result = result.filter(k => k.jenisKegiatan === filterType);
    }

    // Filter by start date
    if (startDate) {
      result = result.filter(k => k.tanggal >= startDate);
    }

    // Filter by end date
    if (endDate) {
      result = result.filter(k => k.tanggal <= endDate);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.tanggalDibuat).getTime() - new Date(a.tanggalDibuat).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.tanggalDibuat).getTime() - new Date(b.tanggalDibuat).getTime();
      } else if (sortBy === 'participants_desc') {
        return b.jumlahPeserta - a.jumlahPeserta;
      } else { // participants_asc
        return a.jumlahPeserta - b.jumlahPeserta;
      }
    });

    return result;
  }, [kegiatanList, search, filterType, startDate, endDate, sortBy]);

  // Reset Filters helper
  const handleResetFilters = () => {
    setSearch('');
    setFilterType('all');
    setStartDate('');
    setEndDate('');
    setSortBy('newest');
  };

  // Export to Excel handler
  const handleExportExcel = () => {
    if (filteredAndSorted.length === 0) return;

    // Prepare data
    const exportData = filteredAndSorted.map(item => ({
      'ID': item.id,
      'Nama Kegiatan': item.namaKegiatan,
      'Hari': item.hari,
      'Tanggal': item.tanggal,
      'Waktu': item.waktu,
      'Lokasi': item.lokasi,
      'Jumlah Peserta': item.jumlahPeserta,
      'Jenis Kegiatan': item.jenisKegiatan,
      'Deskripsi': item.deskripsi,
      'Total Foto': item.fotos?.length || 0,
      'Dibuat Pada': item.tanggalDibuat
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Kegiatan');
    
    // Auto fit column widths
    const max_width = exportData.reduce((w, r) => Math.max(w, Object.keys(r).length), 10);
    worksheet['!cols'] = Array(max_width).fill({ wch: 15 });

    XLSX.writeFile(workbook, `Sistem_Pendataan_Kegiatan_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Helper: Fetch image as Base64 to safely embed into PDF without cross-origin pollution
  const getImageBase64 = (url: string): Promise<string> => {
    return new Promise((resolve) => {
      // If already base64, return immediately
      if (url.startsWith('data:image/')) {
        resolve(url);
        return;
      }

      // If it's Unsplash, append crossOrigin to allow canvas generation
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = function() {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          try {
            const dataURL = canvas.toDataURL('image/jpeg', 0.7);
            resolve(dataURL);
          } catch (e) {
            resolve(''); // Failed
          }
        } else {
          resolve('');
        }
      };
      img.onerror = function() {
        resolve(''); // Fail silently
      };
      img.src = url;
    });
  };

  // Export to PDF handler with beautiful custom styling and embedded photos
  const handleExportPDF = async () => {
    if (filteredAndSorted.length === 0) return;

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // 1. PDF Title Page / Header
    doc.setFillColor(15, 23, 42); // dark slate header background
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('LAPORAN DATA KEGIATAN', 15, 17);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Sistem Pendataan Kegiatan Organisasi Profesional', 15, 24);
    doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, 15, 30);

    // Filter indicator badge
    doc.setFillColor(30, 41, 59);
    doc.rect(pageWidth - 85, 10, 70, 20, 'F');
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(8);
    doc.text('Kriteria Filter:', pageWidth - 80, 15);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(`Jenis: ${filterType === 'all' ? 'Semua' : filterType}`, pageWidth - 80, 20);
    doc.text(`Jumlah: ${filteredAndSorted.length} baris`, pageWidth - 80, 25);

    // 2. Generate detailed kegiatan items list
    let currentY = 50;

    for (let i = 0; i < filteredAndSorted.length; i++) {
      const item = filteredAndSorted[i];

      // Check page height limit, add page if too full
      if (currentY > pageHeight - 60) {
        doc.addPage();
        currentY = 20;
      }

      // Item Card Border & Title
      doc.setDrawColor(226, 232, 240); // light gray border
      doc.setFillColor(248, 250, 252); // light gray card background
      doc.rect(15, currentY, pageWidth - 30, 30, 'FD');

      // Left bar category indicator
      let barColor = [100, 116, 139]; // Default slate
      if (item.jenisKegiatan === 'FGD') barColor = [59, 130, 246];
      else if (item.jenisKegiatan === 'Metra') barColor = [168, 85, 247];
      else if (item.jenisKegiatan === 'Reses') barColor = [245, 158, 11];
      else if (item.jenisKegiatan === 'Pertemuan Internal') barColor = [16, 185, 129];
      
      doc.setFillColor(barColor[0], barColor[1], barColor[2]);
      doc.rect(15, currentY, 3, 30, 'F');

      // Activity header
      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`${item.id} - ${item.namaKegiatan}`, 22, currentY + 7);

      // Metadata details
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Hari, Tanggal : ${item.hari}, ${item.tanggal} (${item.waktu})`, 22, currentY + 14);
      doc.text(`Lokasi        : ${item.lokasi}`, 22, currentY + 19);
      doc.text(`Jenis & Peserta: [${item.jenisKegiatan}] - ${item.jumlahPeserta} Peserta`, 22, currentY + 24);

      // Add description text in italic box
      currentY += 32;

      // Description
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      const descLines = doc.splitTextToSize(item.deskripsi || '-', pageWidth - 40);
      doc.text(descLines, 20, currentY);

      currentY += descLines.length * 4 + 4;

      // 3. Render embedded activity photo thumbnails side-by-side
      if (item.fotos && item.fotos.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.text('Foto Dokumentasi:', 20, currentY);
        currentY += 3;

        // Try to draw thumbnails
        const thumbWidth = 25;
        const thumbHeight = 18;
        const spacing = 4;
        let startX = 20;

        for (let j = 0; j < Math.min(item.fotos.length, 6); j++) {
          const foto = item.fotos[j];
          if (startX + thumbWidth > pageWidth - 15) {
            // New line of photos
            startX = 20;
            currentY += thumbHeight + spacing;
          }

          try {
            // Draw dummy border outline first in case photo fails to render
            doc.setDrawColor(203, 213, 225);
            doc.rect(startX, currentY, thumbWidth, thumbHeight, 'D');

            const base64Data = await getImageBase64(foto.url);
            if (base64Data) {
              doc.addImage(base64Data, 'JPEG', startX, currentY, thumbWidth, thumbHeight);
            } else {
              // Write small placeholder text
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(6);
              doc.text('[File Foto]', startX + 5, currentY + 10);
            }
          } catch (imgError) {
            console.error('Failed to append image to PDF:', imgError);
          }

          startX += thumbWidth + spacing;
        }

        currentY += thumbHeight + 8;
      } else {
        currentY += 4;
      }

      // Draw partition line
      doc.setDrawColor(241, 245, 249);
      doc.line(15, currentY, pageWidth - 15, currentY);
      currentY += 8;
    }

    // 4. Page Footer numbers
    const totalPages = doc.internal.pages.length - 1;
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`Halaman ${p} dari ${totalPages}`, pageWidth - 35, pageHeight - 10);
      doc.text('Sistem Pendataan Kegiatan - Hubungkan ke Google Sheets untuk kelayakan penuh.', 15, pageHeight - 10);
    }

    doc.save(`Laporan_Kegiatan_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-6" id="activity-list-section">
      {/* Search and Filters Layout */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-5 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Pencarian & Penyaringan Data
            </h3>
          </div>
          
          {/* Layout switches & Reset */}
          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
            <button
              onClick={handleResetFilters}
              className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1"
              title="Reset seluruh filter"
              id="btn-filter-reset"
            >
              <RefreshCw size={12} />
              Reset Filter
            </button>
            
            <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl flex items-center border border-slate-200/40 dark:border-slate-800">
              <button
                onClick={() => setViewLayout('grid')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewLayout === 'grid' 
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Tampilan Grid Card"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewLayout('table')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewLayout === 'table' 
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Tampilan Tabel Rinci"
              >
                <Table size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-1">
          {/* Realtime Search bar */}
          <div className="relative lg:col-span-1.5">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, lokasi, deskripsi..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder-slate-400"
              id="input-search-realtime"
            />
            <Search size={14} className="absolute left-3 top-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Jenis Kegiatan select dropdown */}
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full pl-3 pr-8 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none"
              id="select-filter-jenis"
            >
              <option value="all">Semua Jenis Kegiatan</option>
              <option value="FGD">FGD</option>
              <option value="Metra">Metra</option>
              <option value="Reses">Reses</option>
              <option value="Pertemuan Internal">Pertemuan Internal</option>
              <option value="Kegiatan Lainnya">Kegiatan Lainnya</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Date range filters */}
          <div className="relative flex items-center gap-1.5 lg:col-span-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5">
            <Calendar size={13} className="text-slate-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-transparent border-none text-[10px] sm:text-xs text-slate-800 dark:text-white focus:outline-none py-1.5"
              placeholder="Awal"
              title="Tanggal Mulai"
            />
            <span className="text-slate-400 font-mono text-[10px]">s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-transparent border-none text-[10px] sm:text-xs text-slate-800 dark:text-white focus:outline-none py-1.5"
              placeholder="Akhir"
              title="Tanggal Selesai"
            />
          </div>

          {/* Sorting Option */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full pl-3 pr-8 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none"
              id="select-filter-urutkan"
            >
              <option value="newest">Terbaru Dibuat</option>
              <option value="oldest">Terlama Dibuat</option>
              <option value="participants_desc">Peserta Terbanyak</option>
              <option value="participants_asc">Peserta Tersedikit</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Action Header: Results found & Export buttons */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Menampilkan <strong className="text-slate-800 dark:text-white">{filteredAndSorted.length}</strong> kegiatan dari total <strong className="text-slate-800 dark:text-white">{kegiatanList.length}</strong> terdata.
          </p>

          {/* Export buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              disabled={filteredAndSorted.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              id="btn-export-excel"
            >
              <FileSpreadsheet size={14} />
              Excel (.xlsx)
            </button>
            <button
              onClick={handleExportPDF}
              disabled={filteredAndSorted.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              id="btn-export-pdf"
            >
              <FileText size={14} />
              PDF Lengkap (.pdf)
            </button>
          </div>
        </div>
      </div>

      {/* Activities Grid or Table View */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
          <svg className="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Sinkronisasi Lembar Kerja...</span>
        </div>
      ) : filteredAndSorted.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-full w-fit mx-auto text-slate-400 border border-slate-100 dark:border-slate-800 mb-4">
            <Filter size={24} />
          </div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Tidak ada data yang cocok</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Sistem tidak menemukan data kegiatan yang cocok dengan kriteria pencarian atau penyaringan Anda.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-4 px-4 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/15 rounded-xl border border-indigo-100 dark:border-indigo-500/35 transition-all"
            id="btn-no-data-reset"
          >
            Kosongkan Seluruh Filter
          </button>
        </div>
      ) : viewLayout === 'grid' ? (
        /* Bento Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="list-grid-view">
          {filteredAndSorted.map((item) => (
            <div 
              key={item.id}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden flex flex-col justify-between group shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 relative"
            >
              <div>
                {/* Header Image Thumbnail */}
                <div className="relative aspect-video w-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                  {item.fotos && item.fotos.length > 0 ? (
                    <img 
                      src={item.fotos[0].url} 
                      alt={item.namaKegiatan} 
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-slate-400">
                      <ImageIcon size={28} />
                      <span className="text-[10px]">Tanpa Foto</span>
                    </div>
                  )}

                  {/* ID Tag */}
                  <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-xxs font-mono font-black text-white px-2.5 py-1 rounded-md">
                    {item.id}
                  </span>

                  {/* Date Tag */}
                  <span className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs text-[10px] font-bold text-slate-800 dark:text-slate-200 px-2 py-1 rounded-md shadow-xs flex items-center gap-1">
                    <Calendar size={10} className="text-slate-500" />
                    {item.tanggal}
                  </span>

                  {/* Multiple Photos Count */}
                  {item.fotos && item.fotos.length > 1 && (
                    <span className="absolute bottom-3 right-3 bg-indigo-600/90 text-white font-mono font-bold text-[9px] px-2 py-1 rounded-md shadow-xs">
                      +{item.fotos.length - 1} FOTO DOK.
                    </span>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-3.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${CATEGORY_COLORS[item.jenisKegiatan].bg} ${CATEGORY_COLORS[item.jenisKegiatan].text} ${CATEGORY_COLORS[item.jenisKegiatan].border}`}>
                      {item.jenisKegiatan}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-400 font-medium">
                      Hari {item.hari}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" title={item.namaKegiatan}>
                      {item.namaKegiatan}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {item.deskripsi}
                    </p>
                  </div>

                  {/* Meta items */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/50 text-[11px] text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin size={12} className="text-slate-400 flex-shrink-0" />
                      <span className="truncate" title={item.lokasi}>{item.lokasi}</span>
                    </div>
                    <div className="flex items-center gap-1.5 justify-end">
                      <Users size={12} className="text-slate-400" />
                      <span><strong>{item.jumlahPeserta}</strong> Peserta</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between gap-3">
                <button
                  onClick={() => onViewDetail(item)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white transition-colors"
                  title="Lihat Detail Lengkap"
                  id={`btn-view-${item.id}`}
                >
                  <Eye size={14} />
                  Detail
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(item)}
                    className="p-1.5 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/15 dark:hover:text-indigo-400 text-slate-500 dark:text-slate-400 rounded-lg transition-colors"
                    title="Ubah Data"
                    id={`btn-edit-${item.id}`}
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-1.5 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/15 dark:hover:text-rose-400 text-slate-500 dark:text-slate-400 rounded-lg transition-colors"
                    title="Hapus Data"
                    id={`btn-delete-${item.id}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List Table Layout */
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden shadow-sm" id="list-table-view">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4 w-16">ID</th>
                  <th className="py-3 px-4">Nama Kegiatan</th>
                  <th className="py-3 px-4">Jenis</th>
                  <th className="py-3 px-4">Hari, Tanggal</th>
                  <th className="py-3 px-4">Lokasi</th>
                  <th className="py-3 px-4 text-right">Peserta</th>
                  <th className="py-3 px-4 text-center">Foto</th>
                  <th className="py-3 px-4 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-xs">
                {filteredAndSorted.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-black text-slate-900 dark:text-white">{item.id}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      <div className="max-w-xs truncate" title={item.namaKegiatan}>{item.namaKegiatan}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${CATEGORY_COLORS[item.jenisKegiatan].bg} ${CATEGORY_COLORS[item.jenisKegiatan].text} ${CATEGORY_COLORS[item.jenisKegiatan].border}`}>
                        {item.jenisKegiatan}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      <div>{item.hari}, {item.tanggal}</div>
                      <div className="text-[10px] text-slate-400">{item.waktu}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      <div className="max-w-xxs truncate" title={item.lokasi}>{item.lokasi}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-800 dark:text-white">
                      {item.jumlahPeserta.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-500">
                      <span className="font-mono bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                        {item.fotos?.length || 0}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onViewDetail(item)}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-lg transition-colors"
                          title="Detail"
                          id={`table-btn-view-${item.id}`}
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => onEdit(item)}
                          className="p-1.5 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/15 dark:hover:text-indigo-400 text-slate-500 dark:text-slate-400 rounded-lg transition-colors"
                          title="Edit"
                          id={`table-btn-edit-${item.id}`}
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => onDelete(item.id)}
                          className="p-1.5 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/15 dark:hover:text-rose-400 text-slate-500 dark:text-slate-400 rounded-lg transition-colors"
                          title="Hapus"
                          id={`table-btn-delete-${item.id}`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
