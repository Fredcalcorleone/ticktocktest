'use client';

import React, { createContext, useContext, useState } from 'react';

interface PdfBarState {
  isVisible: boolean;
  pageNumber?: number;
  fileUrl?: string | null;
  referenceQuote?: string;
  label?: string;
}

interface PdfBarContextType {
  pdfData: PdfBarState;
  showPdfBar: (data: Omit<PdfBarState, 'isVisible'>) => void;
  hidePdfBar: () => void;
}

const PdfBarContext = createContext<PdfBarContextType | undefined>(undefined);

export function PdfBarProvider({ children }: { children: React.ReactNode }) {
  const [pdfData, setPdfData] = useState<PdfBarState>({
    isVisible: false, // Reset to false so it stays hidden outside active quiz references
    label: 'Source Context',
  });

  const showPdfBar = (data: Omit<PdfBarState, 'isVisible'>) => {
    setPdfData({ ...data, isVisible: true });
  };

  const hidePdfBar = () => {
    setPdfData((prev) => ({ ...prev, isVisible: false }));
  };

  return (
    <PdfBarContext.Provider value={{ pdfData, showPdfBar, hidePdfBar }}>
      {children}
    </PdfBarContext.Provider>
  );
}

export function usePdfBar() {
  const context = useContext(PdfBarContext);
  if (!context) {
    throw new Error('usePdfBar must be used within a PdfBarProvider');
  }
  return context;
}