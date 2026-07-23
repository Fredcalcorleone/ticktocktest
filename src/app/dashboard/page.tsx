'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from '@/utils/supabase';
import { BrainCircuit, GraduationCap, CheckCircle2, BarChart3, Clock, ArrowRight, FileText } from 'lucide-react';
import Link from 'next/link';

interface ProgressRow {
  id: string;
  module_name: string;
  score: number;
  status: string;
  pdf_url?: string;
  updated_at: string;
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
        .select('*')
        .eq('username', userKey)
        .order('updated_at', { ascending: false });

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
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors duration-200 antialiased pb-24 md:pb-8">
      <main className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
        
        {/* CORE TELEMETRY STAT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          
          {/* Welcome Card */}
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
                  <BrainCircuit className="w-4 h-4" /> Generate Quiz from your notes<ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Performance Widget */}
          <Card className="border-slate-200/80 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900 p-5 flex flex-col justify-between">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-50 dark:border-slate-800">
              <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
              <span className="text-[15px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Performance</span>
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

        {/* LOG DATA TABLE VIEW (Visible on both Desktop & App/Mobile) */}
        <Card className="border-slate-200/80 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
          <CardHeader className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Evaluation Records
              </CardTitle>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center text-xs text-slate-400 font-mono dark:text-slate-500">Syncing system evaluation logs...</div>
            ) : progressData.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No telemetry log lines detected.</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-xs mx-auto">Upload your evaluation notes packet via the Quiz Engine to record your marks here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-[10px] font-mono font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                      <th className="py-3 px-4 md:px-6">Module / Topic Identifier</th>
                      <th className="py-3 px-4 md:px-6">Acquired Grade</th>
                      <th className="py-3 px-4 md:px-6">Execution Mark Status</th>
                      <th className="py-3 px-4 md:px-6 text-center">Attachment</th>
                      <th className="py-3 px-4 md:px-6 text-right">Committed Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
                    {progressData.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="py-3.5 px-4 md:px-6 font-bold text-slate-900 dark:text-slate-100">{row.module_name}</td>
                        <td className="py-3.5 px-4 md:px-6">
                          <span className={`font-mono font-bold ${row.score >= 70 ? 'text-emerald-600' : 'text-indigo-600 dark:text-indigo-400'}`}>
                            {row.score}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4 md:px-6">
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3 h-3" /> {row.status || 'completed'}
                          </span>
                        </td>
                        
                        <td className="py-3.5 px-4 md:px-6 text-center">
                          {row.pdf_url ? (
                            <a 
                              href={row.pdf_url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="inline-flex items-center gap-1 text-[10px] font-bold font-mono text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-lg px-2 py-0.5 transition-all cursor-pointer"
                              title="Open source study material PDF"
                            >
                              <FileText className="w-3 h-3 text-slate-400 dark:text-slate-500" /> PDF
                            </a>
                          ) : (
                            <span className="text-[10px] text-slate-300 dark:text-slate-600 font-mono italic select-none">—</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 md:px-6 text-right text-slate-400 dark:text-slate-500 font-mono text-[11px]">
                          <span className="inline-flex items-center gap-1 justify-end">
                            <Clock className="w-3 h-3" /> {new Date(row.updated_at).toLocaleDateString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-8 font-medium tracking-wide relative text-center">
          © 2026 MindSprint. Developed by Irfan Khalis. All rights reserved. Powered by the Gemini AI Engine to deliver real-time, intelligent assessment generation.
        </p>

      </main>
    </div>
  );
}