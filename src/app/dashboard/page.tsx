'use client';

import React, { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from '@/utils/supabase';
import { BrainCircuit, GraduationCap, BarChart3, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ProgressRow {
  score: number;
}

export default function StudentDashboard() {
  const [username, setUsername] = useState<string>('');
  const [progressData, setProgressData] = useState<ProgressRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const cachedUser = localStorage.getItem('mindsprint_user');
    
    if (!cachedUser) {
      window.location.href = '/';
      return;
    }
    
    setUsername(cachedUser);
    fetchTelemetryData(cachedUser);

    // Sync Dark Mode state baseline
    const isDark = localStorage.getItem('theme') === 'dark';
    if (isDark) document.documentElement.classList.add('dark');
  }, []);

  const fetchTelemetryData = async (userKey: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_progress')
        .select('score')
        .eq('username', userKey);

      if (error) throw error;
      if (data) setProgressData(data);
    } catch (err) {
      console.error("Error communicating with user_progress telemetry:", err);
    } finally {
      setLoading(false);
    }
  };

  const completedSessionsCount = progressData.length;
  const averageAssessmentScore = completedSessionsCount > 0 
    ? Math.round(progressData.reduce((acc, row) => acc + row.score, 0) / completedSessionsCount)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors duration-200 antialiased">
      <main className="p-6 max-w-6xl mx-auto space-y-6">
        
        {/* CORE TELEMETRY STAT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          
          {/* Welcome & CTA Card */}
          <div className="md:col-span-2 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 flex flex-col justify-between shadow-lg shadow-indigo-950/10 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4 pointer-events-none">
              <GraduationCap className="w-64 h-64" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-black tracking-tight">Welcome back, {username}!</h1>
              <p className="text-xs text-slate-300/90 max-w-md leading-relaxed">
                Drop your syllabus reading notes directly into the processing engine below to build instantly customized multiple choice self-evaluation assessments.
              </p>
            </div>
            
            <div className="pt-6">
              <Link href="/quiz">
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs h-10 rounded-xl shadow-md shadow-indigo-900/30 gap-1.5 transition-all cursor-pointer">
                  <BrainCircuit className="w-4 h-4" /> Open Dynamic AI Quiz Engine <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Stat Summary Widget */}
          <Card className="border-slate-200/80 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900 p-5 flex flex-col justify-between">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-50 dark:border-slate-800">
              <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
              <span className="text-[15px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Performance Telemetry</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 my-auto py-2">
              <div className="space-y-0.5">
                <p className="text-[15px] font-medium font-mono text-slate-400 dark:text-slate-500 uppercase">Tests Logged</p>
                <p className="text-xl font-black text-slate-800 dark:text-slate-100">{loading ? '...' : completedSessionsCount}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[15px] font-medium font-mono text-slate-400 dark:text-slate-500 uppercase">Average Rating</p>
                <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">{loading ? '...' : `${averageAssessmentScore}%`}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-8 font-medium tracking-wide relative text-center">
          © 2026 MindSprint. Developed by Irfan Khalis. All rights reserved. Powered by the Gemini AI Engine to deliver real-time, intelligent assessment generation.
        </p>

      </main>
    </div>
  );
}