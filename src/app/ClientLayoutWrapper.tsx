'use client';

import React from 'react';
import { PdfBarProvider, usePdfBar } from '@/app/context/PdfBarContext';
import { MobilePdfBar } from '@/components/ui/MobilePdfBar';

// Helper component to extract data from context and render the floating bar
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
      {children}
      <GlobalMobilePdfBar />
    </PdfBarProvider>
  );
}