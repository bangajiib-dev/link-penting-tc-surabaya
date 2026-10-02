/* © 2026 Bang Ajiib. All rights reserved. */

import { TrainingItem, JenisSoalSummary, DashboardStats } from '../types/training';
import { INITIAL_TRAINING_DATA } from '../data/initialData';
import { fetchItemsFromSupabase, getSupabaseConfig } from './supabaseService';

const LOCAL_STORAGE_KEY = 'TCS_TRAINING_DATA_V1.8';
const LAST_SYNC_KEY = 'TCS_LAST_SYNC_TIMESTAMP';

/**
 * Format and sanitize external URLs
 */
export function formatUrl(url: string | undefined): string {
  if (!url || url.trim() === '' || url === '-') return '#';
  const cleanUrl = url.trim();
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    return `https://${cleanUrl}`;
  }
  return cleanUrl;
}

/**
 * Get direct image viewable URL for Google Drive files
 */
export function getDirectDriveUrl(url?: string): string {
  if (!url) return '';
  let fileId = '';
  if (url.includes('/d/')) {
    fileId = url.split('/d/')[1].split('/')[0];
  } else if (url.includes('id=')) {
    fileId = url.split('id=')[1].split('&')[0];
  }
  if (fileId) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h400`;
  }
  return url;
}

/**
 * Generate fallback QR code URL using QuickChart API
 */
export function getQuickChartQrUrl(urlToEncode: string, size = 400): string {
  const clean = formatUrl(urlToEncode);
  if (clean === '#') return '';
  return `https://quickchart.io/qr?size=${size}&text=${encodeURIComponent(clean)}`;
}

/**
 * Fetch live data from Supabase (sole primary database) or local storage
 */
export async function getTrainingData(forceRemote = false): Promise<{
  data: TrainingItem[];
  source: 'SUPABASE' | 'STORAGE' | 'INITIAL';
  lastSync: string;
}> {
  const config = getSupabaseConfig();
  const hasSupabase = Boolean(config.url && config.anonKey);

  // 1. If Supabase is configured and we force remote or don't have local cache, attempt Supabase fetch
  if (hasSupabase) {
    try {
      const supabaseData = await fetchItemsFromSupabase();
      if (supabaseData && supabaseData.length > 0) {
        const timestamp = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(supabaseData));
        localStorage.setItem(LAST_SYNC_KEY, `Supabase (${timestamp})`);
        return { data: supabaseData, source: 'SUPABASE', lastSync: `Supabase (${timestamp})` };
      }
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to local cache:', err);
    }
  }

  // 2. Local storage cached data
  if (!forceRemote) {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    const lastSync = localStorage.getItem(LAST_SYNC_KEY) || 'Lokal';
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return { data: parsed, source: 'STORAGE', lastSync };
        }
      } catch (err) {
        console.error('Failed to parse cached data:', err);
      }
    }
  }

  // 3. Fallback to embedded seed dataset
  const timestamp = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_TRAINING_DATA));
  localStorage.setItem(LAST_SYNC_KEY, `Inisial (${timestamp})`);
  return { data: INITIAL_TRAINING_DATA, source: 'INITIAL', lastSync: `Inisial (${timestamp})` };
}

/**
 * Save data to localStorage
 */
export function saveTrainingData(data: TrainingItem[]): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  const timestamp = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
  localStorage.setItem(LAST_SYNC_KEY, timestamp);
}

/**
 * Calculate KPI Stats
 */
export function computeDashboardStats(data: TrainingItem[]): DashboardStats {
  const divisions = new Set(data.map(d => d.divisi).filter(Boolean));
  const activeCount = data.filter(d => d.status === 'Aktif').length;
  const inactiveCount = data.length - activeCount;
  const jenisSet = new Set(data.map(d => d.jenis_soal).filter(Boolean));

  return {
    totalTraining: data.length,
    totalDivisi: divisions.size,
    totalAktif: activeCount,
    totalNonAktif: inactiveCount,
    totalJenisSoal: jenisSet.size,
    prePostTestCount: data.filter(d => d.jenis_soal.includes('Test')).length,
    inputDataCount: data.filter(d => d.jenis_soal === 'Input Data').length,
    monitoringCount: data.filter(d => d.jenis_soal === 'Monitoring').length
  };
}

/**
 * Compute detailed summary data for the Jenis Soal table and pie chart
 */
export function computeJenisSoalSummary(data: TrainingItem[]): JenisSoalSummary[] {
  const total = data.length || 1;
  const map: Record<string, { aktif: number; nonAktif: number; days: number[]; divisions: Set<string> }> = {};

  data.forEach(item => {
    const jenis = (item.jenis_soal || 'Lainnya').trim();
    if (!map[jenis]) {
      map[jenis] = { aktif: 0, nonAktif: 0, days: [], divisions: new Set() };
    }
    if (item.status === 'Aktif') {
      map[jenis].aktif++;
    } else {
      map[jenis].nonAktif++;
    }
    const day = Number(item.training_hari_ke);
    if (!isNaN(day)) {
      map[jenis].days.push(day);
    }
    if (item.divisi) {
      map[jenis].divisions.add(item.divisi);
    }
  });

  return Object.entries(map)
    .map(([jenis, stats]) => {
      const sum = stats.aktif + stats.nonAktif;
      const avgHari = stats.days.length
        ? Math.round((stats.days.reduce((a, b) => a + b, 0) / stats.days.length) * 10) / 10
        : 0;
      return {
        jenis_soal: jenis,
        total: sum,
        aktif: stats.aktif,
        nonAktif: stats.nonAktif,
        percentage: Math.round((sum / total) * 1000) / 10,
        divisions: Array.from(stats.divisions),
        avgHari
      };
    })
    .sort((a, b) => b.total - a.total);
}

/**
 * Export data array to CSV file trigger
 */
export function exportToCSVFile(data: TrainingItem[], filename = 'Training_Center_Surabaya.csv'): void {
  const headers = [
    'id',
    'divisi',
    'sub_divisi',
    'nama_soal',
    'training_hari_ke',
    'jenis_soal',
    'link_pengerjaan',
    'link_tarik_data',
    'keterangan',
    'status',
    'created_date',
    'updated_date',
    'link_qr'
  ];

  const escapeCSV = (val: any): string => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = data.map(item => [
    item.id,
    item.divisi,
    item.sub_divisi,
    item.nama_soal,
    item.training_hari_ke,
    item.jenis_soal,
    item.link_pengerjaan,
    item.link_tarik_data,
    item.keterangan,
    item.status,
    item.created_date,
    item.updated_date,
    item.link_qr || ''
  ].map(escapeCSV).join(','));

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
