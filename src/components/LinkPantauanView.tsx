/* © 2026 Bang Ajiib. All rights reserved. */

import React from 'react';
import { TrainingItem } from '../types/training';
import { formatUrl } from '../services/sheetsService';
import { Eye, ExternalLink, FileSpreadsheet, Calendar, ShieldCheck } from 'lucide-react';

interface LinkPantauanViewProps {
  data: TrainingItem[];
  onShowQr: (item: TrainingItem) => void;
  onEdit: (item: TrainingItem) => void;
}

export const LinkPantauanView: React.FC<LinkPantauanViewProps> = ({
  data,
  onShowQr,
  onEdit
}) => {
  const pantauanItems = data.filter(
    d => d.divisi === 'Link_Pantauan' || d.jenis_soal === 'Monitoring' || d.nama_soal.toLowerCase().includes('pantauan')
  );

  return (
    <div className="space-y-6">
      {/* Intro Card */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold tracking-wide text-blue-200 mb-3 border border-white/10">
            <Eye className="w-3.5 h-3.5 text-blue-300" />
            <span>Monitoring & Pengawasan Real-time</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
            Link Pantauan Training Center Surabaya
          </h2>
          <p className="text-sm text-blue-100/90 leading-relaxed">
            Pusat tautan spreadsheet monitoring berkala, pengawasan toko YCCG, Say Bread, dan target operasional bulanan TCS.
          </p>
        </div>

        {/* Decorative graphic */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Grid of Link Pantauan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pantauanItems.map(item => {
          const directUrl = formatUrl(item.link_pengerjaan);

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
                    {item.divisi}
                  </span>
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    {item.status}
                  </span>
                </div>

                <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors mb-1">
                  {item.nama_soal}
                </h4>

                <p className="text-xs text-slate-500 mb-4">
                  Sub Unit: <strong className="text-slate-700">{item.sub_divisi}</strong>
                </p>

                {item.keterangan && item.keterangan !== '-' && (
                  <p className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 text-slate-600 mb-4">
                    {item.keterangan}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 font-mono">
                  Update: {item.updated_date ? item.updated_date.split(' ')[0] : '-'}
                </span>

                <a
                  href={directUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-2xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Buka Pantauan</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
