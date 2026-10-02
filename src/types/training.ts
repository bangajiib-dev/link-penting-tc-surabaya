/* © 2026 Bang Ajiib. All rights reserved. */

export interface TrainingItem {
  id: string;
  divisi: string;
  sub_divisi: string;
  nama_soal: string;
  training_hari_ke: number | string;
  jenis_soal: string;
  link_pengerjaan: string;
  link_tarik_data: string;
  keterangan: string;
  status: 'Aktif' | 'Non Aktif' | string;
  created_date: string;
  updated_date: string;
  link_qr?: string;
}

export type DivisionType = 
  | 'ALL' 
  | 'TCDEV2' 
  | 'SS' 
  | 'FBI' 
  | 'IPL' 
  | 'Lainnya' 
  | 'Link_Pantauan';

export interface JenisSoalSummary {
  jenis_soal: string;
  total: number;
  aktif: number;
  nonAktif: number;
  percentage: number;
  divisions: string[];
  avgHari: number;
}

export interface DashboardStats {
  totalTraining: number;
  totalDivisi: number;
  totalAktif: number;
  totalNonAktif: number;
  totalJenisSoal: number;
  prePostTestCount: number;
  inputDataCount: number;
  monitoringCount: number;
}
