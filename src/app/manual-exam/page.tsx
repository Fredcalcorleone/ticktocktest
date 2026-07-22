'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/utils/supabase';
import { CheckCircle2, Clock, FileText, History } from 'lucide-react';

interface ProgressRow {
  id: string;
  module_name: string;
  score: number;
  status: string;
  pdf_url?: string;
  updated_at: string;
}

export default function HistoryPage() {
  const [progressData, setProgressData] = useState<ProgressRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const cachedUser = localStorage.getItem('mindsprint_user');
    if (!cachedUser) {
      window.location.href = '/';
      return;
    }
    fetchHistoryLogs(cachedUser);
  }, []);

  const fetchHistoryLogs = async (userKey: string) => {
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
      console.error("Error loading evaluation history:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-6 transition-colors duration-200">
      <main className="max-w-6xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="flex items-center gap-3 pb-2 border-b border-slate-200/80 dark:border-slate-800">
          <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Assessment History</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Review all your previous quiz evaluations and downloaded study material attachments.</p>
          </div>
        </div>

        {/* LOG DATA TABLE VIEW */}
        <Card className="border-slate-200/80 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
          <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Evaluation Records
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center text-xs text-slate-400 font-mono dark:text-slate-500">Syncing system evaluation logs...</div>
            ) : progressData.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No telemetry log lines detected.</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-xs mx-auto">Complete your first quiz session to log results here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-[10px] font-mono font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                      <th className="py-3 px-6">Module / Topic Identifier</th>
                      <th className="py-3 px-6">Acquired Grade</th>
                      <th className="py-3 px-6">Execution Mark Status</th>
                      <th className="py-3 px-6 text-center">Attachment</th>
                      <th className="py-3 px-6 text-right">Committed Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
                    {progressData.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="py-3.5 px-6 font-bold text-slate-900 dark:text-slate-100">{row.module_name}</td>
                        <td className="py-3.5 px-6">
                          <span className={`font-mono font-bold ${row.score >= 70 ? 'text-emerald-600' : 'text-indigo-600 dark:text-indigo-400'}`}>
                            {row.score}%
                          </span>
                        </td>
                        <td className="py-3.5 px-6">
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3 h-3" /> {row.status || 'completed'}
                          </span>
                        </td>
                        
                        <td className="py-3.5 px-6 text-center">
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

                        <td className="py-3.5 px-6 text-right text-slate-400 dark:text-slate-500 font-mono text-[11px]">
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

      </main>
    </div>
  );
}