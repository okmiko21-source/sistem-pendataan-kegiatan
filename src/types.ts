export type JenisKegiatan = 'FGD' | 'Metra' | 'Reses' | 'Pertemuan Internal' | 'Kegiatan Lainnya';

export interface FotoInfo {
  id: string; // Google Drive File ID or Local ID
  url: string; // Google Drive Web Link or Local Base64
  name?: string;
  size?: number;
}

export interface Kegiatan {
  id: string;
  namaKegiatan: string;
  hari: string;
  tanggal: string;
  waktu: string;
  lokasi: string;
  jumlahPeserta: number;
  jenisKegiatan: JenisKegiatan;
  deskripsi: string;
  fotos: FotoInfo[]; // Array of foto objects
  tanggalDibuat: string;
}

export interface IntegrationSettings {
  mode: 'local' | 'gas';
  gasUrl: string;
}
