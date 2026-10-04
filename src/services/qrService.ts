/* © 2026 Bang Ajiib. All rights reserved. */

import QRCode from 'qrcode';
import { formatUrl, getDirectDriveUrl } from './sheetsService';

/**
 * Returns dynamic online QR generator URL based on link
 * Uses QRServer / QuickChart as fast image sources
 */
export function getGeneratedQrUrl(urlToEncode: string, size = 500): string {
  const clean = formatUrl(urlToEncode);
  if (clean === '#') return '';
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(clean)}`;
}

/**
 * Generates an offline, high-resolution PNG data URL using client-side QRCode engine
 */
export async function generateQrDataUrl(urlToEncode: string, size = 500): Promise<string> {
  const clean = formatUrl(urlToEncode);
  if (clean === '#') return '';
  try {
    return await QRCode.toDataURL(clean, {
      width: size,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
  } catch (err) {
    console.warn('QRCode.toDataURL error, falling back to online QR API:', err);
    return getGeneratedQrUrl(clean, size);
  }
}

/**
 * Resolves the active barcode image URL for an item.
 * If link_pengerjaan is provided, it ALWAYS generates/resolves the QR code
 * corresponding to that latest link so that edits immediately reflect in the barcode.
 */
export function getItemQrCodeUrl(item: { link_pengerjaan?: string; link_qr?: string }, size = 400): string {
  const cleanPengerjaan = formatUrl(item.link_pengerjaan);

  // If a valid pengerjaan link exists, ALWAYS prioritize generating the QR code for that link!
  if (cleanPengerjaan !== '#') {
    if (item.link_qr && (item.link_qr.startsWith('data:image/') || item.link_qr.includes('qrserver.com') || item.link_qr.includes('quickchart.io'))) {
      return item.link_qr;
    }
    return getGeneratedQrUrl(cleanPengerjaan, size);
  }

  // Fallback: If no link_pengerjaan, but item has a link_qr (e.g. legacy drive link)
  if (item.link_qr && item.link_qr.trim() !== '') {
    return getDirectDriveUrl(item.link_qr);
  }

  return '';
}
