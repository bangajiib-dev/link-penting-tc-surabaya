/* © 2026 Bang Ajiib. All rights reserved. */

import React, { useState, useEffect } from 'react';
import { TrainingItem } from '../types/training';
import { formatUrl } from '../services/sheetsService';
import { generateQrDataUrl, getItemQrCodeUrl } from '../services/qrService';
import { X, ExternalLink, Copy, Check, Download, QrCode, Smartphone, Sparkles } from 'lucide-react';

interface QrCodeModalProps {
  item: TrainingItem | null;
  onClose: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  item,
  onClose,
  onShowToast
}) => {
  const [copied, setCopied] = useState(false);
  const [dataUrl, setDataUrl] = useState<string>('');

  const directPengerjaanUrl = item ? formatUrl(item.link_pengerjaan) : '#';

  useEffect(() => {
    let isMounted = true;
    if (directPengerjaanUrl !== '#') {
      generateQrDataUrl(directPengerjaanUrl, 600).then(url => {
        if (isMounted) setDataUrl(url);
      });
    } else {
      setDataUrl('');
    }
    return () => {
      isMounted = false;
    };
  }, [directPengerjaanUrl]);

  if (!item) return null;

  const fallbackQrUrl = getItemQrCodeUrl(item, 500);
  const qrImageUrl = dataUrl || fallbackQrUrl;

  const handleCopyLink = () => {
    if (directPengerjaanUrl === '#') {
      onShowToast('Link pengerjaan belum tersedia', 'error');
      return;
    }
    navigator.clipboard.writeText(directPengerjaanUrl);
    setCopied(true);
    onShowToast('Link pengerjaan berhasil disalin ke clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!qrImageUrl) {
      onShowToast('Gambar QR Code tidak tersedia', 'error');
      return;
    }
    const cleanFileName = item.nama_soal.replace(/[^a-zA-Z0-9_-]/g, '_');
    const a = document.createElement('a');
    a.href = qrImageUrl;
    a.download = `QR_${cleanFileName}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onShowToast('Barcode berhasil diunduh', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">
                Barcode Pengerjaan
              </h3>
              <p className="text-xs text-slate-500">Scan via smartphone atau salin link</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center text-center">
          {/* Badge & Info */}
          <div className="flex items-center gap-2 text-xs mb-2">
            <span className="font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200/60">
              {item.divisi}
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-600 font-medium">{item.sub_divisi}</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500 font-mono">Hari {item.training_hari_ke}</span>
          </div>

          <h4 className="text-lg font-bold text-slate-900 mb-1 max-w-xs">
            {item.nama_soal}
          </h4>
          <p className="text-xs text-slate-500 mb-5">
            Kategori: <strong className="text-slate-700">{item.jenis_soal}</strong>
          </p>

          {/* QR Code Container */}
          <div className="p-3 bg-white rounded-2xl border-2 border-dashed border-slate-200 shadow-sm relative group">
            {qrImageUrl ? (
              <img
                src={qrImageUrl}
                alt={`QR Code ${item.nama_soal}`}
                className="w-56 h-56 object-contain rounded-xl"
                loading="eager"
              />
            ) : (
              <div className="w-56 h-56 flex flex-col items-center justify-center bg-slate-50 rounded-xl text-slate-400 p-4">
                <QrCode className="w-10 h-10 mb-2 opacity-50" />
                <span className="text-xs">Link pengerjaan belum ditentukan</span>
              </div>
            )}

            <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
              <Smartphone className="w-3.5 h-3.5 text-blue-600" />
              <span>Arahkan kamera smartphone untuk scan</span>
            </div>
            {directPengerjaanUrl !== '#' && (
              <div className="mt-1.5 flex items-center justify-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded-full border border-emerald-200/60 inline-flex">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>Barcode sinkron otomatis dengan link terbaru</span>
              </div>
            )}
          </div>

          {/* Direct URL preview */}
          {directPengerjaanUrl !== '#' && (
            <div className="w-full mt-4 p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 text-left">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">
                Target URL
              </span>
              <p className="text-xs font-mono text-slate-700 truncate select-all">
                {directPengerjaanUrl}
              </p>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={handleCopyLink}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors shadow-2xs"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Tersalin!' : 'Salin Link'}</span>
          </button>

          {qrImageUrl && (
            <button
              onClick={handleDownload}
              className="inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors shadow-2xs"
              title="Unduh file gambar QR Code"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>Unduh Barcode</span>
            </button>
          )}

          <a
            href={directPengerjaanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center justify-center gap-1.5 py-2 px-4 text-xs font-semibold text-white rounded-xl transition-colors shadow-sm ${
              directPengerjaanUrl === '#'
                ? 'bg-slate-300 pointer-events-none'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <span>Buka Soal</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
