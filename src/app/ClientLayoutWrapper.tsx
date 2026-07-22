'use client';

import React from 'react';
import { PdfBarProvider, usePdfBar } from '@/app/context/PdfBarContext';
import { MobilePdfBar } from '@/components/ui/MobilePdfBar';
import { BottomNav } from '@/components/ui/BottomNav';

function GlobalMobilePdfBar() {
  const { pdfData } = usePdfBar();

  return (
    /* Hide on desktop (md:hidden) so it only appears on mobile screens */
    <div className="md:hidden">
      <MobilePdfBar
        isVisible={pdfData.isVisible}
        pageNumber={pdfData.pageNumber}
        fileUrl={pdfData.fileUrl}
        referenceQuote={pdfData.referenceQuote}
        label={pdfData.label}
      />
    </div>
  );
}

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <PdfBarProvider>
      {/* Container allowing full layout rendering from individual page templates */}
      <div className="min-h-screen pb-20 md:pb-0">
        {children}
      </div>

      {/* Floating Bottom Nav (Mobile Only) */}
      <BottomNav />

      {/* Floating PDF Reference Popup (Mobile Only) */}
      <GlobalMobilePdfBar />
    </PdfBarProvider>
  );
}