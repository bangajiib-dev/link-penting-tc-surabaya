/* © 2026 Bang Ajiib. All rights reserved. */

import React from 'react';
import { TrainingItem } from '../types/training';
import {
  LayoutDashboard,
  Database,
  GraduationCap,
  Store,
  UtensilsCrossed,
  Truck,
  FolderArchive,
  Eye,
  RefreshCw,
  ExternalLink,
  X
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  data: TrainingItem[];
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  isSyncing: boolean;
  onSync: () => void;
  lastSync: string;
  onOpenSupabaseModal: () => void;
  isSupabaseActive?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  data,
  isMobileOpen,
  onCloseMobile,
  isSyncing,
  onSync,
  lastSync,
  onOpenSupabaseModal,
  isSupabaseActive = false
}) => {
  // Count by division
  const counts = React.useMemo(() => {
    const map: Record<string, number> = {
      dashboard: data.length,
      ALL: data.length,
      TCDEV2: 0,
      SS: 0,
      FBI: 0,
      IPL: 0,
      Lainnya: 0,
      Link_Pantauan: 0
    };
    data.forEach(item => {
      if (map[item.divisi] !== undefined) {
        map[item.divisi]++;
      }
    });
    return map;
  }, [data]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, count: counts.dashboard },
    { id: 'ALL', label: 'Semua kumpulan Link', icon: Database, count: counts.ALL },
    { id: 'TCDEV2', label: 'TCDEV2', subtitle: 'Development', icon: GraduationCap, count: counts.TCDEV2 },
    { id: 'SS', label: 'SS (Special Store)', subtitle: 'Point Coffee, YCCG', icon: Store, count: counts.SS },
    { id: 'FBI', label: 'FBI (Food & Beverage)', subtitle: 'Say Bread & Burger', icon: UtensilsCrossed, count: counts.FBI },
    { id: 'IPL', label: 'IPL (Logistic)', subtitle: 'Sertifikasi & Driver', icon: Truck, count: counts.IPL },
    { id: 'Lainnya', label: 'Lainnya', subtitle: 'RKB, Absensi, Target', icon: FolderArchive, count: counts.Lainnya },
    { id: 'Link_Pantauan', label: 'Link Pantauan', subtitle: 'Monitoring Toko', icon: Eye, count: counts.Link_Pantauan }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200">
      {/* Iconic Indomaret Tri-color Header Accent (Biru - Merah - Kuning) */}
      <div className="h-1.5 w-full flex shrink-0">
        <div className="w-1/3 bg-[#0057B8]"></div>
        <div className="w-1/3 bg-[#E31837]"></div>
        <div className="w-1/3 bg-[#FFD200]"></div>
      </div>

      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Official Indomaret Logo from user URL */}
          <div className="bg-white px-2 py-1.5 rounded-xl shadow-xs border border-white/20 flex items-center justify-center shrink-0">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/4/44/Indomaret.svg?utm_source=id.wikipedia.org&utm_campaign=index&utm_content=original"
              alt="Logo Indomaret"
              className="h-7 w-auto object-contain max-w-[90px]"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // High-fidelity fallback if Wikimedia SVG endpoint is throttled
                (e.currentTarget as HTMLImageElement).src = 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Logo_Indomaret.png';
              }}
            />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm tracking-tight leading-tight">
              Training Center
            </h1>
            <p className="text-[11px] text-amber-400 font-semibold">Surabaya · v1.8</p>
          </div>
        </div>

        {/* Mobile close */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Menu Utama & Divisi
        </div>

        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectView(item.id);
                onCloseMobile();
              }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all duration-150 flex items-center justify-between group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400 transition-colors'}`} />
                <div className="truncate">
                  <span className="text-xs block leading-tight truncate">
                    {item.label}
                  </span>
                  {item.subtitle && (
                    <span className={`text-[10px] block truncate ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                      {item.subtitle}
                    </span>
                  )}
                </div>
              </div>

              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded-full shrink-0 tabular-nums ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200'
                }`}
              >
                {item.count}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Database Connection Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-xs space-y-2.5">
        {/* Supabase Database Active Button */}
        <button
          onClick={onOpenSupabaseModal}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-emerald-950/90 to-slate-900 border border-emerald-500/50 hover:border-emerald-400 text-left transition-all group shadow-sm"
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              ⚡
            </div>
            <div>
              <span className="font-bold text-emerald-400 text-xs block group-hover:text-emerald-300">
                Database Supabase
              </span>
              <span className="text-[10px] text-slate-300 block">
                Terkoneksi Permanen
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-300 bg-emerald-900/80 px-2 py-0.5 rounded-md border border-emerald-700">
            Aktif
          </span>
        </button>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-slate-300 text-[11px]">
              PostgreSQL · Supabase
            </span>
          </div>
          <button
            onClick={onSync}
            disabled={isSyncing}
            className="p-1 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-md transition-colors disabled:opacity-50"
            title="Sinkronisasi data Supabase sekarang"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>

        <p className="text-[11px] font-mono text-slate-400 truncate">
          Tabel: public.training_soal
        </p>

        <div className="text-[10px] text-slate-400 flex items-center justify-between">
          <span>Status Sinkron:</span>
          <span className="text-slate-300 font-mono truncate max-w-[120px]">{lastSync}</span>
        </div>

        <button
          onClick={onOpenSupabaseModal}
          className="w-full mt-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-[11px] font-medium transition-colors border border-slate-700/60"
        >
          <span>Status & Info Database</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-72 h-screen sticky top-0 shrink-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="lg:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 transition-opacity"
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 w-72 z-50 transform transition-transform duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};
