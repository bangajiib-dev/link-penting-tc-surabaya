/* © 2026 Bang Ajiib. All rights reserved. */

import React from 'react';
import { TrainingItem } from '../types/training';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  item: TrainingItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  item,
  isOpen,
  onClose,
  onConfirm
}) => {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full border border-slate-200 overflow-hidden flex flex-col text-center p-6 animate-in zoom-in-95 duration-150">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
          <Trash2 className="w-7 h-7" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-1">
          Hapus Modul Soal?
        </h3>

        <p className="text-xs text-slate-500 mb-3">
          Anda akan menghapus modul <strong className="text-slate-800">"{item.nama_soal}"</strong> ({item.divisi} - {item.sub_divisi}).
        </p>

        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-[11px] text-left flex items-start gap-2 mb-5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>Tindakan ini akan menghapus data dari tabel lokal. Pastikan Anda tidak memerlukan link pengerjaan ini lagi.</span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            onClick={() => onConfirm(item.id)}
            className="flex-1 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
};
