'use client'

import { Download } from 'lucide-react';
import { downloadCSVTemplate } from '@/lib/helpers/csvTemplate';

export function DownloadTemplateButton() {
  return (
    <button
      onClick={downloadCSVTemplate}
      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <Download className="w-4 h-4" />
      <span>Download CSV Template</span>
    </button>
  );
}
