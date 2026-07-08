'use client';

import dynamic from 'next/dynamic';

// 🚀 Dynamically load your core client component with server side rendering explicitly disabled.
const QuizEngineClient = dynamic(
  () => import('./QuizEngineClient').then((mod) => mod.QuizEngineClient),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-[85vh] flex flex-col items-center justify-center space-y-2 bg-slate-50/40">
        <p className="text-xs font-bold font-mono text-slate-400 animate-pulse">
          Initializing AI Quiz Matrix Canvas...
        </p>
      </div>
    )
  }
);

export default function AIQuizEngine() {
  return <QuizEngineClient />;
}