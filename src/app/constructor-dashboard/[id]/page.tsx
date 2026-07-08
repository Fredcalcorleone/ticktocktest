'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Subject {
  id: string;
  name: string;
  code: string;
}

export default function ConstructorDashboard() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State parameters
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');
  const [targetSubjectId, setTargetSubjectId] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterDesc, setChapterDesc] = useState('');

  useEffect(() => {
    fetchActiveSubjects();
  }, []);

  async function fetchActiveSubjects() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subjects')
        .select('id, name, code')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubjects(data || []);
      if (data && data.length > 0) setTargetSubjectId(data[0].id);
    } catch (err: any) {
      console.error('Error matching admin data tree:', err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    try {
      const { error } = await supabase.from('subjects').insert({
        name: newSubjectName.trim(),
        code: newSubjectCode.trim() || 'CORE-SPEC'
      });

      if (error) throw error;
      setNewSubjectName('');
      setNewSubjectCode('');
      await fetchActiveSubjects();
    } catch (err: any) {
      alert(`Failed to store configuration: ${err.message}`);
    }
  };

  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterTitle.trim() || !targetSubjectId) return;

    try {
      const { error } = await supabase.from('chapters').insert({
        subject_id: targetSubjectId,
        title: chapterTitle.trim(),
        description: chapterDesc.trim()
      });

      if (error) throw error;
      setChapterTitle('');
      setChapterDesc('');
      alert("Chapter added successfully!");
    } catch (err: any) {
      alert(`Failed to insert record: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <p className="text-xs font-mono font-semibold text-slate-400 animate-pulse">Loading workspace index panels...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50/50 pb-16 antialiased">
      <div className="max-w-5xl mx-auto px-6 pt-12">
        
        {/* HEADER SECTION */}
        <header className="mb-10 space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Content Studio</h1>
            <Badge className="bg-indigo-600 hover:bg-indigo-600 rounded-lg text-[10px] font-mono tracking-wider font-bold">
              ADMIN MODE
            </Badge>
          </div>
          <p className="text-sm text-slate-500 max-w-xl leading-relaxed">
            Provision new educational core subjects, curriculum code nodes, or append custom assessment chapters directly to active live catalogs.
          </p>
        </header>

        {/* TWO-COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT PANEL: ACTIVE CATALOG SUMMARY */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold font-mono tracking-wider text-slate-400 uppercase mb-1">
              📋 Live Subjects Catalog ({subjects.length})
            </h2>
            
            <Card className="border-slate-200/70 shadow-sm bg-white rounded-2xl overflow-hidden">
              <CardHeader className="bg-slate-50/40 p-4 border-b border-slate-100">
                <CardTitle className="text-xs font-bold text-slate-700 tracking-wide uppercase">Active Branches</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {subjects.length === 0 ? (
                  <p className="text-xs text-slate-400 p-4 italic text-center">No program lines registered yet.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {subjects.map((sub) => (
                      <div key={sub.id} className="p-4 flex items-center justify-between hover:bg-slate-50/30 transition-colors">
                        <div className="space-y-0.5">
                          <p className="text-sm font-bold text-slate-900 leading-tight">{sub.name}</p>
                          <p className="text-[10px] font-mono font-bold text-slate-400 tracking-wide uppercase">{sub.code}</p>
                        </div>
                        <span className="text-xs text-slate-300">#{(sub.id).toString().substring(0, 4)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT PANEL: ACTIONABLE CREATOR BLOCKS */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* FORM 1: CREATE NEW SUBJECT LINE */}
            <Card className="border-slate-200/70 shadow-sm bg-white rounded-2xl p-6">
              <div className="space-y-1 mb-5">
                <CardTitle className="text-base font-bold text-slate-900 tracking-tight">Create Program Subject</CardTitle>
                <CardDescription className="text-xs text-slate-500">Adds an entire new course ecosystem panel inside the student grid view.</CardDescription>
              </div>
              
              <form onSubmit={handleCreateSubject} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold font-mono tracking-wide text-slate-500 uppercase">Subject Name</label>
                  <Input 
                    type="text" 
                    placeholder="e.g., Higher Pure Mathematics"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    className="rounded-xl border-slate-200 text-xs font-semibold bg-white"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold font-mono tracking-wide text-slate-500 uppercase">Syllabus Index Code</label>
                  <Input 
                    type="text" 
                    placeholder="e.g., MATH-9709"
                    value={newSubjectCode}
                    onChange={(e) => setNewSubjectCode(e.target.value)}
                    className="rounded-xl border-slate-200 text-xs font-semibold bg-white"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end pt-2">
                  <Button type="submit" size="sm" className="rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors">
                    ➕ Deploy Subject Route
                  </Button>
                </div>
              </form>
            </Card>

            {/* FORM 2: APPENDIX CHAPTER ATTACHMENT */}
            <Card className="border-slate-200/70 shadow-sm bg-white rounded-2xl p-6">
              <div className="space-y-1 mb-5">
                <CardTitle className="text-base font-bold text-slate-900 tracking-tight">Append Curriculum Chapter</CardTitle>
                <CardDescription className="text-xs text-slate-500">Maps out structured knowledge topics and ties quiz assets to selected base subjects.</CardDescription>
              </div>

              <form onSubmit={handleCreateChapter} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold font-mono tracking-wide text-slate-500 uppercase">Target Parent Subject</label>
                  <select
                    value={targetSubjectId}
                    onChange={(e) => setTargetSubjectId(e.target.value)}
                    className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-600 transition-all"
                    required
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold font-mono tracking-wide text-slate-500 uppercase">Chapter / Module Title</label>
                  <Input 
                    type="text" 
                    placeholder="e.g., Core Differentiation Principles"
                    value={chapterTitle}
                    onChange={(e) => setChapterTitle(e.target.value)}
                    className="rounded-xl border-slate-200 text-xs font-semibold bg-white"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold font-mono tracking-wide text-slate-500 uppercase">Overview Summary</label>
                  <Textarea 
                    placeholder="Brief description outlining the evaluation objectives for this student chapter block..."
                    value={chapterDesc}
                    onChange={(e) => setChapterDesc(e.target.value)}
                    className="rounded-xl border-slate-200 text-xs font-medium bg-white min-h-[80px]"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" size="sm" className="rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-colors">
                    💾 Append Chapter Module
                  </Button>
                </div>
              </form>
            </Card>

          </div>
        </div>

      </div>
    </main>
  );
}