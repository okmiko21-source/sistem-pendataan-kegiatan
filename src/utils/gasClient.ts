import { Kegiatan, IntegrationSettings, JenisKegiatan, FotoInfo } from '../types';

const STORAGE_KEY = 'kegiatan_data';
const SETTINGS_KEY = 'kegiatan_settings';

// Initial Mock Data with beautiful Unsplash images for a highly professional aesthetic
const INITIAL_MOCK_DATA: Kegiatan[] = [
  {
    id: 'KGT-001',
    namaKegiatan: 'FGD Evaluasi Program Sanitasi Lingkungan Terpadu',
    hari: 'Rabu',
    tanggal: '2026-06-10',
    waktu: '09:00 - 12:00',
    lokasi: 'Ruang Rapat Utama Balaikota Lt. 2',
    jumlahPeserta: 45,
    jenisKegiatan: 'FGD',
    deskripsi: 'Focus Group Discussion (FGD) ini dilaksanakan bersama perwakilan dinas kesehatan, dinas pekerjaan umum, dan komunitas lingkungan tingkat kecamatan. Agenda utama berfokus pada evaluasi efektivitas infrastruktur sanitasi yang dibangun pada kuartal pertama tahun 2026 serta penyusunan strategi pemeliharaan berbasis masyarakat guna menjamin keberlanjutan program jangka panjang.',
    fotos: [
      {
        id: 'mock-1-1',
        url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
        name: 'FGD_Sanitasi_1.jpg'
      },
      {
        id: 'mock-1-2',
        url: 'https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?w=800&auto=format&fit=crop&q=80',
        name: 'FGD_Sanitasi_Diskusi.jpg'
      }
    ],
    tanggalDibuat: '2026-06-10T13:00:00.000Z'
  },
  {
    id: 'KGT-002',
    namaKegiatan: 'Sosialisasi Bahaya Narkoba Lewat Media Tradisional (Metra)',
    hari: 'Sabtu',
    tanggal: '2026-06-13',
    waktu: '19:30 - 22:30',
    lokasi: 'Alun-Alun Kelurahan Selat Penugasan',
    jumlahPeserta: 250,
    jenisKegiatan: 'Metra',
    deskripsi: 'Pementasan media tradisional (Metra) berupa seni teater rakyat dikombinasikan dengan musik daerah kontemporer. Pertunjukan ini bertujuan menyebarluaskan pesan edukatif mengenai bahaya penyalahgunaan narkotika di kalangan remaja dengan cara yang menghibur dan mudah diterima oleh masyarakat lokal. Acara dihadiri antusias oleh ratusan warga sekitar.',
    fotos: [
      {
        id: 'mock-2-1',
        url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
        name: 'Metra_Teater_Rakyat.jpg'
      },
      {
        id: 'mock-2-2',
        url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80',
        name: 'Metra_Penonton.jpg'
      }
    ],
    tanggalDibuat: '2026-06-13T23:00:00.000Z'
  },
  {
    id: 'KGT-003',
    namaKegiatan: 'Reses Masa Persidangan II DPRD Daerah Pemilihan 3',
    hari: 'Senin',
    tanggal: '2026-06-15',
    waktu: '13:00 - 16:00',
    lokasi: 'Aula Pertemuan Kantor Kecamatan Barat',
    jumlahPeserta: 120,
    jenisKegiatan: 'Reses',
    deskripsi: 'Kegiatan jaring aspirasi (Reses) Anggota DPRD Dapil 3 untuk mendengarkan masukan langsung dari konstituen terkait pembangunan jalan lingkungan, perbaikan sistem drainase, dan peningkatan fasilitas posyandu. Seluruh usulan dari para tokoh masyarakat, ketua RT/RW, dan karang taruna telah dicatat untuk ditindaklanjuti dalam rapat paripurna.',
    fotos: [
      {
        id: 'mock-3-1',
        url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80',
        name: 'Reses_Dapil_Pertemuan.jpg'
      }
    ],
    tanggalDibuat: '2026-06-15T17:00:00.000Z'
  },
  {
    id: 'KGT-004',
    namaKegiatan: 'Rapat Koordinasi Bulanan Penilaian Kinerja Triwulan',
    hari: 'Kamis',
    tanggal: '2026-06-18',
    waktu: '08:30 - 11:30',
    lokasi: 'Ruang Kerja Kepala Kantor Lt. 1',
    jumlahPeserta: 18,
    jenisKegiatan: 'Pertemuan Internal',
    deskripsi: 'Rapat internal rutin bulanan guna membahas capaian Indikator Kinerja Utama (IKU) masing-masing seksi kerja pada triwulan kedua berjalan. Rapat juga mengidentifikasi kendala administratif maupun teknis di lapangan, menyusun rencana aksi percepatan program, serta memastikan keselarasan dokumen laporan bulanan sebelum diserahkan ke tingkat dinas.',
    fotos: [
      {
        id: 'mock-4-1',
        url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop&q=80',
        name: 'Rapat_Internal_Staff.jpg'
      }
    ],
    tanggalDibuat: '2026-06-18T12:00:00.000Z'
  }
];

