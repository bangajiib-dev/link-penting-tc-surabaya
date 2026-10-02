/* © 2026 Bang Ajiib. All rights reserved. */

import React, { useMemo, useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  registerables,
  ChartConfiguration
} from 'chart.js';
import { TrainingItem } from '../types/training';
import { Building2 } from 'lucide-react';

ChartJS.register(...registerables);

interface DivisiBarChartProps {
  data: TrainingItem[];
  onSelectDivision?: (division: string) => void;
}

export const DivisiBarChart: React.FC<DivisiBarChartProps> = ({
  data,
  onSelectDivision
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<ChartJS | null>(null);

  const divisionStats = useMemo(() => {
    const map: Record<string, { aktif: number; nonAktif: number; total: number }> = {};

    data.forEach(item => {
      const div = item.divisi || 'Lainnya';
      if (!map[div]) {
        map[div] = { aktif: 0, nonAktif: 0, total: 0 };
      }
      map[div].total++;
      if (item.status === 'Aktif') {
        map[div].aktif++;
      } else {
        map[div].nonAktif++;
      }
    });

    const entries = Object.entries(map).sort((a, b) => b[1].total - a[1].total);
    return {
      labels: entries.map(([div]) => div),
      aktif: entries.map(([_, v]) => v.aktif),
      nonAktif: entries.map(([_, v]) => v.nonAktif),
      totals: entries.map(([_, v]) => v.total)
    };
  }, [data]);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: divisionStats.labels,
        datasets: [
          {
            label: 'Soal Aktif',
            data: divisionStats.aktif,
            backgroundColor: '#0057B8', // Indomaret Biru
            borderRadius: 6,
            barPercentage: 0.7,
            categoryPercentage: 0.8
          },
          {
            label: 'Soal Non Aktif',
            data: divisionStats.nonAktif,
            backgroundColor: '#E31837', // Indomaret Merah
            borderRadius: 6,
            barPercentage: 0.7,
            categoryPercentage: 0.8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: {
              boxWidth: 12,
              usePointStyle: true,
              font: { size: 11, family: 'Plus Jakarta Sans', weight: 'bold' }
            }
          },
          tooltip: {
            backgroundColor: '#0f172a',
            titleFont: { size: 13, weight: 'bold', family: 'Plus Jakarta Sans' },
            bodyFont: { size: 12, family: 'Plus Jakarta Sans' },
            padding: 10,
            cornerRadius: 8,
            usePointStyle: true,
            callbacks: {
              footer: (items) => {
                if (!items.length) return '';
                const idx = items[0].dataIndex;
                return `Total Modul: ${divisionStats.totals[idx]}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 11, family: 'Plus Jakarta Sans' } }
          },
          y: {
            beginAtZero: true,
            grid: { color: '#f1f5f9' },
            ticks: { precision: 0, font: { size: 11, family: 'JetBrains Mono' } }
          }
        },
        onClick: (_event, elements) => {
          if (elements.length > 0 && onSelectDivision) {
            const index = elements[0].index;
            const divName = divisionStats.labels[index];
            onSelectDivision(divName);
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
  }, [divisionStats, onSelectDivision]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 md:p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-slate-900 text-base md:text-lg tracking-tight">
              Jumlah Soal per Divisi
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Komparasi volume modul training aktif vs non-aktif antar divisi
          </p>
        </div>

        <span className="text-[11px] text-slate-400 font-mono hidden sm:inline-block">
          Klik bar untuk filter divisi
        </span>
      </div>

      <div className="h-64 sm:h-72 w-full mt-4">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>6 Divisi & Unit Operasional Terdaftar</span>
        <span className="font-mono text-slate-700 font-semibold tabular-nums">
          {data.length} Total Soal
        </span>
      </div>
    </div>
  );
};
