'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface QuizAttempt {
  id: string | number;
  chapter_id: string;
  score_percentage: number;
  total_questions: number;
  correct_answers: number;
  created_at: string;
}

export default function StudentProgressHistory() {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string>('');

  useEffect(() => {
    const activeUser = localStorage.getItem('mindsprint_user') || 'anonymous';
    setCurrentUser(activeUser);

    async function fetchIsolatedLogs() {
      try {
        const { data, error } = await supabase
          .from('quiz_attempts')
          .select('*')
          .eq('student_username', activeUser)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setAttempts(data || []);
      } catch (err: any) {
        console.error('Error loading isolated user logs:', err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchIsolatedLogs();
  }, []);

  if (loading) {
    return <p className="text-xs text-muted-foreground font-mono animate-pulse">Filtering analytical logs...</p>;
  }

  return (
    <Card className="mt-8 border-slate-200/60 shadow-sm rounded-2xl overflow-hidden bg-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-slate-100 pb-4 bg-slate-50/50">
        <div>
          <CardTitle className="text-base font-bold tracking-tight text-slate-900">Your Activity Logs</CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-0.5">
            Isolated workspace data for <span className="font-mono text-indigo-600 bg-indigo-50/80 px-1.5 py-0.5 rounded-md font-semibold">@{currentUser}</span>
          </CardDescription>
        </div>
        <Badge variant="secondary" className="rounded-xl px-2.5 py-1 font-bold text-slate-700 bg-slate-100 border-none">
          {attempts.length} {attempts.length === 1 ? 'Attempt' : 'Attempts'}
        </Badge>
      </CardHeader>
      
      <CardContent className="p-0">
        {attempts.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-xs font-medium">
            No previous chapter assessment attempts stored on this profile yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {attempts.map((attempt) => (
              <div key={attempt.id} className="flex items-center justify-between p-4 hover:bg-slate-50/40 transition-colors">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900">Chapter {attempt.chapter_id}</p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {attempt.correct_answers} / {attempt.total_questions} correct matches
                  </p>
                </div>
                <div>
                  <Badge 
                    className={`font-mono font-bold text-xs rounded-lg px-2.5 py-1 ${
                      attempt.score_percentage >= 70 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50' 
                        : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-50'
                    }`}
                  >
                    {attempt.score_percentage}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}