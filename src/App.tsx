/* © 2026 Bang Ajiib. All rights reserved. */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TrainingItem } from './types/training';
import {
  getTrainingData,
  saveTrainingData,
  computeDashboardStats,
  computeJenisSoalSummary,
  exportToCSVFile
} from './services/sheetsService';
import {
  getSupabaseConfig,
  fetchItemsFromSupabase,
  upsertItemToSupabase,
  deleteItemFromSupabase
} from './services/supabaseService';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { TrainingTable } from './components/TrainingTable';
import { LinkPantauanView } from './components/LinkPantauanView';
import { Footer } from './components/Footer';
import { TrainingModal } from './components/TrainingModal';
import { QrCodeModal } from './components/QrCodeModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { SupabaseModal } from './components/SupabaseModal';
import { ToastContainer, ToastMessage } from './components/Toast';

export default function App() {
  const [data, setData] = useState<TrainingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSync, setLastSync] = useState<string>('Memuat...');
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [selectedJenisFilter, setSelectedJenisFilter] = useState<string | null>(null);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [itemToEdit, setItemToEdit] = useState<TrainingItem | null>(null);
  const [qrModalItem, setQrModalItem] = useState<TrainingItem | null>(null);
  const [deleteModalItem, setDeleteModalItem] = useState<TrainingItem | null>(null);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Supabase active state
  const isSupabaseActive = Boolean(getSupabaseConfig().url && getSupabaseConfig().anonKey);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = String(Date.now() + Math.random());
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Initial load
  useEffect(() => {
    async function init() {
      setLoading(true);

      // Check if Supabase connection is active first
      if (isSupabaseActive) {
        try {
          const supabaseData = await fetchItemsFromSupabase();
          if (supabaseData && supabaseData.length > 0) {
            setData(supabaseData);
            setLastSync('Supabase Live');
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Supabase initial fetch failed, falling back to sheets/local:', e);
        }
      }

      // Default load from Supabase / localStorage
      const res = await getTrainingData(false);
      setData(res.data);
      setLastSync(res.lastSync);
      setLoading(false);
    }
    init();
  }, [isSupabaseActive]);

  // Manual Sync trigger
  const handleSync = async () => {
    setIsSyncing(true);
    showToast('Menghubungkan ke database Supabase...', 'info');

    // If Supabase is configured, sync directly from Supabase
    if (isSupabaseActive) {
      try {
        const supabaseData = await fetchItemsFromSupabase();
        if (supabaseData && supabaseData.length > 0) {
          setData(supabaseData);
          saveTrainingData(supabaseData);
          setLastSync(`Supabase (${new Date().toLocaleTimeString('id-ID')})`);
          showToast(`Berhasil menyinkronkan ${supabaseData.length} modul dari Supabase!`, 'success');
          setIsSyncing(false);
          return;
        }
      } catch (err) {
        console.warn('Supabase sync error:', err);
      }
    }

    // Fallback sync
    try {
      const res = await getTrainingData(true);
      setData(res.data);
      setLastSync(res.lastSync);
      if (res.source === 'SUPABASE') {
        showToast('Data berhasil disinkronkan dari database Supabase!', 'success');
      } else {
        showToast('Data berhasil dimuat dari database lokal Supabase.', 'success');
      }
    } catch {
      showToast('Gagal menyinkronkan data Supabase.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Add / Edit
  const handleOpenAddModal = () => {
    setItemToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: TrainingItem) => {
    setItemToEdit(item);
    setIsModalOpen(true);
  };

  const handleSaveItem = async (item: TrainingItem) => {
    let updatedData: TrainingItem[];
    const exists = data.some(d => d.id === item.id);

    if (exists) {
      updatedData = data.map(d => (d.id === item.id ? item : d));
      showToast(`Modul "${item.nama_soal}" berhasil diperbarui`, 'success');
    } else {
      updatedData = [item, ...data];
      showToast(`Modul baru "${item.nama_soal}" berhasil ditambahkan`, 'success');
    }

    setData(updatedData);
    saveTrainingData(updatedData);
    setIsModalOpen(false);
    setItemToEdit(null);

    // Async sync to Supabase if configured
    if (isSupabaseActive) {
      upsertItemToSupabase(item).then(success => {
        if (success) {
          showToast('Perubahan tersimpan otomatis ke database Supabase', 'info');
        }
      });
    }
  };

  // Delete
  const handleOpenDeleteModal = (item: TrainingItem) => {
    setDeleteModalItem(item);
  };

  const handleConfirmDelete = (id: string) => {
    const target = data.find(d => d.id === id);
    const updated = data.filter(d => d.id !== id);
    setData(updated);
    saveTrainingData(updated);
    setDeleteModalItem(null);
    showToast(`Modul "${target?.nama_soal || id}" berhasil dihapus`, 'info');

    // Async delete from Supabase if configured
    if (isSupabaseActive) {
      deleteItemFromSupabase(id).then(success => {
        if (success) {
          showToast('Data berhasil dihapus dari database Supabase', 'info');
        }
      });
    }
  };

  // Toggle status
  const handleToggleStatus = (id: string) => {
    let targetItem: TrainingItem | null = null;
    const updated = data.map(d => {
      if (d.id === id) {
        const nextStatus = d.status === 'Aktif' ? 'Non Aktif' : 'Aktif';
        targetItem = {
          ...d,
          status: nextStatus,
          updated_date: new Date().toISOString().replace('T', ' ').substring(0, 19)
        };
        return targetItem;
      }
      return d;
    });
    setData(updated);
    saveTrainingData(updated);
    showToast('Status modul berhasil diperbarui', 'success');

    if (targetItem && isSupabaseActive) {
      upsertItemToSupabase(targetItem);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    exportToCSVFile(data);
    showToast('File CSV berhasil diunduh', 'success');
  };

  // Compute analytics
  const stats = useMemo(() => computeDashboardStats(data), [data]);
  const jenisSummary = useMemo(() => computeJenisSoalSummary(data), [data]);

  // Click handler from Pie Chart / Summary Table
  const handleDrilldownJenis = (jenis: string) => {
    setSelectedJenisFilter(jenis || null);
    if (jenis) {
      setCurrentView('ALL');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans">
      {/* Toast Notification Layer */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onSelectView={view => {
          setCurrentView(view);
          if (view === 'dashboard') {
            setSelectedJenisFilter(null);
          }
        }}
        data={data}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        isSyncing={isSyncing}
        onSync={handleSync}
        lastSync={lastSync}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        isSupabaseActive={isSupabaseActive}
      />

      {/* Main Viewport Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
          currentView={currentView}
          onOpenAddModal={handleOpenAddModal}
          onSync={handleSync}
          isSyncing={isSyncing}
          onExportCSV={handleExportCSV}
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
          isSupabaseActive={isSupabaseActive}
        />

        <main className="p-4 md:p-8 flex-1 max-w-7xl w-full mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm font-semibold text-slate-700">
                Memuat Bank Soal Training Center Surabaya...
              </p>
              <p className="text-xs text-slate-400 mt-1">Mengambil data dari database Supabase PostgreSQL</p>
            </div>
          ) : currentView === 'dashboard' ? (
            <Dashboard
              stats={stats}
              data={data}
              jenisSummary={jenisSummary}
              onSelectCategory={handleDrilldownJenis}
              selectedCategory={selectedJenisFilter}
              onSelectDivision={div => {
                setCurrentView(div);
              }}
              onViewAllData={() => setCurrentView('ALL')}
              onOpenAddModal={handleOpenAddModal}
              onViewQr={item => setQrModalItem(item)}
              onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
              isSupabaseActive={isSupabaseActive}
            />
          ) : currentView === 'Link_Pantauan' ? (
            <LinkPantauanView
              data={data}
              onShowQr={item => setQrModalItem(item)}
              onEdit={item => handleOpenEditModal(item)}
            />
          ) : (
            <TrainingTable
              data={data}
              currentDivision={currentView}
              onSelectDivision={div => setCurrentView(div)}
              selectedJenisFilter={selectedJenisFilter}
              onClearJenisFilter={() => setSelectedJenisFilter(null)}
              onEditItem={handleOpenEditModal}
              onDeleteItem={handleOpenDeleteModal}
              onViewQr={item => setQrModalItem(item)}
              onToggleStatus={handleToggleStatus}
              onExportCSV={handleExportCSV}
              onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
            />
          )}
        </main>

        {/* Global Footer with Ownership Marking across ALL pages */}
        <Footer />
      </div>

      {/* Add / Edit Modal */}
      <TrainingModal
        isOpen={isModalOpen}
        itemToEdit={itemToEdit}
        onClose={() => {
          setIsModalOpen(false);
          setItemToEdit(null);
        }}
        onSave={handleSaveItem}
      />

      {/* QR Code Barcode Modal */}
      <QrCodeModal
        item={qrModalItem}
        onClose={() => setQrModalItem(null)}
        onShowToast={showToast}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteModalItem}
        item={deleteModalItem}
        onClose={() => setDeleteModalItem(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Supabase SQL Editor & Configuration Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        data={data}
        onShowToast={showToast}
        onRefreshData={handleSync}
      />
    </div>
  );
}
