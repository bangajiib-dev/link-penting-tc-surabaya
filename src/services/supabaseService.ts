/* © 2026 Bang Ajiib. All rights reserved. */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TrainingItem } from '../types/training';
import { INITIAL_TRAINING_DATA } from '../data/initialData';

const SUPABASE_URL_KEY = 'TCS_SUPABASE_URL';
const SUPABASE_KEY_KEY = 'TCS_SUPABASE_ANON_KEY';

/**
 * Get active Supabase configuration (either from env or localStorage)
 */
export function getSupabaseConfig(): { url: string; anonKey: string } {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
  const localUrl = localStorage.getItem(SUPABASE_URL_KEY) || '';
  const localKey = localStorage.getItem(SUPABASE_KEY_KEY) || '';

  return {
    url: localUrl || envUrl,
    anonKey: localKey || envKey
  };
}

/**
 * Save user custom Supabase connection credentials
 */
export function saveSupabaseConfig(url: string, anonKey: string): void {
  localStorage.setItem(SUPABASE_URL_KEY, url.trim());
  localStorage.setItem(SUPABASE_KEY_KEY, anonKey.trim());
}

/**
 * Clear custom Supabase connection
 */
export function clearSupabaseConfig(): void {
  localStorage.removeItem(SUPABASE_URL_KEY);
  localStorage.removeItem(SUPABASE_KEY_KEY);
}

/**
 * Get initialized Supabase client if configured
 */
export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (config.url && config.anonKey) {
    try {
      return createClient(config.url, config.anonKey);
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      return null;
    }
  }
  return null;
}

/**
 * Test Supabase connection
 */
export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string; count?: number }> {
  try {
    const client = createClient(url, anonKey);
    const { data, error } = await client.from('training_soal').select('id', { count: 'exact' }).limit(1);
    if (error) {
      // If table doesn't exist yet, but credentials are valid:
      if (error.code === '42P01') {
        return {
          success: false,
          message: 'Koneksi ke project berhasil, namun tabel "training_soal" belum dibuat. Silakan jalankan script SQL di SQL Editor Supabase terlebih dahulu.'
        };
      }
      return { success: false, message: `Error Supabase: ${error.message}` };
    }
    return {
      success: true,
      message: 'Koneksi ke Supabase berhasil! Tabel "training_soal" terhubung.',
      count: data?.length ?? 0
    };
  } catch (e: any) {
    return { success: false, message: `Gagal menghubungkan: ${e.message || String(e)}` };
  }
}

/**
 * Fetch all items from Supabase
 */
export async function fetchItemsFromSupabase(): Promise<TrainingItem[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('training_soal')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.warn('Supabase fetch error:', error);
      return null;
    }

    if (data && Array.isArray(data)) {
      return data.map((row: any) => ({
        id: String(row.id),
        divisi: row.divisi || 'Lainnya',
        sub_divisi: row.sub_divisi || 'Lainnya',
        nama_soal: row.nama_soal || '',
        training_hari_ke: row.training_hari_ke ?? 0,
        jenis_soal: row.jenis_soal || 'Pre Test / Post Test',
        link_pengerjaan: row.link_pengerjaan || '',
        link_tarik_data: row.link_tarik_data || '-',
        keterangan: row.keterangan || '-',
        status: row.status || 'Aktif',
        created_date: row.created_date ? String(row.created_date).replace('T', ' ').substring(0, 19) : '',
        updated_date: row.updated_date ? String(row.updated_date).replace('T', ' ').substring(0, 19) : '',
        link_qr: row.link_qr || ''
      }));
    }
    return null;
  } catch (err) {
    console.error('Supabase fetch exception:', err);
    return null;
  }
}

/**
 * Upsert an item into Supabase
 */
export async function upsertItemToSupabase(item: TrainingItem): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client
      .from('training_soal')
      .upsert({
        id: item.id,
        divisi: item.divisi,
        sub_divisi: item.sub_divisi,
        nama_soal: item.nama_soal,
        training_hari_ke: Number(item.training_hari_ke) || 0,
        jenis_soal: item.jenis_soal,
        link_pengerjaan: item.link_pengerjaan,
        link_tarik_data: item.link_tarik_data,
        keterangan: item.keterangan,
        status: item.status,
        created_date: item.created_date,
        updated_date: item.updated_date,
        link_qr: item.link_qr || ''
      }, { onConflict: 'id' });

    if (error) {
      console.error('Failed to upsert item to Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Exception upserting to Supabase:', err);
    return false;
  }
}

/**
 * Delete an item from Supabase
 */
export async function deleteItemFromSupabase(id: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client
      .from('training_soal')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete item from Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Exception deleting from Supabase:', err);
    return false;
  }
}

/**
 * Generates the complete, production-ready SQL script for Supabase SQL Editor:
 * - Table creation (DDL)
 * - Row Level Security (RLS) setup
 * - Indexes on frequently queried columns
 * - Full INSERT batch for all 55 authentic records
 */
