/* © 2026 Bang Ajiib. All rights reserved. */

import React from 'react';
import { getCopyrightText, SUBTITLE_TEXT } from '../lib/branding';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-4 px-4 mt-auto border-t border-slate-200/70 bg-white/70 backdrop-blur-xs text-center text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-1">
        <p className="font-medium text-slate-700 tracking-tight">
          {getCopyrightText()}
        </p>
        <p className="text-[11px] text-slate-400">
          {SUBTITLE_TEXT}
        </p>
      </div>
    </footer>
  );
};
