/* © 2026 Bang Ajiib. All rights reserved. */

import React from 'react';
import { Menu, Plus, RefreshCw, Download, ExternalLink } from 'lucide-react';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
  currentView: string;
  onOpenAddModal: () => void;
  onSync: () => void;
  isSyncing: boolean;
  onExportCSV: () => void;
  onOpenSupabaseModal: () => void;
  isSupabaseActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileSidebar,
  currentView,
  onOpenAddModal,
  onSync,
  isSyncing,
  onExportCSV,
  onOpenSupabaseModal,
  isSupabaseActive = false
}) => {
  const getBreadcrumbTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return 'Dashboard & Statistik';
      case 'ALL':
        return 'Semua Bank Soal';
      case 'TCDEV2':
        return 'Divisi TCDEV2';
      case 'SS':
        return 'Divisi Special Store (SS)';
      case 'FBI':
        return 'Divisi Food & Beverage (FBI)';
      case 'IPL':
        return 'Divisi Logistic (IPL)';
      case 'Lainnya':
        return 'Lainnya (RKB, Absensi, Target)';
      case 'Link_Pantauan':
        return 'Link Pantauan & Monitoring';
      default:
        return currentView;
    }
  };

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-20 shadow-2xs">
      {/* Top Brand Accent Line */}
      <div className="h-1 w-full flex">
        <div className="w-1/3 bg-[#0057B8]"></div>
        <div className="w-1/3 bg-[#E31837]"></div>
        <div className="w-1/3 bg-[#FFD200]"></div>
      </div>

      <div className="h-15 px-4 md:px-8 flex items-center justify-between">
        {/* Left: Mobile hamburger & Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="Buka menu navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs md:text-sm">
            <span className="font-semibold text-slate-400 hidden sm:inline">
              TCS Surabaya
            </span>
            <span className="text-slate-300 hidden sm:inline">/</span>
            <h2 className="font-bold text-slate-900 tracking-tight text-sm md:text-base">
              {getBreadcrumbTitle()}
            </h2>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Supabase SQL Button */}
          <button
            onClick={onOpenSupabaseModal}
            className={`inline-flex items-center gap-1.5 py-1.5 px-3 text-xs font-bold rounded-xl transition-all shadow-2xs border ${
              isSupabaseActive
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-700'
            }`}
            title="Buka Script SQL Editor untuk Supabase"
          >
            <span className="text-xs">⚡</span>
            <span className="hidden sm:inline">SQL Editor Supabase</span>
            <span className="sm:hidden">SQL</span>
          </button>

          {/* Sync Button */}
          <button
            onClick={onSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 py-1.5 px-3 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-2xs disabled:opacity-50"
            title="Sinkronkan data dengan database Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#0057B8] ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">{isSyncing ? 'Menyinkronkan...' : 'Sinkron Supabase'}</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={onExportCSV}
            className="hidden lg:inline-flex items-center gap-1.5 py-1.5 px-3 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-2xs"
            title="Unduh seluruh data ke format CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export CSV</span>
          </button>

          {/* Add Question Button - Indomaret Red */}
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 py-1.5 px-3.5 text-xs font-bold text-white bg-[#E31837] hover:bg-[#c9122f] active:bg-[#a80c25] rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Soal</span>
          </button>
        </div>
      </div>
    </header>
  );
};
