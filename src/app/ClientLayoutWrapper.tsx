'use client';

import React from 'react';
import { PdfBarProvider, usePdfBar } from '@/app/context/PdfBarContext';
import { MobilePdfBar } from '@/components/ui/MobilePdfBar';
import { BottomNav } from '@/components/ui/BottomNav';

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
      <div className="min-h-screen pb-24">
        {children}
      </div>

      {/* Global Floating Bottom Navigation (Iconly Style) */}
      <BottomNav />

      {/* Quiz PDF Reference Bar (Only pops up during quizzes when active) */}
      <GlobalMobilePdfBar />
    </PdfBarProvider>
  );
}