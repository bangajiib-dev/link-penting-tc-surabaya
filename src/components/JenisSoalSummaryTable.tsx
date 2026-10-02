/* © 2026 Bang Ajiib. All rights reserved. */

import React from 'react';
import { JenisSoalSummary } from '../types/training';
import { ExternalLink, Layers, CheckCircle2, XCircle } from 'lucide-react';

interface JenisSoalSummaryTableProps {
  summary: JenisSoalSummary[];
  onSelectCategory: (jenis: string) => void;
  selectedCategory?: string | null;
}

export const JenisSoalSummaryTable: React.FC<JenisSoalSummaryTableProps> = ({
  summary,
  onSelectCategory,
  selectedCategory
}) => {
  const totalModul = summary.reduce((acc, s) => acc + s.total, 0);
  const totalAktif = summary.reduce((acc, s) => acc + s.aktif, 0);
  const totalNonAktif = summary.reduce((acc, s) => acc + s.nonAktif, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between">
      {/* Table Header Section */}
      <div className="p-5 md:p-6 pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-slate-900 text-base md:text-lg tracking-tight">
              Tabel Ringkasan Data Jenis Soal
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Rincian matriks per jenis soal, tingkat keaktifan, dan sebaran divisi training
          </p>
        </div>

        {selectedCategory && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Filter Aktif:</span>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md">
              {selectedCategory}
            </span>
            <button
              onClick={() => onSelectCategory('')}
              className="text-xs text-slate-400 hover:text-slate-700 underline transition-colors"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      {/* Table Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200/70">
              <th className="py-3 px-4 md:px-5">Kategori Jenis Soal</th>
              <th className="py-3 px-3 text-right">Jumlah</th>
              <th className="py-3 px-4 min-w-[130px]">Porsi Kontribusi</th>
              <th className="py-3 px-3 text-center">Status (Aktif/Non)</th>
              <th className="py-3 px-3 text-center">Rata² Hari</th>
              <th className="py-3 px-4">Divisi Terkait</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {summary.map((row) => {
              const isSelected = selectedCategory === row.jenis_soal;
              const activeRate = row.total ? Math.round((row.aktif / row.total) * 100) : 0;

              return (
                <tr
                  key={row.jenis_soal}
                  onClick={() => onSelectCategory(row.jenis_soal)}
                  className={`cursor-pointer transition-colors duration-150 ${
                    isSelected
                      ? 'bg-blue-50/80 font-medium'
                      : 'hover:bg-slate-50/70'
                  }`}
                >
                  {/* Category Name */}
                  <td className="py-3 px-4 md:px-5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">
                        {row.jenis_soal}
                      </span>
                    </div>
                  </td>

                  {/* Count */}
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-800 tabular-nums">
                    {row.total}
                  </td>

                  {/* Percentage Progress Bar */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(row.percentage, 100)}%` }}
                        />
                      </div>
                      <span className="font-mono text-slate-700 font-semibold tabular-nums w-10 text-right">
                        {row.percentage}%
                      </span>
                    </div>
                  </td>

                  {/* Active / Inactive breakdown */}
                  <td className="py-3 px-3 text-center">
                    <div className="inline-flex items-center gap-1.5 font-mono">
                      <span className="text-emerald-700 flex items-center gap-0.5" title={`${row.aktif} Aktif`}>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {row.aktif}
                      </span>
                      <span className="text-slate-300">/</span>
                      <span className="text-rose-600 flex items-center gap-0.5" title={`${row.nonAktif} Non Aktif`}>
                        <XCircle className="w-3 h-3 text-rose-500" />
                        {row.nonAktif}
                      </span>
                    </div>
                  </td>

                  {/* Average Day */}
                  <td className="py-3 px-3 text-center font-mono text-slate-700 tabular-nums">
                    Hari {row.avgHari}
                  </td>

                  {/* Related Divisions */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 flex-wrap max-w-xs">
                      {row.divisions.slice(0, 3).map((div) => (
                        <span
                          key={div}
                          className="bg-slate-100 text-slate-700 text-[11px] px-1.5 py-0.5 rounded font-medium border border-slate-200/60"
                        >
                          {div}
                        </span>
                      ))}
                      {row.divisions.length > 3 && (
                        <span className="text-[10px] text-slate-500 font-mono">
                          +{row.divisions.length - 3} lainnya
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Quick Action */}
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCategory(row.jenis_soal);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-800 bg-blue-50/60 hover:bg-blue-100/60 border border-blue-200/60 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      <span>Lihat</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Table Summary Footer */}
          <tfoot>
            <tr className="bg-slate-100/70 font-semibold text-slate-900 border-t-2 border-slate-200">
              <td className="py-3 px-4 md:px-5">Total Keseluruhan</td>
              <td className="py-3 px-3 text-right font-mono font-bold tabular-nums">
                {totalModul}
              </td>
              <td className="py-3 px-4 font-mono tabular-nums">100.0%</td>
              <td className="py-3 px-3 text-center font-mono tabular-nums">
                <span className="text-emerald-700 font-bold">{totalAktif}</span>
                <span className="text-slate-400 mx-1">/</span>
                <span className="text-rose-600 font-bold">{totalNonAktif}</span>
              </td>
              <td className="py-3 px-3 text-center text-slate-500 font-mono">-</td>
              <td className="py-3 px-4 text-slate-500 text-[11px]">Semua Divisi TCS</td>
              <td className="py-3 px-4 text-center">
                <span className="text-slate-400 text-[11px]">Lengkap</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
