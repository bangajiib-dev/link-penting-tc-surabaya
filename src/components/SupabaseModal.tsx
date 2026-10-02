/* © 2026 Bang Ajiib. All rights reserved. */

import React, { useState } from 'react';
import { TrainingItem } from '../types/training';
import {
  generateSupabaseSqlScript,
  getSupabaseConfig,
  saveSupabaseConfig,
  clearSupabaseConfig,
  testSupabaseConnection
} from '../services/supabaseService';
import {
  X,
  Copy,
  Check,
  Download,
  Database,
  Terminal,
  Settings2,
  BookOpen,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: TrainingItem[];
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
  onRefreshData: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  data,
  onShowToast,
  onRefreshData
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'sql' | 'guide'>('config');
  const [copied, setCopied] = useState(false);
  const [supabaseUrl, setSupabaseUrl] = useState(() => getSupabaseConfig().url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(() => getSupabaseConfig().anonKey);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const sqlScript = generateSupabaseSqlScript(data);

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    onShowToast('Script SQL Supabase berhasil disalin ke clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([sqlScript], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'training_center_surabaya_supabase.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowToast('File training_center_surabaya_supabase.sql berhasil diunduh', 'success');
  };

  const handleSaveConnection = async () => {
    if (!supabaseUrl.trim() || !supabaseAnonKey.trim()) {
      onShowToast('URL dan Anon Key Supabase wajib diisi', 'error');
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    const res = await testSupabaseConnection(supabaseUrl, supabaseAnonKey);
    setIsTesting(false);
    setTestResult(res);

    if (res.success) {
      saveSupabaseConfig(supabaseUrl, supabaseAnonKey);
      onShowToast('Koneksi Supabase berhasil disimpan dan terhubung!', 'success');
      onRefreshData();
    } else {
      onShowToast(res.message, 'error');
    }
  };

  const handleDisconnect = () => {
    clearSupabaseConfig();
    setSupabaseUrl('');
    setSupabaseAnonKey('');
    setTestResult(null);
    onShowToast('Koneksi custom Supabase diputuskan. Menggunakan data lokal & fallback.', 'info');
    onRefreshData();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150">
        {/* Tricolor Header Accent */}
        <div className="h-1.5 w-full flex">
          <div className="w-1/3 bg-blue-600"></div>
          <div className="w-1/3 bg-red-600"></div>
          <div className="w-1/3 bg-yellow-400"></div>
        </div>

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Database className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base md:text-lg leading-tight">
                  Status Database Supabase
                </h3>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Terkoneksi Aktif
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Database PostgreSQL Supabase terhubung permanen pada tabel <code className="text-emerald-600 font-mono font-semibold">training_soal</code>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 border-b border-slate-100 bg-slate-50/30 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all ${
              activeTab === 'config'
                ? 'border-blue-600 text-blue-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Settings2 className="w-4 h-4" />
            <span>Koneksi & Status Database</span>
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all ${
              activeTab === 'sql'
                ? 'border-blue-600 text-blue-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Script SQL (Cadangan)</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all ${
              activeTab === 'guide'
                ? 'border-blue-600 text-blue-700 bg-white shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Panduan Supabase</span>
          </button>
        </div>

        {/* Tab 1: SQL Code View */}
        {activeTab === 'sql' && (
          <div className="flex-1 flex flex-col min-h-0 p-6 overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
              <div>
                <p className="text-xs text-slate-600">
                  Salin seluruh kode di bawah ini lalu tempelkan di menu <strong className="text-slate-900">SQL Editor</strong> project Supabase Anda.
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                  <span>Tabel: <code className="font-mono text-blue-600 font-bold">training_soal</code></span>
                  <span>·</span>
                  <span className="font-mono tabular-nums">{data.length} baris data awal</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleDownloadSql}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>Download .sql</span>
                </button>

                <button
                  onClick={handleCopySql}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-colors shadow-sm"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Tersalin!' : 'Salin Kode SQL'}</span>
                </button>
              </div>
            </div>

            {/* Code Box */}
            <div className="flex-1 min-h-0 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden relative shadow-inner flex flex-col">
              <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-300 ml-2">
                    schema_training_soal.sql
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  PostgreSQL · Supabase
                </span>
              </div>

              <div className="flex-1 overflow-auto p-4 font-mono text-xs text-emerald-400 selection:bg-blue-600 selection:text-white leading-relaxed">
                <pre>{sqlScript}</pre>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Connection Settings */}
        {activeTab === 'config' && (
          <div className="p-6 overflow-y-auto space-y-5 text-xs">
            <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-4 text-slate-700 shadow-2xs">
              <div className="flex items-center justify-between gap-3 mb-1.5">
                <h4 className="font-bold text-emerald-900 text-sm flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span>Koneksi Database Supabase Permanen</span>
                </h4>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                  Terhubung Aktif
                </span>
              </div>
              <p className="leading-relaxed text-slate-600">
                Aplikasi ini telah dikonfigurasi secara permanen untuk terhubung langsung ke database PostgreSQL Supabase (<code className="text-emerald-800 font-mono font-semibold">dcnofnehuqwgtvwrnobc.supabase.co</code>) pada tabel <code className="text-emerald-800 font-mono font-semibold">training_soal</code>. Semua operasi baca, tambah, edit, dan hapus soal langsung tersinkronisasi otomatis.
              </p>
            </div>

            <div className="space-y-4 max-w-2xl">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Project URL Supabase (Permanen)
                </label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://dcnofnehuqwgtvwrnobc.supabase.co"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono transition-colors text-xs"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Project Ref: <code className="font-mono text-slate-600">dcnofnehuqwgtvwrnobc</code>
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Anon / Public API Key
                </label>
                <input
                  type="password"
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono transition-colors text-xs"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Kunci akses publik permanen untuk tabel <code className="font-mono text-slate-600">training_soal</code>
                </span>
              </div>

              {testResult && (
                <div
                  className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
                    testResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-semibold text-xs leading-snug">{testResult.message}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSaveConnection}
                  disabled={isTesting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-colors shadow-sm disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Menguji Koneksi...' : 'Uji Status Koneksi'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Step-by-Step Guide */}
        {activeTab === 'guide' && (
          <div className="p-6 overflow-y-auto space-y-4 text-xs">
            <h4 className="font-bold text-slate-900 text-sm">
              Cara Menjalankan Script di Supabase SQL Editor:
            </h4>

            <ol className="space-y-3.5 list-none">
              <li className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <strong className="text-slate-800 block mb-0.5">Buka Dashboard Supabase</strong>
                  <p className="text-slate-500">
                    Kunjungi <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-semibold">supabase.com/dashboard</a> dan buka project Supabase Anda.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <strong className="text-slate-800 block mb-0.5">Pilih Menu SQL Editor</strong>
                  <p className="text-slate-500">
                    Pada menu bar sebelah kiri, klik icon terminal <strong className="text-slate-700">"SQL Editor"</strong> lalu klik tombol <strong className="text-slate-700">"+ New Query"</strong>.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <strong className="text-slate-800 block mb-0.5">Paste dan Jalankan Script</strong>
                  <p className="text-slate-500">
                    Kembali ke modal ini, klik tab <strong>"Script SQL Editor"</strong> → klik tombol <strong className="text-blue-600">"Salin Kode SQL"</strong>, lalu paste (Ctrl+V) ke dalam editor Supabase. Klik tombol <strong className="text-emerald-700">"RUN"</strong> (atau tekan Ctrl+Enter).
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  4
                </span>
                <div>
                  <strong className="text-slate-800 block mb-0.5">Database Siap Digunakan!</strong>
                  <p className="text-slate-500">
                    Tabel <code className="font-mono text-blue-600">training_soal</code> beserta seluruh index dan 55 modul training akan otomatis terisi dan siap digunakan. Anda dapat melihatnya langsung di menu <strong>Table Editor</strong>.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-slate-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>Buka Dashboard Supabase</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors shadow-2xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
