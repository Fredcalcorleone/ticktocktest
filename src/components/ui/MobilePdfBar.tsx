'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';

interface MobilePdfBarProps {
  /** The target page number inside the PDF */
  pageNumber?: number;
  /** Direct public URL to the hosted PDF */
  fileUrl?: string | null;
  /** Quote or string snippet to search/highlight on the page */
  referenceQuote?: string;
  /** Optional custom title text for the label (Defaults to 'Context Reference') */
  label?: string;
  /** Optional condition trigger to control when the bar renders */
  isVisible?: boolean;
}

export function MobilePdfBar({
  pageNumber,
  fileUrl,
  referenceQuote = '',
  label = 'Context Reference',
  isVisible = true,
}: MobilePdfBarProps) {
  // Guard clause: Do not render if explicitly hidden, or if required PDF specs are missing
  if (!isVisible || !fileUrl || !pageNumber) return null;

  // Clean the reference quote to build a short, high-reliability search query
  const words = referenceQuote
    .replace(/["'“”‘’.,/#!$%^&*;:{}=\-_`~()]/g, '')
    .trim()
    .split(/\s+/);

  const searchQuery = words.slice(0, Math.min(words.length, 4)).join(' ');
  const targetHref = `${fileUrl}#page=${pageNumber}&search="${encodeURIComponent(searchQuery)}"`;

  return (
    <div className="fixed bottom-4 left-0 right-0 px-4 md:hidden z-50 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/50 shadow-2xl rounded-2xl p-3 flex items-center justify-between">
        
        {/* Left Side: Metadata Labels */}
        <div className="flex flex-col text-left pl-1">
          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">
            {label}
          </span>
          <span className="text-xs font-bold text-white flex items-center gap-1">
            📄 Sheet Page {pageNumber}
          </span>
        </div>

        {/* Right Side: Action Button */}
        <a href={targetHref} target="_blank" rel="noopener noreferrer">
          <button
            type="button"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg transition-all duration-200 ease-out flex items-center gap-1.5 cursor-pointer"
          >
            <span>Jump to Page</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </button>
        </a>

      </div>
    </div>
  );
}