/* © 2026 Bang Ajiib. All rights reserved. */

import React, { useState, useMemo } from 'react';
import { TrainingItem, DivisionType } from '../types/training';
import { formatUrl, getDirectDriveUrl, getQuickChartQrUrl } from '../services/sheetsService';
import { SUB_DIVISI_MAP, JENIS_SOAL_OPTIONS } from '../data/initialData';
import {
  Search,
  Filter,
  ExternalLink,
  Table as TableIcon,
  QrCode,
  Edit2,
  Trash2,
  Database,
  ArrowUpDown,
  RefreshCw,
  Download,
  CheckCircle2,
  XCircle,
  FileSpreadsheet
} from 'lucide-react';

interface TrainingTableProps {
  data: TrainingItem[];
  currentDivision: string;
  onSelectDivision: (division: string) => void;
  selectedJenisFilter: string | null;
  onClearJenisFilter: () => void;
  onEditItem: (item: TrainingItem) => void;
  onDeleteItem: (item: TrainingItem) => void;
  onViewQr: (item: TrainingItem) => void;
  onToggleStatus: (id: string) => void;
  onExportCSV: () => void;
  onOpenSupabaseModal?: () => void;
}

export const TrainingTable: React.FC<TrainingTableProps> = ({
  data,
  currentDivision,
  onSelectDivision,
  selectedJenisFilter,
  onClearJenisFilter,
  onEditItem,
  onDeleteItem,
  onViewQr,
  onToggleStatus,
  onExportCSV,
  onOpenSupabaseModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [subDivisiFilter, setSubDivisiFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [hariFilter, setHariFilter] = useState('');
  const [sortField, setSortField] = useState<keyof TrainingItem>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [pageSize, setPageSize] = useState<number>(15);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Available sub-divisions for dropdown
  const availableSubDivs = useMemo(() => {
    if (currentDivision && currentDivision !== 'ALL' && SUB_DIVISI_MAP[currentDivision]) {
      return SUB_DIVISI_MAP[currentDivision];
    }
    const set = new Set(data.map(d => d.sub_divisi).filter(Boolean));
    return Array.from(set).sort();
  }, [currentDivision, data]);

  // Distinct training days
  const availableDays = useMemo(() => {
    const set = new Set(data.map(d => Number(d.training_hari_ke)).filter(n => !isNaN(n)));
    return Array.from(set).sort((a, b) => a - b);
  }, [data]);

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    return data.filter(item => {
      // Division
      if (currentDivision && currentDivision !== 'ALL' && item.divisi !== currentDivision) {
        return false;
      }
      // Sub-Divisi
      if (subDivisiFilter && item.sub_divisi !== subDivisiFilter) {
        return false;
      }
      // Jenis Soal
      if (selectedJenisFilter && item.jenis_soal !== selectedJenisFilter) {
        return false;
      }
      // Status
      if (statusFilter && item.status !== statusFilter) {
        return false;
      }
      // Hari
      if (hariFilter !== '' && String(item.training_hari_ke) !== hariFilter) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchNama = (item.nama_soal || '').toLowerCase().includes(query);
        const matchSub = (item.sub_divisi || '').toLowerCase().includes(query);
        const matchDiv = (item.divisi || '').toLowerCase().includes(query);
        const matchKet = (item.keterangan || '').toLowerCase().includes(query);
        if (!matchNama && !matchSub && !matchDiv && !matchKet) return false;
      }
      return true;
    }).sort((a, b) => {
      const valA = a[sortField] ?? '';
      const valB = b[sortField] ?? '';
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return sortOrder === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [
    data,
    currentDivision,
    subDivisiFilter,
    selectedJenisFilter,
    statusFilter,
    hariFilter,
    searchQuery,
    sortField,
    sortOrder
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  const handleSort = (field: keyof TrainingItem) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSubDivisiFilter('');
    setStatusFilter('');
    setHariFilter('');
    if (selectedJenisFilter) onClearJenisFilter();
    if (currentDivision !== 'ALL') onSelectDivision('ALL');
    setCurrentPage(1);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
      {/* Top Filter Bar */}
      <div className="p-5 md:p-6 border-b border-slate-100 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-lg tracking-tight flex items-center gap-2">
              <TableIcon className="w-5 h-5 text-blue-600" />
              <span>Katalog Data LInk Penting Tc Surabaya</span>
              <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md tabular-nums">
                {filteredItems.length} Modul
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pencarian, filter terpadu, akses barcode, dan tautan pengerjaan soal
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onOpenSupabaseModal && (
              <button
                onClick={onOpenSupabaseModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors shadow-2xs"
                title="Status Database Supabase"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="hidden sm:inline">Database Supabase</span>
              </button>
            )}
            <button
              onClick={onExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleResetFilters}
              title="Reset seluruh filter"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-2.5">
          {/* Search Input */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari Nama Soal, Sub Divisi, Keterangan..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Divisi Filter */}
          <div>
            <select
              value={currentDivision}
              onChange={e => {
                onSelectDivision(e.target.value);
                setSubDivisiFilter('');
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">Semua Divisi</option>
              <option value="TCDEV2">TCDEV2</option>
              <option value="SS">SS</option>
              <option value="FBI">FBI</option>
              <option value="IPL">IPL</option>
              <option value="Lainnya">Lainnya</option>
              <option value="Link_Pantauan">Link Pantauan</option>
            </select>
          </div>

          {/* Sub Divisi Filter */}
          <div>
            <select
              value={subDivisiFilter}
              onChange={e => {
                setSubDivisiFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">Semua Sub Divisi</option>
              {availableSubDivs.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={e => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Non Aktif">Non Aktif</option>
            </select>
          </div>

          {/* Hari Training Filter */}
          <div>
            <select
              value={hariFilter}
              onChange={e => {
                setHariFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-mono"
            >
              <option value="">Semua Hari</option>
              {availableDays.map(d => (
                <option key={d} value={String(d)}>Hari {d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Pill indicators */}
        {(selectedJenisFilter || currentDivision !== 'ALL' || subDivisiFilter || statusFilter || hariFilter || searchQuery) && (
          <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 pt-1">
            <span className="font-semibold text-slate-700">Filter Diterapkan:</span>
            {currentDivision !== 'ALL' && (
              <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md font-medium">
                Divisi: {currentDivision}
              </span>
            )}
            {selectedJenisFilter && (
              <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md font-medium">
                Jenis: {selectedJenisFilter}
              </span>
            )}
            {subDivisiFilter && (
              <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md font-medium">
                Sub: {subDivisiFilter}
              </span>
            )}
            {statusFilter && (
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md font-medium">
                Status: {statusFilter}
              </span>
            )}
            {hariFilter && (
              <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md font-mono">
                Hari: {hariFilter}
              </span>
            )}
            {searchQuery && (
              <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md">
                "{searchQuery}"
              </span>
            )}
            <button
              onClick={handleResetFilters}
              className="text-blue-600 hover:underline font-semibold ml-1"
            >
              Hapus Semua
            </button>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
              <th
                onClick={() => handleSort('nama_soal')}
                className="py-3 px-4 md:px-5 cursor-pointer hover:text-slate-900 transition-colors select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Nama Soal & Sub Divisi</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('divisi')}
                className="py-3 px-3 cursor-pointer hover:text-slate-900 transition-colors select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Divisi</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('training_hari_ke')}
                className="py-3 px-3 text-center cursor-pointer hover:text-slate-900 transition-colors select-none"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Hari</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('jenis_soal')}
                className="py-3 px-3 cursor-pointer hover:text-slate-900 transition-colors select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Jenis Soal</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('status')}
                className="py-3 px-3 text-center cursor-pointer hover:text-slate-900 transition-colors select-none"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Status</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3 text-center">Barcode QR</th>
              <th className="py-3 px-4 text-center min-w-[240px]">Aksi Pengerjaan & Data</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <Database className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="font-medium text-sm text-slate-600">Tidak ada modul yang cocok</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Coba sesuaikan kata kunci atau bersihkan filter di atas
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="mt-3 px-4 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    Reset Filter
                  </button>
                </td>
              </tr>
            ) : (
              paginatedItems.map(item => {
                const linkPengerjaan = formatUrl(item.link_pengerjaan);
                const linkTarikData = formatUrl(item.link_tarik_data);
                const qrThumb = item.link_qr && item.link_qr.trim() !== ''
                  ? getDirectDriveUrl(item.link_qr)
                  : getQuickChartQrUrl(item.link_pengerjaan, 120);

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 transition-colors duration-150 group"
                  >
                    {/* Nama Soal */}
                    <td className="py-3 px-4 md:px-5">
                      <div className="font-semibold text-slate-900 text-xs sm:text-sm group-hover:text-blue-700 transition-colors">
                        {item.nama_soal}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                        <span className="font-medium text-slate-600">{item.sub_divisi}</span>
                        {item.keterangan && item.keterangan !== '-' && (
                          <>
                            <span className="text-slate-300">·</span>
                            <span className="text-slate-400 italic truncate max-w-xs">{item.keterangan}</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Divisi */}
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-700 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded text-[11px]">
                        {item.divisi}
                      </span>
                    </td>

                    {/* Hari */}
                    <td className="py-3 px-3 text-center">
                      <span className="font-mono text-slate-700 font-semibold tabular-nums text-xs">
                        H-{item.training_hari_ke}
                      </span>
                    </td>

                    {/* Jenis Soal */}
                    <td className="py-3 px-3">
                      <span className="font-medium text-slate-700">
                        {item.jenis_soal}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onToggleStatus(item.id)}
                        title="Klik untuk mengubah status"
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-all ${
                          item.status === 'Aktif'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        {item.status === 'Aktif' ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <XCircle className="w-3 h-3 text-rose-600" />
                        )}
                        <span>{item.status}</span>
                      </button>
                    </td>

                    {/* QR Code Barcode preview */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center">
                        {qrThumb ? (
                          <button
                            onClick={() => onViewQr(item)}
                            title="Klik untuk membuka QR Code resolusi tinggi"
                            className="p-1 bg-white border border-slate-200 rounded-lg hover:border-blue-400 hover:shadow-xs transition-all group/qr"
                          >
                            <img
                              src={qrThumb}
                              alt="QR Barcode"
                              className="w-9 h-9 object-contain rounded group-hover/qr:scale-105 transition-transform"
                              loading="lazy"
                            />
                          </button>
                        ) : (
                          <button
                            onClick={() => onViewQr(item)}
                            className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-slate-200 transition-colors"
                            title="Generate QR Barcode"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        {/* Kerjakan */}
                        <a
                          href={linkPengerjaan}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-white transition-colors shadow-2xs ${
                            linkPengerjaan === '#'
                              ? 'bg-slate-300 pointer-events-none'
                              : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                          title="Buka link soal pengerjaan"
                        >
                          <span>Kerjakan</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>

                        {/* Tarik Data */}
                        <a
                          href={linkTarikData}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors shadow-2xs ${
                            linkTarikData === '#'
                              ? 'bg-slate-100 text-slate-300 pointer-events-none border border-slate-200'
                              : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/70'
                          }`}
                          title="Buka spreadsheet respon / tarik data"
                        >
                          <FileSpreadsheet className="w-3 h-3 text-amber-600" />
                          <span>Tarik Data</span>
                        </a>

                        {/* Edit */}
                        <button
                          onClick={() => onEditItem(item)}
                          className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg border border-slate-200 transition-colors"
                          title="Edit Modul"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => onDeleteItem(item)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition-colors"
                          title="Hapus Modul"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span>
            Menampilkan{' '}
            <strong className="text-slate-800 font-mono">
              {filteredItems.length ? (currentPage - 1) * pageSize + 1 : 0}
            </strong>{' '}
            -{' '}
            <strong className="text-slate-800 font-mono">
              {Math.min(currentPage * pageSize, filteredItems.length)}
            </strong>{' '}
            dari{' '}
            <strong className="text-slate-800 font-mono">{filteredItems.length}</strong> data
          </span>

          <select
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="py-1 px-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs focus:outline-none"
          >
            <option value={10}>10 baris</option>
            <option value={15}>15 baris</option>
            <option value={25}>25 baris</option>
            <option value={50}>50 baris</option>
            <option value={100}>Semua</option>
          </select>
        </div>

        {/* Page navigation */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-50 transition-colors"
          >
            Sebelumnya
          </button>

          <span className="px-2 font-mono tabular-nums text-slate-700">
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-50 transition-colors"
          >
            Selanjutnya
          </button>
        </div>
      </div>
    </div>
  );
};
