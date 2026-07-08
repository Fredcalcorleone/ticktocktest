'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Chapter {
  id: string;
  title: string;
  description: string;
}

interface PastPaper {
  id: string;
  name: string;
  pdf_url: string;
}

interface SubjectDetails {
  id: string;
  name: string;
  code: string;
  chapters: Chapter[];
  past_papers: PastPaper[];
}

interface AttemptRecord {
  chapter_id: string;
  score_percentage: number;
}

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default function CourseDetailPage({ params }: PageProps) {
  const [subject, setSubject] = useState<SubjectDetails | null>(null);
  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCourseAndAnalyticsData() {
      try {
        setLoading(true);
        
        const resolvedParams = params instanceof Promise ? await params : params;
        const subjectId = resolvedParams?.id;

        if (!subjectId) {
          setFetchError("No valid route token detected.");
          setLoading(false);
          return;
        }

        let baseSubject: any = null;

        if (!isNaN(Number(subjectId))) {
          const targetIndex = Number(subjectId) - 1;
          const { data: allSubjects, error: err } = await supabase
            .from('subjects')
            .select('id, name')
            .order('created_at', { ascending: true });

          if (err) throw err;
          if (allSubjects && allSubjects[targetIndex]) {
            baseSubject = allSubjects[targetIndex];
          }
        } else {
          const { data, error: err } = await supabase
            .from('subjects')
            .select('id, name')
            .eq('id', subjectId)
            .maybeSingle();

          if (err) throw err;
          baseSubject = data;
        }

        if (!baseSubject) {
          setFetchError(`Could not find a course matching argument parameter: "${subjectId}"`);
          setLoading(false);
          return;
        }

        const { data: chaptersData, error: chaptersErr } = await supabase
          .from('chapters')
          .select('*')
          .eq('subject_id', baseSubject.id);

        if (chaptersErr) throw chaptersErr;

        const transformedChapters: Chapter[] = (chaptersData || []).map((ch: any) => ({
          id: ch.id,
          title: ch.title || ch.name || ch.chapter_name || 'Untitled Chapter Module',
          description: ch.description || 'No module overview provided.'
        }));

        const { data: papersData, error: papersErr } = await supabase
          .from('past_papers')
          .select('id, name, pdf_url')
          .eq('subject_id', baseSubject.id);

        if (papersErr) throw papersErr;

        setSubject({
          id: baseSubject.id,
          name: baseSubject.name,
          code: baseSubject.code || 'CORE-SPEC', 
          chapters: transformedChapters,
          past_papers: papersData || []
        });

        if (transformedChapters.length > 0) {
          const chapterIds = transformedChapters.map((c) => c.id);
          const activeUser = localStorage.getItem('mindsprint_user') || 'anonymous';

          const { data: attemptsData, error: attemptsErr } = await supabase
            .from('quiz_attempts')
            .select('chapter_id, score_percentage')
            .in('chapter_id', chapterIds)
            .eq('student_username', activeUser);

          if (attemptsErr) throw attemptsErr;
          setAttempts(attemptsData || []);
        }

      } catch (err: any) {
        console.error('Error running workspace sync layout:', err.message);
        setFetchError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadCourseAndAnalyticsData();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <p className="text-xs font-mono font-semibold text-slate-400 animate-pulse tracking-wide">Syncing dynamic student metrics...</p>
      </div>
    );
  }

  if (fetchError || !subject) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-6 text-center">
        <Card className="max-w-sm border-slate-200/80 shadow-sm bg-white rounded-2xl p-4">
          <CardHeader className="pb-2">
            <span className="text-xl mx-auto mb-1">⚠️</span>
            <CardTitle className="text-sm font-bold text-slate-900">Workspace Verification Error</CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border text-left break-all leading-relaxed">
            {fetchError}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50/40 text-slate-900 pb-16 antialiased">
      
      {/* HEADER HERO BANNER */}
      <div className="bg-white border-b border-slate-200/80 py-10 px-6 shadow-sm">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight sm:text-3xl">{subject.name}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="font-mono font-bold uppercase text-[10px] bg-slate-50 border-slate-200 text-slate-500 px-2 py-0.5 rounded-md">
                Code: {subject.code}
              </Badge>
            </div>
          </div>
          <Card className="border-indigo-100 bg-indigo-50/40 rounded-2xl shadow-none px-4 py-3 min-w-[140px]">
            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block">Completed Quizzes</span>
            <span className="text-xl font-black text-indigo-950 font-mono tracking-tight">{attempts.length} Total Logs</span>
          </Card>
        </div>
      </div>

      {/* CORE WORKSPACE GRID */}
      <div className="max-w-5xl mx-auto px-6 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COMPONENT: CORE LEARNING MODULES STACK */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xs font-bold font-mono tracking-wider text-slate-400 uppercase mb-1 flex items-center gap-1.5">
            📚 Core Learning Modules
          </h2>

          {subject.chapters?.length === 0 ? (
            <p className="text-xs text-slate-400 italic font-medium p-4 bg-white rounded-xl border border-dashed">No structured modules mapped out yet.</p>
          ) : (
            subject.chapters?.map((chapter) => {
              const chapterAttempts = attempts.filter((a) => a.chapter_id === chapter.id);
              const totalAttemptsCount = chapterAttempts.length;
              const highestRecordedScore = totalAttemptsCount > 0 
                ? Math.max(...chapterAttempts.map((a) => a.score_percentage)) 
                : null;

              return (
                <Card key={chapter.id} className="bg-white border-slate-200/70 rounded-2xl shadow-sm hover:border-slate-300 transition-all overflow-hidden flex flex-col justify-between">
                  <CardHeader className="flex flex-row items-start justify-between gap-4 pb-4">
                    <div className="space-y-1">
                      <CardTitle className="font-bold text-slate-900 text-base tracking-tight leading-tight">
                        {chapter.title}
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500 leading-relaxed max-w-xl">
                        {chapter.description}
                      </CardDescription>
                    </div>

                    {highestRecordedScore !== null ? (
                      <div className="text-right shrink-0 space-y-1">
                        <Badge className={`font-mono font-bold text-[11px] rounded-lg border px-2 py-0.5 shadow-none ${
                          highestRecordedScore >= 80 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50' 
                            : highestRecordedScore >= 50
                              ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50'
                              : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-50'
                        }`}>
                          🥇 Best: {highestRecordedScore}%
                        </Badge>
                        <span className="block text-[10px] text-slate-400 font-medium font-mono">{totalAttemptsCount} attempts</span>
                      </div>
                    ) : (
                      <Badge variant="secondary" className="shrink-0 text-[10px] font-bold text-slate-400 tracking-wide uppercase bg-slate-100 border-none rounded-md px-2 py-0.5">
                        Unattempted
                      </Badge>
                    )}
                  </CardHeader>

                  <CardFooter className="border-t border-slate-50 bg-slate-50/20 px-5 py-3 flex justify-end">
                    <Link href={`/quiz?chapterId=${chapter.id}`}>
                      <Button size="sm" className="rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors">
                        🚀 Launch Practice Quiz
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })
          )}
        </div>

        {/* RIGHT COMPONENT: PAST PAPERS VAULT */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold font-mono tracking-wider text-slate-400 uppercase mb-1 flex items-center gap-1.5">
            ✍️ Past Papers Vault
          </h2>

          <Card className="bg-white border-slate-200/70 rounded-2xl shadow-sm p-5 space-y-4">
            {subject.past_papers?.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-6">No uploaded materials listed for this code index.</p>
            ) : (
              subject.past_papers?.map((paper, idx) => (
                <div key={paper.id} className="space-y-3">
                  {idx > 0 && <Separator className="bg-slate-100" />}
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base shrink-0">📄</span>
                      <h3 className="font-bold text-slate-800 text-xs tracking-tight leading-tight">{paper.name}</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Link href={`/quiz?chapterId=${subject.chapters?.[0]?.id || ''}`} className="w-full">
                        <Button variant="outline" className="w-full py-1.5 h-auto rounded-xl border-slate-200 font-bold text-[11px] text-indigo-600 hover:bg-indigo-50/30 transition-colors">
                          💻 Digital
                        </Button>
                      </Link>
                      
                      <Link href={`/manual-exam?pdfUrl=${encodeURIComponent(paper.pdf_url)}&paperName=${encodeURIComponent(paper.name)}`} className="w-full">
                        <Button className="w-full py-1.5 h-auto rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm transition-colors">
                          ✍️ Manual
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </Card>
        </div>

      </div>
    </main>
  );
}