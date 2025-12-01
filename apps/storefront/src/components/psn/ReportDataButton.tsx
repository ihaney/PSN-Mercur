'use client'

import React, { useState } from 'react';
import { Flag } from 'lucide-react';
import DataReportModal from './DataReportModal';

interface ReportDataButtonProps {
  pageType: 'product' | 'supplier' | 'search' | 'directory' | 'category' | 'country' | 'source';
  pageId?: string;
  contextData?: {
    productName?: string;
    supplierName?: string;
    categoryName?: string;
    countryName?: string;
    sourceName?: string;
    url?: string;
  };
  className?: string;
}

export default function ReportDataButton({ pageType, pageId, contextData, className }: ReportDataButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={className || "flex items-center gap-2 px-3 py-2 rounded-lg dark:bg-gray-700/50 light:bg-white/80 text-gray-400 hover:text-[#F4A024] dark:hover:bg-gray-600/50 light:hover:bg-gray-100 transition-colors border dark:border-gray-700 light:border-gray-300"}
        title="Report a data issue"
        aria-label="Report a data issue"
      >
        <Flag className="w-5 h-5" />
        <span>Report</span>
      </button>

      <DataReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        pageType={pageType}
        pageId={pageId}
        contextData={contextData}
      />
    </>
  );
}
