'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react'; // ◄ Imported Suspense
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { trackLatestProgress } from '@/utils/progress';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Play, Square, RotateCcw, ArrowLeft, Timer } from 'lucide-react';

// 🌟 1. INNER CONTENT COMPONENT (Handles useSearchParams)
function ManualExamContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pdfUrl = searchParams.get('pdfUrl') || '';
  const paperName = searchParams.get('paperName') || 'Standard Past Paper Document';

  const [scorePercentage, setScorePercentage] = useState('');
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState('');

  // ⏱️ TIMER HOOK CONTROLS
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setCurrentUser(localStorage.getItem('mindsprint_user') || 'anonymous');
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (!isActive && timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  const formatTime = () => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return [
      hrs.toString().padStart(2, '0'),
      mins.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };

  const handleResetTimer = () => {
    setIsActive(false);
    setSeconds(0);
  };

  const handleLogManualScore = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericScore = Number(scorePercentage);

    if (isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
      alert("Please enter a valid evaluation score between 0% and 100%.");
      return;
    }

    try {
      setSaving(true);
      setIsActive(false);

      const { error } = await supabase.from('quiz_attempts').insert({
        chapter_id: 'MANUAL-PAST-PAPER',
        student_username: currentUser,
        total_questions: 100,
        correct_answers: numericScore,
        score_percentage: numericScore,
      });

      if (error) throw error;

      await trackLatestProgress(`Manual Review: ${paperName}`, numericScore);
      alert("Self-graded score safely archived into core telemetry matrices!");
      router.back();
    } catch (err: any) {
      console.error('Error tracking manual log score row:', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-[85vh] bg-slate-50/40 p-6 antialiased">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* LEFT COMPONENT COLUMN: THE COMPONENT PDF VIEWER CANVAS */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Button onClick={() => router.back()} variant="ghost" className="rounded-xl h-8 w-8 p-0 border border-slate-200 bg-white">
                <ArrowLeft className="h-3.5 w-3.5 text-slate-600" />
              </Button>
              <div className="space-y-0.5">
                <h1 className="text-sm font-black text-slate-900 tracking-tight leading-none">{paperName}</h1>
                <p className="text-[10px] text-slate-400">Exam session workspace window engine simulation active.</p>
              </div>
            </div>
            <Badge variant="outline" className="text-[9px] bg-white text-slate-500 font-mono rounded-md py-0.5 px-2">
              PDF View Mirror
            </Badge>
          </div>

          <Card className="border-slate-200/70 shadow-sm bg-white rounded-2xl overflow-hidden h-[73vh] flex items-center justify-center">
            {pdfUrl ? (
              <iframe 
                src={`${pdfUrl}#toolbar=0`} 
                className="w-full h-full border-0"
                title="Past Paper Preview Workspace"
              />
            ) : (
              <div className="text-center p-6 space-y-2">
                <span className="text-xl">⚠️</span>
                <p className="text-xs font-bold text-slate-800">No Document Payload Attached</p>
                <p className="text-[11px] text-slate-400 max-w-xs">This sample link lacks a valid storage-backed static PDF url pointer string.</p>
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT COLUMN: GRADING & EXAM UTILITY SIDEBAR */}
        <div className="space-y-4 lg:mt-1">
          <h2 className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">⏱️ Session Tracker</h2>
          <Card className="border-slate-200/70 shadow-sm bg-white rounded-2xl p-5 text-center space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Elapsed Session Time</span>
              <div className="text-3xl font-black font-mono tracking-tight text-slate-800 flex items-center justify-center gap-2 bg-slate-50/80 border border-slate-100 rounded-xl py-2">
                <Timer className={`w-5 h-5 ${isActive ? 'text-indigo-600 animate-spin [animation-duration:3s]' : 'text-slate-400'}`} />
                {formatTime()}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`font-bold text-[11px] h-9 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-none ${
                  isActive 
                    ? 'bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {isActive ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current" /> Stop Clock
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" /> Start Clock
                  </>
                )}
              </Button>

              <Button
                type="button"
                onClick={handleResetTimer}
                variant="outline"
                className="font-bold text-[11px] h-9 rounded-xl flex items-center justify-center gap-1.5 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-none"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Time
              </Button>
            </div>
          </Card>

          <h2 className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">✍️ Grading Terminal</h2>
          <Card className="border-slate-200/70 shadow-md bg-white rounded-2xl p-5">
            <form onSubmit={handleLogManualScore} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold font-mono tracking-wide text-slate-500 uppercase block">
                  Calibrated Performance Score
                </label>
                <div className="relative flex items-center">
                  <Input 
                    type="number"
                    min="0"
                    max="100"
                    placeholder="e.g., 85"
                    value={scorePercentage}
                    onChange={(e) => setScorePercentage(e.target.value)}
                    className="rounded-xl border-slate-200 text-xs font-semibold h-10 pr-8 bg-white focus-visible:ring-emerald-500"
                    required
                    disabled={saving}
                  />
                  <span className="absolute right-3 text-xs font-mono font-bold text-slate-400">%</span>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-10 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
                disabled={saving || !scorePercentage}
              >
                {saving ? "Archiving Record..." : "Log Core Grade Metrics ✓"}
              </Button>
            </form>
          </Card>
        </div>

      </div>
    </main>
  );
}

// 🌟 2. DEFAULT EXPORT PROTECTED BY A SUSPENSE BOUNDARY
export default function ManualExamPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[85vh] flex items-center justify-center bg-slate-50/40">
        <p className="text-xs font-bold font-mono text-slate-400 animate-pulse">
          Loading workspace engines...
        </p>
      </div>
    }>
      <ManualExamContent />
    </Suspense>
  );
}