/* © 2026 Bang Ajiib. All rights reserved. */

import { OWNER_NAME } from './branding';

export interface VerificationEmailParams {
  to: string;
  name: string;
  verificationUrl: string;
}

export function getVerificationEmailHtml(params: VerificationEmailParams): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Verifikasi Email Peserta Training</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0;">
    <h2 style="color: #0f172a; margin-top: 0;">Verifikasi Email Peserta</h2>
    <p style="color: #334155; font-size: 15px; line-height: 1.6;">
      Halo <strong>${params.name}</strong>,
    </p>
    <p style="color: #334155; font-size: 15px; line-height: 1.6;">
      Terima kasih telah mendaftar pada program Training Center Surabaya. Silakan klik tombol di bawah ini untuk memverifikasi alamat email Anda:
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${params.verificationUrl}" style="background-color: #0057B8; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; display: inline-block;">
        Verifikasi Email Saya
      </a>
    </div>
    <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
      Jika tombol di atas tidak dapat diklik, salin dan tempel tautan berikut ke peramban Anda:<br>
      <a href="${params.verificationUrl}" style="color: #0057B8; word-break: break-all;">${params.verificationUrl}</a>
    </p>
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
    <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">
      Sistem verifikasi ini dikelola oleh ${OWNER_NAME}.
    </p>
  </div>
</body>
</html>
  `.trim();
}

export function getVerificationEmailText(params: VerificationEmailParams): string {
  return `
Halo ${params.name},

Terima kasih telah mendaftar pada program Training Center Surabaya.
Silakan buka tautan berikut untuk memverifikasi alamat email Anda:
${params.verificationUrl}

---
Sistem verifikasi ini dikelola oleh ${OWNER_NAME}.
  `.trim();
}
