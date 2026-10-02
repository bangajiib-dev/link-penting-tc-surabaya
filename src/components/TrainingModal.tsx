/* © 2026 Bang Ajiib. All rights reserved. */

import React, { useState, useEffect } from 'react';
import { TrainingItem } from '../types/training';
import { SUB_DIVISI_MAP, JENIS_SOAL_OPTIONS } from '../data/initialData';
import { X, Save, AlertCircle, Sparkles } from 'lucide-react';

interface TrainingModalProps {
  isOpen: boolean;
  itemToEdit: TrainingItem | null;
  onClose: () => void;
  onSave: (item: TrainingItem) => void;
}

export const TrainingModal: React.FC<TrainingModalProps> = ({
  isOpen,
  itemToEdit,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<Partial<TrainingItem>>({
    divisi: 'TCDEV2',
    sub_divisi: 'Orientasi',
    nama_soal: '',
    training_hari_ke: 1,
    jenis_soal: 'Pre Test / Post Test',
    link_pengerjaan: '',
    link_tarik_data: '',
    keterangan: '-',
    status: 'Aktif'
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (itemToEdit) {
      setFormData({ ...itemToEdit });
    } else {
      setFormData({
        divisi: 'TCDEV2',
        sub_divisi: SUB_DIVISI_MAP['TCDEV2'][0] || '',
        nama_soal: '',
        training_hari_ke: 1,
        jenis_soal: 'Pre Test / Post Test',
        link_pengerjaan: '',
        link_tarik_data: '',
        keterangan: '-',
        status: 'Aktif'
      });
    }
    setErrorMsg(null);
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const currentDivisi = formData.divisi || 'TCDEV2';
  const availableSubDivisions = SUB_DIVISI_MAP[currentDivisi] || ['Lainnya'];

  const handleDivisiChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDiv = e.target.value;
    const defaultSub = (SUB_DIVISI_MAP[newDiv] && SUB_DIVISI_MAP[newDiv][0]) || 'Lainnya';
    setFormData(prev => ({
      ...prev,
      divisi: newDiv,
      sub_divisi: defaultSub
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.divisi) {
      setErrorMsg('Divisi wajib dipilih');
      return;
    }
    if (!formData.sub_divisi) {
      setErrorMsg('Sub Divisi wajib dipilih');
      return;
    }
    if (!formData.nama_soal?.trim()) {
      setErrorMsg('Nama soal wajib diisi');
      return;
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const completeItem: TrainingItem = {
      id: itemToEdit?.id || String(Date.now()),
      divisi: formData.divisi,
      sub_divisi: formData.sub_divisi,
      nama_soal: formData.nama_soal.trim(),
      training_hari_ke: Number(formData.training_hari_ke) || 0,
      jenis_soal: formData.jenis_soal || 'Pre Test / Post Test',
      link_pengerjaan: formData.link_pengerjaan?.trim() || '',
      link_tarik_data: formData.link_tarik_data?.trim() || '-',
      keterangan: formData.keterangan?.trim() || '-',
      status: formData.status || 'Aktif',
      created_date: itemToEdit?.created_date || now,
      updated_date: now,
      link_qr: itemToEdit?.link_qr || ''
    };

    onSave(completeItem);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              {itemToEdit ? '✏️' : '✨'}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">
                {itemToEdit ? 'Edit Data Modul Soal' : 'Tambah Modul Training Baru'}
              </h3>
              <p className="text-xs text-slate-500">
                {itemToEdit ? `ID: ${itemToEdit.id}` : 'Formulir data bank soal Training Center Surabaya'}
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

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Divisi */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Divisi <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.divisi}
                onChange={handleDivisiChange}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                {Object.keys(SUB_DIVISI_MAP).map(div => (
                  <option key={div} value={div}>{div}</option>
                ))}
              </select>
            </div>

            {/* Sub Divisi */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Sub Divisi <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.sub_divisi}
                onChange={e => setFormData({ ...formData, sub_divisi: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                {availableSubDivisions.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            {/* Nama Soal */}
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Soal / Modul <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nama_soal}
                onChange={e => setFormData({ ...formData, nama_soal: e.target.value })}
                placeholder="Contoh: Training COS / Tes Teori H1 / Post Test Barista"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>

            {/* Training Hari Ke */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Training Hari Ke
              </label>
              <input
                type="number"
                min="0"
                max="99"
                value={formData.training_hari_ke}
                onChange={e => setFormData({ ...formData, training_hari_ke: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-mono tabular-nums"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                0 untuk orientasi / materi mandiri / umum
              </span>
            </div>

            {/* Jenis Soal */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Jenis Soal
              </label>
              <select
                value={formData.jenis_soal}
                onChange={e => setFormData({ ...formData, jenis_soal: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                {JENIS_SOAL_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Status Operasional
              </label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <option value="Aktif">Aktif (Dapat Dikerjakan)</option>
                <option value="Non Aktif">Non Aktif (Arsip)</option>
              </select>
            </div>

            {/* Keterangan */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Keterangan
              </label>
              <input
                type="text"
                value={formData.keterangan}
                onChange={e => setFormData({ ...formData, keterangan: e.target.value })}
                placeholder="Catatan tambahan atau '-'"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>

            {/* Link Pengerjaan */}
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Link Pengerjaan (Google Form / Web App / Bitly / dsb)
              </label>
              <input
                type="text"
                value={formData.link_pengerjaan}
                onChange={e => setFormData({ ...formData, link_pengerjaan: e.target.value })}
                placeholder="https://script.google.com/... atau https://forms.gle/..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-mono"
              />
            </div>

            {/* Link Tarik Data */}
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Link Tarik Data (Spreadsheet Hasil / Looker Studio)
              </label>
              <input
                type="text"
                value={formData.link_tarik_data}
                onChange={e => setFormData({ ...formData, link_tarik_data: e.target.value })}
                placeholder="https://docs.google.com/spreadsheets/d/... atau '-'"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-mono"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{itemToEdit ? 'Simpan Perubahan' : 'Tambahkan Soal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
