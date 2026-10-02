/* © 2026 Bang Ajiib. All rights reserved. */

import React from 'react';
import { TrainingItem, DashboardStats, JenisSoalSummary } from '../types/training';
import { JenisSoalPieChart } from './JenisSoalPieChart';
import { JenisSoalSummaryTable } from './JenisSoalSummaryTable';
import { DivisiBarChart } from './DivisiBarChart';
import { formatUrl } from '../services/sheetsService';
import {
  FileText,
  Building,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Layers,
  Clock
} from 'lucide-react';

interface DashboardProps {
  stats: DashboardStats;
  data: TrainingItem[];
  jenisSummary: JenisSoalSummary[];
  onSelectCategory: (jenis: string) => void;
  selectedCategory: string | null;
  onSelectDivision: (div: string) => void;
  onViewAllData: () => void;
  onOpenAddModal: () => void;
  onViewQr: (item: TrainingItem) => void;
  onOpenSupabaseModal?: () => void;
  isSupabaseActive?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  data,
  jenisSummary,
  onSelectCategory,
  selectedCategory,
  onSelectDivision,
  onViewAllData,
  onOpenAddModal,
  onViewQr,
  onOpenSupabaseModal,
  isSupabaseActive = false
}) => {
  const activeRate = stats.totalTraining
    ? Math.round((stats.totalAktif / stats.totalTraining) * 100)
    : 0;

  // Recent 6 updated training modules
  const recentItems = [...data]
    .sort((a, b) => new Date(b.updated_date).getTime() - new Date(a.updated_date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner with Indomaret Tri-color Accent */}
      <div className="relative rounded-3xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-950 text-white shadow-sm overflow-hidden border border-blue-800/60">
        {/* Tricolor Stripe on Hero */}
        <div className="h-1.5 w-full flex">
          <div className="w-1/3 bg-[#0057B8]"></div>
          <div className="w-1/3 bg-[#E31837]"></div>
          <div className="w-1/3 bg-[#FFD200]"></div>
        </div>

        <div className="p-6 md:p-8 relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-200 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#FFD200] animate-pulse" />
            <span>Training Center Surabaya v1.8 · Edisi Indomaret</span>
          </div>

          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-2">
            Dashboard Analitik & Bank Soal TCS
          </h2>

          <p className="text-sm md:text-base text-blue-100/90 leading-relaxed max-w-2xl mb-6">
            Pusat visualisasi interaktif jenis soal, manajemen bank soal, monitoring operasional, dan integrasi database Supabase PostgreSQL.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 text-xs font-bold text-white bg-[#E31837] hover:bg-[#c9122f] active:bg-[#a80c25] rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>+ Tambah Soal Baru</span>
            </button>
            <button
              onClick={onViewAllData}
              className="px-4 py-2 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl transition-colors border border-white/20 flex items-center gap-1.5"
            >
              <span>Jelajahi Semua Modul</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            {onOpenSupabaseModal && (
              <button
                onClick={onOpenSupabaseModal}
                className="px-4 py-2 text-xs font-bold text-slate-900 bg-[#FFD200] hover:bg-[#e6bc00] rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>⚡ Script SQL Supabase</span>
              </button>
            )}
          </div>
        </div>

        {/* Ambient subtle decorative light */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Supabase Notice Banner */}
      {onOpenSupabaseModal && (
        <div className="rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-blue-950 p-4 border border-emerald-500/30 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-base shrink-0 border border-emerald-400/30">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-emerald-300">
                  Database PostgreSQL Supabase Siap Digunakan
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-700">
                  {isSupabaseActive ? 'Aktif' : 'Tersedia'}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Gunakan script SQL yang telah disiapkan untuk membuat tabel <code className="text-emerald-400 font-mono">training_soal</code> dan mengimpor 55 data modul training di Supabase SQL Editor.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenSupabaseModal}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-xl transition-colors shrink-0 shadow-sm"
          >
            Buka SQL Editor Supabase
          </button>
        </div>
      )}

      {/* KPI Stat Cards Grid with Indomaret Tri-color Borders */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Training (Indomaret Biru) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 border-t-4 border-t-[#0057B8] p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#0057B8] uppercase tracking-wider">
              Total Soal
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0057B8] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold font-mono text-slate-900 tabular-nums">
              {stats.totalTraining}
            </h3>
            <span className="text-xs text-slate-500 font-medium">modul</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <span>Tersebar di {stats.totalDivisi} divisi operasional</span>
          </p>
        </div>

        {/* Card 2: Total Divisi (Indomaret Kuning) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 border-t-4 border-t-[#FFD200] p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              Divisi Terdaftar
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold font-mono text-slate-900 tabular-nums">
              {stats.totalDivisi}
            </h3>
            <span className="text-xs text-slate-500 font-medium">unit</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            TCDEV2, SS, FBI, IPL & Unit Khusus
          </p>
        </div>

        {/* Card 3: Soal Aktif (Indomaret Hijau Sukses) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 border-t-4 border-t-emerald-500 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Modul Aktif
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold font-mono text-emerald-700 tabular-nums">
              {stats.totalAktif}
            </h3>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {activeRate}%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Siap dikerjakan oleh peserta training
          </p>
        </div>

        {/* Card 4: Soal Non-Aktif (Indomaret Merah) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 border-t-4 border-t-[#E31837] p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#E31837] uppercase tracking-wider">
              Soal Non Aktif
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-[#E31837] flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold font-mono text-[#E31837] tabular-nums">
              {stats.totalNonAktif}
            </h3>
            <span className="text-xs text-slate-500 font-medium">arsip</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Status dinonaktifkan sementara
          </p>
        </div>
      </div>

      {/* CORE HIGHLIGHT: Interactive Pie Chart for Jenis Soal */}
      <div className="space-y-6">
        <JenisSoalPieChart
          data={data}
          onSelectJenis={onSelectCategory}
          selectedJenis={selectedCategory}
        />

        {/* CORE HIGHLIGHT: Tabel Ringkasan Data Jenis Soal */}
        <JenisSoalSummaryTable
          summary={jenisSummary}
          onSelectCategory={onSelectCategory}
          selectedCategory={selectedCategory}
        />
      </div>

      {/* Division Bar Chart & Quick Recent Training List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Divisi Bar Chart */}
        <div className="lg:col-span-7">
          <DivisiBarChart
            data={data}
            onSelectDivision={onSelectDivision}
          />
        </div>

        {/* Recent Training Quick Access */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 md:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <h3 className="font-semibold text-slate-900 text-sm md:text-base">
                  Pembaruan Modul Terkini
                </h3>
              </div>
              <button
                onClick={onViewAllData}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-0.5"
              >
                <span>Lihat Semua</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {recentItems.map(item => (
                <div
                  key={item.id}
                  className="py-3 flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                      {item.nama_soal}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                      <span className="font-medium text-slate-600">{item.divisi}</span>
                      <span>·</span>
                      <span className="text-slate-400">{item.sub_divisi}</span>
                      <span>·</span>
                      <span className="font-mono text-slate-400">H-{item.training_hari_ke}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onViewQr(item)}
                      className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Lihat Barcode QR"
                    >
                      <Layers className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={formatUrl(item.link_pengerjaan)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <span>Buka</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Training Center Surabaya</span>
            <span className="font-mono">Terakhir diupdate: 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
};
