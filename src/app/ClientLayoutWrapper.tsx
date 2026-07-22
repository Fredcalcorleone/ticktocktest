'use client';

import React from 'react';
import { PdfBarProvider, usePdfBar } from '@/app/context/PdfBarContext';
import { MobilePdfBar } from '@/components/ui/MobilePdfBar';

function GlobalMobilePdfBar() {
  const { pdfData } = usePdfBar();

  return (
    <MobilePdfBar
      isVisible={pdfData.isVisible}
      pageNumber={pdfData.pageNumber}
      fileUrl={pdfData.fileUrl}
      referenceQuote={pdfData.referenceQuote}
      label={pdfData.label}
    />
  );
}

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <PdfBarProvider>
      {/* 1. Header / Top Nav */}
      <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3.5 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="font-black text-indigo-600 dark:text-indigo-400 tracking-wider text-lg uppercase font-mono">
            MindSprint
          </span>
        </div>
      </header>

      {/* 2. Main Page Content */}
      <div className="flex-1">
        {children}
      </div>

      {/* 3. Global Floating PDF Bar */}
      <GlobalMobilePdfBar />
    </PdfBarProvider>
  );
}