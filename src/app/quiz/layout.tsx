import React, { Suspense } from 'react';

export const metadata = {
  title: 'MindSprint Assessment Terminal',
  description: 'Dynamic live quiz engine environment runtime',
};

export default function QuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Wraps the client-side useSearchParams tree cleanly to prevent build runtime crashes
    <Suspense 
      fallback={
        <div className="min-h-[85vh] flex flex-col items-center justify-center bg-slate-50/40">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mb-3" />
          <p className="text-xs font-mono font-semibold text-slate-400 tracking-wide">
            Allocating runtime assessment parameters...
          </p>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}