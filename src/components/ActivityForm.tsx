import { useState, useEffect, useRef, DragEvent, ChangeEvent, FormEvent } from 'react';
import { Kegiatan, JenisKegiatan, FotoInfo } from '../types';
import { 
  Save, 
  X, 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Users,
  AlertCircle
} from 'lucide-react';
import { getDayFromDate } from '../utils/gasClient';

interface ActivityFormProps {
  editingKegiatan?: Kegiatan | null;
  onSave: (
    kegiatan: Omit<Kegiatan, 'id' | 'fotos' | 'tanggalDibuat'> & { fotos?: FotoInfo[] },
    newFiles?: { name: string; type: string; base64: string }[],
    deletedFotoIds?: string[]
  ) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export default function ActivityForm({ editingKegiatan, onSave, onCancel, isLoading }: ActivityFormProps) {
  const isEditMode = !!editingKegiatan;

  // Form Fields State
  const [namaKegiatan, setNamaKegiatan] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [hari, setHari] = useState('');
  const [waktu, setWaktu] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [jumlahPeserta, setJumlahPeserta] = useState<number | ''>('');
  const [jenisKegiatan, setJenisKegiatan] = useState<JenisKegiatan>('FGD');
  const [deskripsi, setDeskripsi] = useState('');

  // Photos State
  const [existingFotos, setExistingFotos] = useState<FotoInfo[]>([]);
  const [deletedFotoIds, setDeletedFotoIds] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<{ file: File; base64: string; previewUrl: string }[]>([]);

  // Drag and drop hover state
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form fields for edit mode or empty for create mode
  useEffect(() => {
    if (editingKegiatan) {
      setNamaKegiatan(editingKegiatan.namaKegiatan);
      setTanggal(editingKegiatan.tanggal);
      setHari(editingKegiatan.hari);
      setWaktu(editingKegiatan.waktu);
      setLokasi(editingKegiatan.lokasi);
      setJumlahPeserta(editingKegiatan.jumlahPeserta);
      setJenisKegiatan(editingKegiatan.jenisKegiatan);
      setDeskripsi(editingKegiatan.deskripsi);
      setExistingFotos(editingKegiatan.fotos || []);
      setDeletedFotoIds([]);
      setNewFiles([]);
    } else {
      setNamaKegiatan('');
      setTanggal('');
      setHari('');
      setWaktu('');
      setLokasi('');
      setJumlahPeserta('');
      setJenisKegiatan('FGD');
      setDeskripsi('');
      setExistingFotos([]);
      setDeletedFotoIds([]);
      setNewFiles([]);
    }
    setErrorMsg(null);
  }, [editingKegiatan]);

  // Auto detect day (hari) when date (tanggal) changes
  const handleDateChange = (dateVal: string) => {
    setTanggal(dateVal);
    if (dateVal) {
      const detectedDay = getDayFromDate(dateVal);
      setHari(detectedDay);
    } else {
      setHari('');
    }
  };

  // Helper: Read file as base64 string
  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Gagal membaca file'));
      reader.readAsDataURL(file);
    });
  };

  // Handle files adding
  const handleAddFiles = async (files: FileList) => {
    setErrorMsg(null);
    const validFiles: { file: File; base64: string; previewUrl: string }[] = [...newFiles];
    
    // Check total limit (existing not deleted + current new + prospective files)
    const activeExistingCount = existingFotos.filter(f => !deletedFotoIds.includes(f.id)).length;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Limit to 20 total
      if (activeExistingCount + validFiles.length >= 20) {
        setErrorMsg('Maksimal foto kegiatan adalah 20 foto per kegiatan.');
        break;
      }

      // Check file size (limit 8MB per image to avoid excessively large payload)
      if (file.size > 8 * 1024 * 1024) {
        setErrorMsg(`File ${file.name} melebihi batas ukuran 8MB.`);
        continue;
      }

      // Must be an image
      if (!file.type.startsWith('image/')) {
        setErrorMsg(`File ${file.name} bukan format gambar yang valid.`);
        continue;
      }

      try {
        const base64 = await readFileAsBase64(file);
        const previewUrl = URL.createObjectURL(file);
        validFiles.push({ file, base64, previewUrl });
      } catch (err) {
        console.error('File reading failed:', err);
      }
    }

    setNewFiles(validFiles);
  };

  // Drag-and-drop Handlers
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleAddFiles(e.dataTransfer.files);
    }
  };

  // Input change handler
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleAddFiles(e.target.files);
    }
  };

  // Remove photo from queue/existence
  const removeExistingFoto = (id: string) => {
    setDeletedFotoIds(prev => [...prev, id]);
  };

  const undoRemoveExistingFoto = (id: string) => {
    setDeletedFotoIds(prev => prev.filter(item => item !== id));
  };

  const removeNewFile = (index: number) => {
    const updated = [...newFiles];
    // Clean URL
    URL.revokeObjectURL(updated[index].previewUrl);
    updated.splice(index, 1);
    setNewFiles(updated);
  };

  // Form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!namaKegiatan.trim() || namaKegiatan.length < 5) {
      setErrorMsg('Nama kegiatan harus diisi minimal 5 karakter.');
      return;
    }
    if (!tanggal) {
      setErrorMsg('Tanggal pelaksanaan harus diisi.');
      return;
    }
    if (!lokasi.trim()) {
      setErrorMsg('Lokasi kegiatan harus diisi.');
      return;
    }
    if (jumlahPeserta === '' || jumlahPeserta <= 0) {
      setErrorMsg('Jumlah peserta harus berupa angka positif.');
      return;
    }

    const totalActiveFotos = existingFotos.filter(f => !deletedFotoIds.includes(f.id)).length + newFiles.length;
    if (totalActiveFotos === 0) {
      setErrorMsg('Dokumentasi foto kegiatan minimal harus mengunggah 1 foto.');
      return;
    }

    try {
      const dataToSave = {
        namaKegiatan: namaKegiatan.trim(),
        hari,
        tanggal,
        waktu: waktu.trim() || 'Sesuai Jadwal',
        lokasi: lokasi.trim(),
        jumlahPeserta: Number(jumlahPeserta),
        jenisKegiatan,
        deskripsi: deskripsi.trim() || '-'
      };

      // Transform new files for saving (only name, type, and base64)
      const mappedNewFiles = newFiles.map(item => ({
        name: item.file.name,
        type: item.file.type,
        base64: item.base64
      }));

      await onSave(dataToSave, mappedNewFiles, deletedFotoIds);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan kegiatan. Periksa koneksi atau URL Apps Script Anda.');
    }
  };

  // Count active photos
  const activePhotosCount = existingFotos.filter(f => !deletedFotoIds.includes(f.id)).length + newFiles.length;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-md overflow-hidden max-w-4xl mx-auto" id="form-kegiatan-container">
      {/* Header Form */}
      <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            type="button"
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-300 transition-colors"
            id="btn-back-to-list"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isEditMode ? 'Edit Data Kegiatan' : 'Tambah Kegiatan Baru'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isEditMode ? `Memperbarui data ${editingKegiatan.id}` : 'Masukkan data rincian kegiatan dan foto dokumentasi'}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-full uppercase">
          {isEditMode ? 'Mode Edit' : 'Mode Entri'}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Error Alert Box */}
        {errorMsg && (
          <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200/50 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 rounded-xl flex items-start gap-3">
            <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
            <div className="text-xs font-medium">{errorMsg}</div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Column Left: Textual inputs */}
          <div className="space-y-4">
            {/* Nama Kegiatan */}
            <div className="space-y-1.5">
              <label htmlFor="namaKegiatan" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                Nama Kegiatan <span className="text-rose-500">*</span>
              </label>
              <input
                id="namaKegiatan"
                type="text"
                required
                value={namaKegiatan}
                onChange={(e) => setNamaKegiatan(e.target.value)}
                placeholder="Contoh: FGD Evaluasi Sanitasi Terpadu"
                disabled={isLoading}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder-slate-400 disabled:opacity-60"
              />
            </div>

            {/* Row: Tanggal & Hari */}
            <div className="grid grid-cols-2 gap-4">
              {/* Tanggal */}
              <div className="space-y-1.5">
                <label htmlFor="tanggal" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  Tanggal <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="tanggal"
                    type="date"
                    required
                    value={tanggal}
                    onChange={(e) => handleDateChange(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-3.5 pr-8 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-60"
                  />
                  <Calendar size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Hari */}
              <div className="space-y-1.5">
                <label htmlFor="hari" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  Hari (Otomatis)
                </label>
                <input
                  id="hari"
                  type="text"
                  readOnly
                  value={hari}
                  placeholder="Terisi otomatis"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-slate-400 font-medium focus:outline-none"
                />
              </div>
            </div>

            {/* Row: Waktu & Jumlah Peserta */}
            <div className="grid grid-cols-2 gap-4">
              {/* Waktu */}
              <div className="space-y-1.5">
                <label htmlFor="waktu" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  Waktu Pelaksanaan <span className="text-slate-400 font-normal">(opsional)</span>
                </label>
                <div className="relative">
                  <input
                    id="waktu"
                    type="text"
                    value={waktu}
                    onChange={(e) => setWaktu(e.target.value)}
                    placeholder="Contoh: 08:30 - Selesai"
                    disabled={isLoading}
                    className="w-full pl-3.5 pr-8 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder-slate-400 disabled:opacity-60"
                  />
                  <Clock size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Jumlah Peserta */}
              <div className="space-y-1.5">
                <label htmlFor="jumlahPeserta" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  Jumlah Peserta <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="jumlahPeserta"
                    type="number"
                    required
                    min="1"
                    value={jumlahPeserta}
                    onChange={(e) => setJumlahPeserta(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Masukkan angka"
                    disabled={isLoading}
                    className="w-full pl-3.5 pr-8 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder-slate-400 disabled:opacity-60"
                  />
                  <Users size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Lokasi */}
            <div className="space-y-1.5">
              <label htmlFor="lokasi" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                Lokasi Pelaksanaan <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="lokasi"
                  type="text"
                  required
                  value={lokasi}
                  onChange={(e) => setLokasi(e.target.value)}
                  placeholder="Contoh: Aula Kantor Camat Utama"
                  disabled={isLoading}
                  className="w-full pl-3.5 pr-8 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder-slate-400 disabled:opacity-60"
                />
                <MapPin size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Jenis Kegiatan */}
            <div className="space-y-1.5">
              <label htmlFor="jenisKegiatan" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                Jenis Kegiatan <span className="text-rose-500">*</span>
              </label>
              <select
                id="jenisKegiatan"
                required
                value={jenisKegiatan}
                onChange={(e) => setJenisKegiatan(e.target.value as JenisKegiatan)}
                disabled={isLoading}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-60"
              >
                <option value="FGD">FGD (Focus Group Discussion)</option>
                <option value="Metra">Metra (Media Tradisional)</option>
                <option value="Reses">Reses (Jaring Aspirasi)</option>
                <option value="Pertemuan Internal">Pertemuan Internal (Rapat/Staff)</option>
                <option value="Kegiatan Lainnya">Kegiatan Lainnya</option>
              </select>
            </div>
          </div>

          {/* Column Right: Description and Photo Documentations */}
          <div className="space-y-4">
            {/* Deskripsi */}
            <div className="space-y-1.5">
              <label htmlFor="deskripsi" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                Deskripsi Kegiatan <span className="text-slate-400 font-normal">(opsional)</span>
              </label>
              <textarea
                id="deskripsi"
                rows={3}
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                placeholder="Tuliskan uraian hasil kegiatan atau pembahasan penting..."
                disabled={isLoading}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder-slate-400 disabled:opacity-60 resize-none"
              />
            </div>

            {/* Photos Upload & Previews */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  Dokumentasi Foto <span className="text-rose-500">*</span>
                </span>
                <span className={`text-[10px] font-medium font-mono ${activePhotosCount > 20 ? 'text-rose-500' : 'text-slate-500'}`}>
                  {activePhotosCount} / 20 Foto (Maks 8MB/foto)
                </span>
              </div>

              {/* Drag and Drop Container */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  isDragging 
                    ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-500/10' 
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-900/30'
                }`}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="p-2.5 bg-white dark:bg-slate-800 rounded-full text-slate-400 shadow-sm border border-slate-100 dark:border-slate-700">
                    <Upload size={20} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Tarik & Lepas Foto, atau <span className="text-indigo-600 dark:text-indigo-400 underline">Pilih File</span>
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      Mendukung format JPG, PNG, WEBP (Maksimal 20 berkas sekaligus)
                    </p>
                  </div>
                </div>
              </div>

              {/* Photos Previews List */}
              {activePhotosCount > 0 && (
                <div className="mt-3 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
                  <p className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wide">
                    Daftar Foto Terpilih ({activePhotosCount})
                  </p>
                  
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-1">
                    {/* 1. Existing photos in Edit Mode */}
                    {existingFotos.map((foto) => {
                      const isDeleted = deletedFotoIds.includes(foto.id);
                      return (
                        <div 
                          key={foto.id} 
                          className={`relative aspect-square rounded-lg overflow-hidden border ${
                            isDeleted ? 'opacity-30 border-rose-500/50 bg-rose-50 dark:bg-rose-950/20' : 'border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <img 
                            src={foto.url} 
                            alt="Existing documentation" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          {isDeleted ? (
                            <button
                              type="button"
                              onClick={() => undoRemoveExistingFoto(foto.id)}
                              className="absolute inset-0 bg-rose-900/40 text-[9px] text-white font-extrabold flex items-center justify-center hover:bg-rose-950/60"
                            >
                              Batal Hapus
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => removeExistingFoto(foto.id)}
                              title="Hapus foto dari Drive"
                              className="absolute top-1 right-1 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-md shadow-md transition-colors"
                            >
                              <Trash2 size={10} />
                            </button>
                          )}
                        </div>
                      );
                    })}

                    {/* 2. Newly added files waiting to upload */}
                    {newFiles.map((item, index) => (
                      <div 
                        key={index} 
                        className="relative aspect-square rounded-lg overflow-hidden border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/20"
                      >
                        <img 
                          src={item.previewUrl} 
                          alt="New documentation preview" 
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 left-1 bg-indigo-600 text-[8px] font-bold text-white px-1 py-0.5 rounded">
                          Baru
                        </span>
                        <button
                          type="button"
                          onClick={() => removeNewFile(index)}
                          className="absolute top-1 right-1 p-1 bg-slate-900/80 hover:bg-rose-600 text-white rounded-md shadow-md transition-colors"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-700/50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl transition-colors disabled:opacity-50"
            id="btn-form-cancel"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isLoading || activePhotosCount === 0 || (activePhotosCount > 20)}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-xl transition-colors shadow-md shadow-indigo-600/10 disabled:opacity-50 disabled:cursor-not-allowed"
            id="btn-form-submit"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Simpan Kegiatan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
