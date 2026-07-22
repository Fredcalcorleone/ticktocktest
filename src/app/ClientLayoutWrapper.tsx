'use client';

import React from 'react';
import { PdfBarProvider, usePdfBar } from '@/app/context/PdfBarContext';
import { MobilePdfBar } from '@/components/ui/MobilePdfBar';
import { BottomNav } from '@/components/ui/BottomNav';
import { TopNav } from '@/components/ui/TopNav';

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
      {/* 1. Global Desktop Top Nav (Hidden on Mobile) */}
      <TopNav />

      {/* 2. Main Page Content Wrapper */}
      <div className="min-h-screen pb-20 md:pb-0">
        {children}
      </div>

      {/* 3. Floating Bottom Nav (Mobile Only) */}
      <BottomNav />

      {/* 4. Floating PDF Reference Popup (Mobile Only) */}
      <GlobalMobilePdfBar />
    </PdfBarProvider>
  );
}