'use client';

import React, { useState } from 'react';
import { ExternalLink, BookOpen, X, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobilePdfBarProps {
  isVisible: boolean;
  pageNumber?: number;
  fileUrl?: string | null;
  referenceQuote?: string;
  label?: string;
}

export function MobilePdfBar({
  isVisible,
  pageNumber,
  fileUrl,
  referenceQuote,
  label = "Source Context"
}: MobilePdfBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Do not render if the parent component sets isVisible to false
  if (!isVisible) return null;

  // Build the target link to open the PDF page
  let targetHref = '#';
  if (fileUrl && pageNumber) {
    const cleanQuote = (referenceQuote || '').replace(/[^\w\s]/g, '').trim();
    const words = cleanQuote.split(/\s+/);
    const searchQuery = words.slice(0, Math.min(words.length, 4)).join(' ');
    targetHref = `${fileUrl}#page=${pageNumber}&search="${encodeURIComponent(searchQuery)}"`;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[9999] md:hidden">
      {/* 1. Expanded Sheet View */}
      {isOpen ? (
        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-bold uppercase tracking-wide">
              <BookOpen className="w-4 h-4" />
              <span>{label} {pageNumber ? `(Page ${pageNumber})` : ''}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300 italic leading-relaxed">
            "{referenceQuote || 'Context reference verification details not extracted.'}"
          </p>

          {fileUrl && pageNumber && (
            <a href={targetHref} target="_blank" rel="noopener noreferrer" className="block pt-1">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs h-9 rounded-xl flex items-center justify-center gap-1.5 shadow-sm">
                Open PDF Page {pageNumber} <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </a>
          )}
        </div>
      ) : (
        /* 2. Floating Action Pill/Button */
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700/60 flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold tracking-tight">
              View Source Quote {pageNumber ? `• Page ${pageNumber}` : ''}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
            <span>Open</span>
            <ChevronUp className="w-4 h-4 text-indigo-400" />
          </div>
        </button>
      )}
    </div>
  );
}