export const getSettings = (): IntegrationSettings => {
  const saved = localStorage.getItem(SETTINGS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      // Use default
    }
  }
  return { mode: 'local', gasUrl: '' };
};

export const saveSettings = (settings: IntegrationSettings): void => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

// Local storage helper for Mock Mode
const getLocalKegiatan = (): Kegiatan[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      // Ignore and use default
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_DATA));
  return INITIAL_MOCK_DATA;
};

const saveLocalKegiatan = (data: Kegiatan[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// Format day helper
export const getDayFromDate = (dateString: string): string => {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Senin'; // Fallback
  return days[date.getDay()];
};

// Apps Script API Client and Fallback Local Manager
export const api = {
  getKegiatanList: async (settings: IntegrationSettings): Promise<Kegiatan[]> => {
    if (settings.mode === 'local' || !settings.gasUrl) {
      return getLocalKegiatan();
    }

    try {
      const response = await fetch(`${settings.gasUrl}?action=get`);
      if (!response.ok) throw new Error('Gagal mengambil data dari Google Apps Script');
      const json = await response.json();
      if (json.success === false) {
        throw new Error(json.message || 'Error dari server');
      }
      return json.data || [];
    } catch (error) {
      console.error('API Error (getKegiatanList), falling back to Local:', error);
      throw error; // Let UI catch it to show warning, but UI can offer to toggle to local mode
    }
  },

  createKegiatan: async (
    settings: IntegrationSettings,
    kegiatan: Omit<Kegiatan, 'id' | 'tanggalDibuat' | 'fotos'>,
    newFiles?: { name: string; type: string; base64: string }[]
  ): Promise<Kegiatan> => {
    const tanggalDibuat = new Date().toISOString();

    if (settings.mode === 'local' || !settings.gasUrl) {
      const localData = getLocalKegiatan();
      const nextIdNum = Math.max(...localData.map(k => {
        const num = parseInt(k.id.split('-')[1]);
        return isNaN(num) ? 0 : num;
      }), 0) + 1;
      const nextId = `KGT-${String(nextIdNum).padStart(3, '0')}`;

      // Convert new files to base64 or directly store them as urls
      const fotos: FotoInfo[] = [];
      if (newFiles) {
        newFiles.forEach((file, index) => {
          fotos.push({
            id: `local-img-${Date.now()}-${index}`,
            url: file.base64, // local base64 serves as image url
            name: file.name
          });
        });
      }

      const newKegiatan: Kegiatan = {
        ...kegiatan,
        id: nextId,
        fotos,
        tanggalDibuat
      };

      localData.unshift(newKegiatan); // Add to the top
      saveLocalKegiatan(localData);
      return newKegiatan;
    }

    // Google Apps Script Mode
    try {
      const payload = {
        action: 'create',
        data: {
          ...kegiatan,
          tanggalDibuat,
          newFiles: newFiles || [] // array of { name, type, base64 }
        }
      };

      const response = await fetch(settings.gasUrl, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'text/plain', // GAS requires text/plain or no preflight to bypass CORS preflight easily
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Gagal mengirim data ke Google Apps Script');
      const json = await response.json();
      if (json.success === false) {
        throw new Error(json.message || 'Gagal menyimpan data ke Google Sheets');
      }
      return json.data;
    } catch (error) {
      console.error('API Error (createKegiatan):', error);
      throw error;
    }
  },

  updateKegiatan: async (
    settings: IntegrationSettings,
    id: string,
    kegiatan: Partial<Kegiatan>,
    newFiles?: { name: string; type: string; base64: string }[],
    deletedFotoIds?: string[] // photos that were removed by the user in edit mode
  ): Promise<Kegiatan> => {
    if (settings.mode === 'local' || !settings.gasUrl) {
      const localData = getLocalKegiatan();
      const index = localData.findIndex(k => k.id === id);
      if (index === -1) throw new Error('Kegiatan tidak ditemukan');

      const existing = localData[index];
      
      // Filter out deleted photos
      let updatedFotos = existing.fotos.filter(f => !deletedFotoIds?.includes(f.id));

      // Append new photos
      if (newFiles) {
        newFiles.forEach((file, fIndex) => {
          updatedFotos.push({
            id: `local-img-${Date.now()}-${fIndex}`,
            url: file.base64,
            name: file.name
          });
        });
      }

      const updatedKegiatan: Kegiatan = {
        ...existing,
        ...kegiatan,
        fotos: updatedFotos,
        id // enforce ID
      } as Kegiatan;

      localData[index] = updatedKegiatan;
      saveLocalKegiatan(localData);
      return updatedKegiatan;
    }

    // Google Apps Script Mode
    try {
      const payload = {
        action: 'update',
        id,
        data: {
          ...kegiatan,
          deletedFotoIds: deletedFotoIds || [],
          newFiles: newFiles || []
        }
      };

      const response = await fetch(settings.gasUrl, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Gagal mengupdate data di Google Apps Script');
      const json = await response.json();
      if (json.success === false) {
        throw new Error(json.message || 'Gagal mengupdate data ke Google Sheets');
      }
      return json.data;
    } catch (error) {
      console.error('API Error (updateKegiatan):', error);
      throw error;
    }
  },

  deleteKegiatan: async (settings: IntegrationSettings, id: string): Promise<boolean> => {
    if (settings.mode === 'local' || !settings.gasUrl) {
      const localData = getLocalKegiatan();
      const updated = localData.filter(k => k.id !== id);
      saveLocalKegiatan(updated);
      return true;
    }

    // Google Apps Script Mode
    try {
      const payload = {
        action: 'delete',
        id
      };

      const response = await fetch(settings.gasUrl, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Gagal menghapus data di Google Apps Script');
      const json = await response.json();
      if (json.success === false) {
        throw new Error(json.message || 'Gagal menghapus data dari Google Sheets');
      }
      return true;
    } catch (error) {
      console.error('API Error (deleteKegiatan):', error);
      throw error;
    }
  }
};

// COMPLETE APPS SCRIPT CODE FOR COPY-PASTING
export const APPS_SCRIPT_CODE = `/**
 * GOOGLE APPS SCRIPT - SISTEM PENDATAAN KEGIATAN
 * 
 * Petunjuk Penggunaan:
 * 1. Buat Spreadsheet baru di Google Sheets. Namai "Sistem Pendataan Kegiatan".
 * 2. Buat satu lembar kerja (sheet) dan beri nama "Kegiatan".
 * 3. Isi baris pertama (A1:L1) dengan header kolom persis berikut:
 *    ID | Nama Kegiatan | Hari | Tanggal | Waktu | Lokasi | Jumlah Peserta | Jenis Kegiatan | Deskripsi | Foto URLs | Foto File IDs | Tanggal Dibuat
 * 4. Buat folder baru di Google Drive untuk menyimpan dokumentasi foto, misalnya "Foto Kegiatan".
 * 5. Klik menu "Ekstensi" > "Apps Script" pada spreadsheet Anda.
 * 6. Hapus semua kode default, lalu salin dan tempel (paste) seluruh kode di bawah ini.
 * 7. Ganti nilai variabel FOLDER_ID di bawah dengan ID folder Google Drive Anda.
 * 8. Klik tombol Simpan (ikon disket).
 * 9. Klik "Terapkan" (Deploy) > "Penerapan baru".
 * 10. Pilih jenis: "Aplikasi Web" (Web App).
 * 11. Konfigurasi:
 *     - Jalankan sebagai: "Saya" (Me - email Anda)
 *     - Siapa yang memiliki akses: "Siapa saja" (Anyone - agar bisa dipanggil dari web app)
 * 12. Klik "Terapkan" dan berikan Otorisasi akses yang diminta.
 * 13. Salin URL Aplikasi Web yang diberikan dan tempelkan di panel Pengaturan Integrasi di sistem ini!
 */

// GANTI DENGAN ID FOLDER GOOGLE DRIVE ANDA
const FOLDER_ID = "MASUKKAN_ID_FOLDER_DRIVE_ANDA_DISINI";

// Tambahkan header CORS untuk respon preflight OPTIONS (jika diperlukan) atau bypass standard
function doGet(e) {
  try {
    const action = e.parameter.action;
    
    if (action === "get") {
      return responseJson({ success: true, data: fetchAllKegiatan() });
    }
    
    return responseJson({ success: true, message: "Apps Script API is Active!" });
  } catch (error) {
    return responseJson({ success: false, message: error.toString() });
  }
}

function doPost(e) {
  try {
    const jsonString = e.postData.contents;
    const request = JSON.parse(jsonString);
    const action = request.action;
    
    if (action === "get") {
      return responseJson({ success: true, data: fetchAllKegiatan() });
    } else if (action === "create") {
      return responseJson({ success: true, data: addKegiatan(request.data) });
    } else if (action === "update") {
      return responseJson({ success: true, data: editKegiatan(request.id, request.data) });
    } else if (action === "delete") {
      const deleteSuccess = removeKegiatan(request.id);
      return responseJson({ success: deleteSuccess, message: deleteSuccess ? "Berhasil dihapus" : "Gagal dihapus" });
    }
    
    return responseJson({ success: false, message: "Action tidak dikenali" });
  } catch (error) {
    return responseJson({ success: false, message: error.toString() });
  }
}

// Helper untuk format response JSON dengan CORS header
function responseJson(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// Membaca semua data dari Google Sheet
function fetchAllKegiatan() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Kegiatan");
  if (!sheet) return [];
  
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return []; // Hanya ada header
  
  const headers = values[0];
  const kegiatanList = [];
  
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const item = {};
    
    headers.forEach((header, index) => {
      const camelCaseKey = toCamelCase(header);
      let val = row[index];
      
      // Parse tanggal ke format string YYYY-MM-DD
      if (header === "Tanggal" && val instanceof Date) {
        val = Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
      }
      // Parse Tanggal Dibuat ke ISO String
      if (header === "Tanggal Dibuat" && val instanceof Date) {
        val = val.toISOString();
      }
      
      item[camelCaseKey] = val;
    });
    
    // Format fotos array dari data koma/JSON
    const urls = (item.fotoUrls || "").toString().split(",").filter(Boolean);
    const ids = (item.fotoFileIds || "").toString().split(",").filter(Boolean);
    
    item.fotos = [];
    for (let j = 0; j < Math.max(urls.length, ids.length); j++) {
      item.fotos.push({
        id: ids[j] || "file-id-" + j,
        url: urls[j] || ""
      });
    }
    
    // Hapus temporary fields agar rapi
    delete item.fotoUrls;
    delete item.fotoFileIds;
    
    kegiatanList.push(item);
  }
  
  // Urutkan berdasarkan tanggalDibuat terbaru
  kegiatanList.sort((a, b) => new Date(b.tanggalDibuat) - new Date(a.tanggalDibuat));
  
  return kegiatanList;
}

// Menyimpan kegiatan baru ke Google Sheets & mengunggah foto ke Google Drive
function addKegiatan(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Kegiatan");
  if (!sheet) {
    throw new Error("Sheet bernama 'Kegiatan' tidak ditemukan!");
  }
  
  // Buat ID Baru
  const lastRow = sheet.getLastRow();
  let nextNum = 1;
  if (lastRow > 1) {
    const lastId = sheet.getRange(lastRow, 1).getValue().toString();
    const match = lastId.match(/KGT-(\\d+)/);
    if (match) {
      nextNum = parseInt(match[1]) + 1;
    }
  }
  const newId = "KGT-" + String(nextNum).padStart(3, "0");
  
  // Unggah foto baru ke Google Drive
  const uploadedFiles = [];
  if (data.newFiles && data.newFiles.length > 0) {
    data.newFiles.forEach(function(file) {
      const fileInfo = uploadToDrive(file.base64, file.name, file.type);
      if (fileInfo) {
        uploadedFiles.push(fileInfo);
      }
    });
  }
  
  const fotoUrls = uploadedFiles.map(f => f.url).join(",");
  const fotoIds = uploadedFiles.map(f => f.id).join(",");
  
  // Tambah baris baru sesuai urutan kolom:
  // ID | Nama Kegiatan | Hari | Tanggal | Waktu | Lokasi | Jumlah Peserta | Jenis Kegiatan | Deskripsi | Foto URLs | Foto File IDs | Tanggal Dibuat
  const dateObj = new Date(data.tanggal);
  const createdDate = new Date(data.tanggalDibuat || new Date().toISOString());
  
  sheet.appendRow([
    newId,
    data.namaKegiatan,
    data.hari,
    dateObj,
    data.waktu,
    data.lokasi,
    Number(data.jumlahPeserta),
    data.jenisKegiatan,
    data.deskripsi,
    fotoUrls,
    fotoIds,
    createdDate
  ]);
  
  return {
    id: newId,
    namaKegiatan: data.namaKegiatan,
    hari: data.hari,
    tanggal: data.tanggal,
    waktu: data.waktu,
    lokasi: data.lokasi,
    jumlahPeserta: Number(data.jumlahPeserta),
    jenisKegiatan: data.jenisKegiatan,
    deskripsi: data.deskripsi,
    fotos: uploadedFiles,
    tanggalDibuat: createdDate.toISOString()
  };
}

// Mengedit kegiatan di Google Sheet
function editKegiatan(id, data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Kegiatan");
  if (!sheet) throw new Error("Sheet tidak ditemukan!");
  
  const rows = sheet.getDataRange().getValues();
  let rowIndex = -1;
  
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0].toString() === id) {
      rowIndex = i + 1; // 1-indexed dan baris header disesuaikan
      break;
    }
  }
  
  if (rowIndex === -1) throw new Error("Data kegiatan dengan ID " + id + " tidak ditemukan!");
  
  // Tarik foto lama
  const existingUrlsStr = rows[rowIndex - 1][9] || "";
  const existingIdsStr = rows[rowIndex - 1][10] || "";
  
  let existingUrls = existingUrlsStr.split(",").filter(Boolean);
  let existingIds = existingIdsStr.split(",").filter(Boolean);
  
  // Hapus foto yang dipilih untuk dihapus
  const deletedFotoIds = data.deletedFotoIds || [];
  if (deletedFotoIds.length > 0) {
    deletedFotoIds.forEach(function(fileId) {
      // Hapus file fisik di Google Drive
      deleteFileFromDrive(fileId);
      
      // Hapus dari data sheet
      const index = existingIds.indexOf(fileId);
      if (index !== -1) {
        existingUrls.splice(index, 1);
        existingIds.splice(index, 1);
      }
    });
  }
  
  // Unggah foto baru
  const uploadedFiles = [];
  if (data.newFiles && data.newFiles.length > 0) {
    data.newFiles.forEach(function(file) {
      const fileInfo = uploadToDrive(file.base64, file.name, file.type);
      if (fileInfo) {
        uploadedFiles.push(fileInfo);
        existingUrls.push(fileInfo.url);
        existingIds.push(fileInfo.id);
      }
    });
  }
  
  const finalUrls = existingUrls.join(",");
  const finalIds = existingIds.join(",");
  
  // Update baris:
  // Kolom: B (2) s.d K (11)
  sheet.getRange(rowIndex, 2).setValue(data.namaKegiatan);
  sheet.getRange(rowIndex, 3).setValue(data.hari);
  sheet.getRange(rowIndex, 4).setValue(new Date(data.tanggal));
  sheet.getRange(rowIndex, 5).setValue(data.waktu);
  sheet.getRange(rowIndex, 6).setValue(data.lokasi);
  sheet.getRange(rowIndex, 7).setValue(Number(data.jumlahPeserta));
  sheet.getRange(rowIndex, 8).setValue(data.jenisKegiatan);
  sheet.getRange(rowIndex, 9).setValue(data.deskripsi);
  sheet.getRange(rowIndex, 10).setValue(finalUrls);
  sheet.getRange(rowIndex, 11).setValue(finalIds);
  
  // Format hasil kembalian
  const returnedFotos = [];
  for (let j = 0; j < existingUrls.length; j++) {
    returnedFotos.push({
      id: existingIds[j],
      url: existingUrls[j]
    });
  }
  
  return {
    id: id,
    namaKegiatan: data.namaKegiatan,
    hari: data.hari,
    tanggal: data.tanggal,
    waktu: data.waktu,
    lokasi: data.lokasi,
    jumlahPeserta: Number(data.jumlahPeserta),
    jenisKegiatan: data.jenisKegiatan,
    deskripsi: data.deskripsi,
    fotos: returnedFotos,
    tanggalDibuat: rows[rowIndex - 1][11] instanceof Date ? rows[rowIndex - 1][11].toISOString() : new Date().toISOString()
  };
}

// Menghapus kegiatan dari Google Sheet & seluruh fotonya di Google Drive
function removeKegiatan(id) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Kegiatan");
  if (!sheet) return false;
  
  const rows = sheet.getDataRange().getValues();
  let rowIndex = -1;
  
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0].toString() === id) {
      rowIndex = i + 1;
      break;
    }
  }
  
  if (rowIndex === -1) return false;
  
  // Ambil file ID foto untuk dihapus dari Google Drive
  const fileIdsStr = rows[rowIndex - 1][10] || "";
  const fileIds = fileIdsStr.split(",").filter(Boolean);
  
  // Hapus semua foto kegiatan dari Google Drive
  fileIds.forEach(function(fileId) {
    deleteFileFromDrive(fileId);
  });
  
  // Hapus baris dari spreadsheet
  sheet.deleteRow(rowIndex);
  return true;
}

// Helper: Unggah file base64 ke Google Drive dan return id & url direct-view
function uploadToDrive(base64Data, filename, contentType) {
  try {
    const folder = DriveApp.getFolderById(FOLDER_ID);
    
    // Split base64 header dari konten
    let block = base64Data.split(";");
    let realData = block[1].split(",")[1];
    
    const decodedBytes = Utilities.base64Decode(realData);
    const blob = Utilities.newBlob(decodedBytes, contentType, filename);
    
    const file = folder.createFile(blob);
    
    // Set file sharing agar dapat diakses oleh publik (Anyone with link can view)
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // URL Web Content Link (URL Direct Foto untuk browser img src)
    // Format direct download/view: https://lh3.googleusercontent.com/d/[FILE_ID]=s800 atau via uc?export=view&id=[FILE_ID]
    const fileId = file.getId();
    const viewUrl = "https://lh3.googleusercontent.com/d/" + fileId;
    
    return {
      id: fileId,
      url: viewUrl
    };
  } catch (error) {
    Logger.log("Gagal upload ke Drive: " + error.toString());
    return null;
  }
}

// Helper: Hapus file di Google Drive
function deleteFileFromDrive(fileId) {
  try {
    const file = DriveApp.getFileById(fileId);
    file.setTrashed(true); // Pindahkan ke Sampah agar aman (bisa juga file.getParents().next().removeFile(file) untuk hapus permanen)
    return true;
  } catch (error) {
    Logger.log("Gagal menghapus file dari Drive: " + error.toString());
    return false;
  }
}

// Helper: Konversi header "Nama Kegiatan" -> "namaKegiatan" (camelCase)
function toCamelCase(str) {
  return str.toString()
    .replace(/(?:^\\w|[A-Z]|\\b\\w)/g, function(word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\\s+/g, "");
}
`;
