/* © 2026 Bang Ajiib. All rights reserved. */

export const OWNER_NAME = "Bang Ajiib";
export const START_YEAR = 2026;

export function getCopyrightText(): string {
  const currentYear = new Date().getFullYear();
  if (currentYear > START_YEAR) {
    return `© ${START_YEAR}–${currentYear} ${OWNER_NAME}. Hak cipta dilindungi undang-undang.`;
  }
  return `© ${START_YEAR} ${OWNER_NAME}. Hak cipta dilindungi undang-undang.`;
}

export const SUBTITLE_TEXT = "Sistem Kumpulan Link Penting Tc Surabaya";