export function generateSupabaseSqlScript(items: TrainingItem[] = INITIAL_TRAINING_DATA): string {
  const escapeSql = (val: any): string => {
    if (val === null || val === undefined) return "''";
    const str = String(val).replace(/'/g, "''");
    return `'${str}'`;
  };

  const insertStatements = items.map(item => {
    const id = escapeSql(item.id);
    const divisi = escapeSql(item.divisi);
    const subDivisi = escapeSql(item.sub_divisi);
    const namaSoal = escapeSql(item.nama_soal);
    const hari = isNaN(Number(item.training_hari_ke)) ? 0 : Number(item.training_hari_ke);
    const jenisSoal = escapeSql(item.jenis_soal);
    const linkPengerjaan = escapeSql(item.link_pengerjaan);
    const linkTarikData = escapeSql(item.link_tarik_data);
    const keterangan = escapeSql(item.keterangan);
    const status = escapeSql(item.status);
    const createdDate = item.created_date ? escapeSql(item.created_date) : "NOW()";
    const updatedDate = item.updated_date ? escapeSql(item.updated_date) : "NOW()";
    const linkQr = escapeSql(item.link_qr || '');

    return `  (${id}, ${divisi}, ${subDivisi}, ${namaSoal}, ${hari}, ${jenisSoal}, ${linkPengerjaan}, ${linkTarikData}, ${keterangan}, ${status}, ${createdDate}, ${updatedDate}, ${linkQr})`;
  }).join(',\n');

  return `-- ==============================================================================
-- TRAINING CENTER SURABAYA (TCS) - SUPABASE DATABASE INITIALIZATION SCRIPT
-- Versi: 1.8 | Tabel: training_soal
-- Eksekusi kode ini di: Supabase Dashboard -> Project -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. HAPUS TABEL LAMA JIKA ADA (OPSIONAL, HAPUS KOMENTAR JIKA INGIN RESET TOTAL)
-- DROP TABLE IF EXISTS public.training_soal CASCADE;

-- 2. PEMBUATAN TABEL UTAMA TRAINING_SOAL
CREATE TABLE IF NOT EXISTS public.training_soal (
    id VARCHAR(64) PRIMARY KEY,
    divisi VARCHAR(100) NOT NULL DEFAULT 'Lainnya',
    sub_divisi VARCHAR(100) NOT NULL DEFAULT 'Lainnya',
    nama_soal VARCHAR(255) NOT NULL,
    training_hari_ke INTEGER DEFAULT 0,
    jenis_soal VARCHAR(100) NOT NULL DEFAULT 'Pre Test / Post Test',
    link_pengerjaan TEXT,
    link_tarik_data TEXT,
    keterangan TEXT DEFAULT '-',
    status VARCHAR(50) NOT NULL DEFAULT 'Aktif',
    created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    link_qr TEXT
);

-- 3. PEMBUATAN INDEX UNTUK PERFORMA QUERY CEPAT
CREATE INDEX IF NOT EXISTS idx_training_soal_divisi ON public.training_soal (divisi);
CREATE INDEX IF NOT EXISTS idx_training_soal_sub_divisi ON public.training_soal (sub_divisi);
CREATE INDEX IF NOT EXISTS idx_training_soal_jenis_soal ON public.training_soal (jenis_soal);
CREATE INDEX IF NOT EXISTS idx_training_soal_status ON public.training_soal (status);
CREATE INDEX IF NOT EXISTS idx_training_soal_hari ON public.training_soal (training_hari_ke);

-- 4. KEBIJAKAN ROW LEVEL SECURITY (RLS)
ALTER TABLE public.training_soal ENABLE ROW LEVEL SECURITY;

-- Kebijakan: Izinkan publik (anon) & user terautentikasi membaca seluruh data training
DROP POLICY IF EXISTS "Izinkan publik membaca data training" ON public.training_soal;
CREATE POLICY "Izinkan publik membaca data training"
    ON public.training_soal
    FOR SELECT
    USING (true);

-- Kebijakan: Izinkan publik & authenticated menambah, memperbarui, dan menghapus data
DROP POLICY IF EXISTS "Izinkan modifikasi data training" ON public.training_soal;
CREATE POLICY "Izinkan modifikasi data training"
    ON public.training_soal
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 5. FUNCTION & TRIGGER AUTO-UPDATE WAKTU UPDATED_DATE
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_date = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_training_soal_updated_at ON public.training_soal;
CREATE TRIGGER trigger_training_soal_updated_at
    BEFORE UPDATE ON public.training_soal
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 6. INSERT DATA AWAL (SEED ${items.length} MODUL TRAINING TCS)
INSERT INTO public.training_soal (
    id,
    divisi,
    sub_divisi,
    nama_soal,
    training_hari_ke,
    jenis_soal,
    link_pengerjaan,
    link_tarik_data,
    keterangan,
    status,
    created_date,
    updated_date,
    link_qr
) VALUES
${insertStatements}
ON CONFLICT (id) DO UPDATE SET
    divisi = EXCLUDED.divisi,
    sub_divisi = EXCLUDED.sub_divisi,
    nama_soal = EXCLUDED.nama_soal,
    training_hari_ke = EXCLUDED.training_hari_ke,
    jenis_soal = EXCLUDED.jenis_soal,
    link_pengerjaan = EXCLUDED.link_pengerjaan,
    link_tarik_data = EXCLUDED.link_tarik_data,
    keterangan = EXCLUDED.keterangan,
    status = EXCLUDED.status,
    updated_date = NOW(),
    link_qr = EXCLUDED.link_qr;

-- 7. VERIFIKASI HASIL IMPORT
SELECT 
    divisi, 
    COUNT(*) AS total_soal,
    COUNT(CASE WHEN status = 'Aktif' THEN 1 END) AS total_aktif,
    COUNT(CASE WHEN status = 'Non Aktif' THEN 1 END) AS total_non_aktif
FROM public.training_soal
GROUP BY divisi
ORDER BY total_soal DESC;
`;
}
