/* © 2026 Bang Ajiib. All rights reserved. */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  registerables,
  ChartConfiguration
} from 'chart.js';
import { TrainingItem } from '../types/training';
import { PieChart, CircleDot, Filter, ArrowUpRight } from 'lucide-react';

ChartJS.register(...registerables);

interface JenisSoalPieChartProps {
  data: TrainingItem[];
  onSelectJenis?: (jenis: string) => void;
  selectedJenis?: string | null;
}

const COLOR_PALETTE = [
  '#0057B8', // Indomaret Biru
  '#E31837', // Indomaret Merah
  '#FFD200', // Indomaret Kuning
  '#10B981', // Hijau Sukses
  '#8B5CF6', // Ungu
  '#06B6D4', // Cyan
  '#F97316', // Oranye
  '#64748B'  // Slate
];

const HOVER_PALETTE = [
  '#00438A',
  '#C9122F',
  '#E6BC00',
  '#059669',
  '#7C3AED',
  '#0891B2',
  '#EA580C',
  '#475569'
];

export const JenisSoalPieChart: React.FC<JenisSoalPieChartProps> = ({
  data,
  onSelectJenis,
  selectedJenis
}) => {
  const [chartType, setChartType] = useState<'doughnut' | 'pie'>('doughnut');
  const [divisionFilter, setDivisionFilter] = useState<string>('ALL');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<ChartJS | null>(null);

  // Available divisions
  const availableDivisions = useMemo(() => {
    const set = new Set(data.map(d => d.divisi).filter(Boolean));
    return Array.from(set).sort();
  }, [data]);

  // Filtered dataset for the chart
  const filteredData = useMemo(() => {
    if (divisionFilter === 'ALL') return data;
    return data.filter(d => d.divisi === divisionFilter);
  }, [data, divisionFilter]);

  // Aggregate by jenis_soal
  const stats = useMemo(() => {
    const counts: Record<string, { total: number; aktif: number; nonAktif: number }> = {};
    filteredData.forEach(item => {
      const jenis = (item.jenis_soal || 'Lainnya').trim();
      if (!counts[jenis]) counts[jenis] = { total: 0, aktif: 0, nonAktif: 0 };
      counts[jenis].total++;
      if (item.status === 'Aktif') counts[jenis].aktif++;
      else counts[jenis].nonAktif++;
    });

    return Object.entries(counts)
      .map(([name, val], index) => ({
        name,
        total: val.total,
        aktif: val.aktif,
        nonAktif: val.nonAktif,
        color: COLOR_PALETTE[index % COLOR_PALETTE.length],
        hoverColor: HOVER_PALETTE[index % HOVER_PALETTE.length],
        percentage: filteredData.length ? Math.round((val.total / filteredData.length) * 1000) / 10 : 0
      }))
      .sort((a, b) => b.total - a.total);
  }, [filteredData]);

  // Render or update Chart.js instance directly on canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    if (stats.length === 0) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration<'pie' | 'doughnut'> = {
      type: chartType,
      data: {
        labels: stats.map(s => s.name),
        datasets: [
          {
            label: 'Jumlah Soal',
            data: stats.map(s => s.total),
            backgroundColor: stats.map(s => s.color),
            hoverBackgroundColor: stats.map(s => s.hoverColor),
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverOffset: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: chartType === 'doughnut' ? '65%' : 0,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#0f172a',
            titleFont: { size: 13, weight: 'bold', family: 'Plus Jakarta Sans' },
            bodyFont: { size: 12, family: 'Plus Jakarta Sans' },
            padding: 12,
            cornerRadius: 10,
            boxPadding: 6,
            usePointStyle: true,
            callbacks: {
              label: (context) => {
                const index = context.dataIndex;
                const item = stats[index];
                if (!item) return '';
                return ` ${item.total} Soal (${item.percentage}%) · ${item.aktif} Aktif / ${item.nonAktif} Non Aktif`;
              }
            }
          }
        },
        onClick: (_event, elements) => {
          if (elements.length > 0 && onSelectJenis) {
            const index = elements[0].index;
            const item = stats[index];
            if (item) {
              onSelectJenis(item.name);
            }
          }
        }
      }
    };

    chartInstanceRef.current = new ChartJS(ctx, config);

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [stats, chartType, onSelectJenis]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 md:p-6 flex flex-col justify-between">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
            <h3 className="font-semibold text-slate-900 text-base md:text-lg tracking-tight">
              Statistik Jenis Soal
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Komposisi distribusi kategori training · Total {filteredData.length} modul
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {/* Division Filter */}
          <div className="relative">
            <select
              value={divisionFilter}
              onChange={(e) => setDivisionFilter(e.target.value)}
              className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg pl-2.5 pr-7 py-1.5 text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
            >
              <option value="ALL">Semua Divisi</option>
              {availableDivisions.map(div => (
                <option key={div} value={div}>{div}</option>
              ))}
            </select>
            <Filter className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Toggle Pie / Doughnut */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
            <button
              onClick={() => setChartType('doughnut')}
              title="Tampilan Donut"
              className={`p-1.5 rounded-md text-xs transition-colors ${
                chartType === 'doughnut'
                  ? 'bg-white text-blue-700 shadow-xs font-medium'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <CircleDot className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartType('pie')}
              title="Tampilan Pie"
              className={`p-1.5 rounded-md text-xs transition-colors ${
                chartType === 'pie'
                  ? 'bg-white text-blue-700 shadow-xs font-medium'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <PieChart className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="grid lg:grid-cols-12 gap-6 items-center my-4">
        {/* Canvas */}
        <div className="lg:col-span-6 relative h-64 sm:h-72 w-full flex items-center justify-center">
          {filteredData.length === 0 ? (
            <div className="text-center text-slate-400 text-sm">
              Tidak ada data untuk filter ini
            </div>
          ) : (
            <>
              <canvas ref={canvasRef} className="w-full h-full" />

              {chartType === 'doughnut' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tracking-tight tabular-nums">
                    {filteredData.length}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Modul Soal
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Interactive Custom Legend & Quick Drilldown */}
        <div className="lg:col-span-6 flex flex-col gap-2.5">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider pb-1 flex justify-between items-center">
            <span>Kategori Jenis Soal</span>
            <span className="font-mono">Porsi / Unit</span>
          </div>

          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
            {stats.map(item => {
              const isSelected = selectedJenis === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => onSelectJenis && onSelectJenis(item.name)}
                  className={`w-full group text-left p-2.5 rounded-xl border transition-all duration-150 flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-slate-50/70 hover:bg-slate-100/70 border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="truncate">
                      <p className="text-xs font-medium text-slate-800 truncate group-hover:text-blue-700 transition-colors">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {item.aktif} Aktif · {item.nonAktif} Non Aktif
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pl-2">
                    <div className="text-right">
                      <span className="text-xs font-bold font-mono text-slate-800 tabular-nums">
                        {item.percentage}%
                      </span>
                      <span className="block text-[11px] text-slate-400 font-mono tabular-nums">
                        {item.total} soal
                      </span>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
        <span>Klik pada bagian grafik atau kartu legenda untuk memfilter data tabel</span>
        {selectedJenis && (
          <button
            onClick={() => onSelectJenis && onSelectJenis('')}
            className="text-blue-600 hover:text-blue-800 font-medium hover:underline text-xs"
          >
            Reset Filter Jenis ({selectedJenis})
          </button>
        )}
      </div>
    </div>
  );
};
