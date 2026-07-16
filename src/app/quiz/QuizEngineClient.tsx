'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/utils/supabase';
import { UploadCloud, FileText, ArrowLeft, BookOpen, ExternalLink, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface GeneratedQuestion {
  id: number;
  question: string;
  options: string[];
  answerIndex: number;
  referenceQuote: string;
  pageNumber: number;
}

export function QuizEngineClient() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [sessionLimit, setSessionLimit] = useState<number>(10);
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  
  const [detectedTitle, setDetectedTitle] = useState('Custom PDF Study Guide');
  const [aiQuestions, setAiQuestions] = useState<GeneratedQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [savingLog, setSavingLog] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [pendingTargetUrl, setPendingTargetUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cachedUser = localStorage.getItem('mindsprint_user');
      setUsername(cachedUser || 'Learner');
    }
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (quizStarted && !quizFinished) {
        e.preventDefault();
        e.returnValue = "Are you sure you want to exit?";
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [quizStarted, quizFinished]);

  const handleProtectedExit = (targetUrl: string) => {
    if (quizStarted && !quizFinished) {
      setPendingTargetUrl(targetUrl);
      setShowExitModal(true);
    } else {
      router.push(targetUrl);
    }
  };

  const confirmExitAction = () => {
    setShowExitModal(false);
    router.push(pendingTargetUrl || '/dashboard');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const chosenFile = e.target.files[0];
      setFile(chosenFile);
      setFileUrl(null);
    }
  };

  const extractTextFromPDF = async (fileObject: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', fileObject);

    const response = await fetch('/api/parse-pdf', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to extract text on server.');
    }

    const data = await response.json();
    return data.text;
  };

  const handleStartAnalysis = async () => {
    if (!file) {
      alert("Please upload your notes PDF document first.");
      return;
    }

    const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!geminiKey) {
      alert("Missing API Key!");
      return;
    }

    try {
      setIsAnalyzing(true);
      
      const fileExtension = file.name.split('.').pop();
      const uniqueFileName = `${username || 'learner'}-${Date.now()}.${fileExtension}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('quiz-pdfs')
        .upload(uniqueFileName, file);

      let publicPdfUrl = '';
      if (!uploadError && uploadData) {
        const { data: publicUrlData } = supabase.storage.from('quiz-pdfs').getPublicUrl(uniqueFileName);
        publicPdfUrl = publicUrlData.publicUrl;
        setFileUrl(publicPdfUrl);
      } else {
        throw new Error(uploadError?.message || "Failed to upload target PDF to media cloud.");
      }

      const parsedTextContent = await extractTextFromPDF(file);

      if (!parsedTextContent || !parsedTextContent.trim()) {
        throw new Error("Could not find any readable text layers inside this document.");
      }

      const payloadBody = {
        contents: [{ 
          parts: [{ text: `Analyze this source material text and build exactly ${sessionLimit} questions.\nSource Material Content:\n${parsedTextContent.substring(0, 16000)}` }] 
        }],
        system_instruction: {
          parts: [{ text: "You are an expert academic evaluator. Analyze the provided reading notes text context, deduce a descriptive umbrella topic title name, and generate high-yield educational multiple choice quiz questions. IMPORTANT: The source text contains explicit page markers formatted as '--- START OF PDF PAGE SHEET X ---'. For the 'pageNumber' value of every question, you must find the '--- START OF PDF PAGE SHEET X ---' marker that immediately precedes the chosen 'referenceQuote', extract its exact integer value 'X', and save it to the pageNumber field. Never guess or approximate." }]
        },
        generation_config: {
          response_mime_type: "application/json",
          response_schema: {
            type: "OBJECT",
            properties: {
              detectedTopicTitle: { type: "STRING" },
              questions: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    id: { type: "INTEGER" },
                    question: { type: "STRING" },
                    options: { type: "ARRAY", items: { type: "STRING" } },
                    answerIndex: { type: "INTEGER" },
                    referenceQuote: { type: "STRING" },
                    pageNumber: { type: "INTEGER" }
                  },
                  required: ["id", "question", "options", "answerIndex", "referenceQuote", "pageNumber"]
                }
              }
            },
            required: ["detectedTopicTitle", "questions"]
          }
        }
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payloadBody)
        }
      );

      const apiData = await response.json();
      if (apiData.error) throw new Error(`Gemini Error: ${apiData.error.message}`);

      const rawTextJson = apiData.candidates[0].content.parts[0].text.trim();
      const cleanParsedResult = JSON.parse(rawTextJson);

      if (cleanParsedResult && cleanParsedResult.questions?.length > 0) {
        setDetectedTitle(cleanParsedResult.detectedTopicTitle || file.name.replace(".pdf", ""));
        setAiQuestions(cleanParsedResult.questions.slice(0, sessionLimit));
        setQuizStarted(true);
      } else {
        throw new Error("Parsed response schema did not match required format.");
      }
    } catch (err: any) {
      console.error("Gemini processing error: ", err);
      alert(`Extraction Error: ${err.message || "Failed to process document content."}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOptionSelect = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    if (index === aiQuestions[currentQuestionIndex].answerIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = async () => {
    setSelectedOption(null);
    if (currentQuestionIndex + 1 < aiQuestions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      await saveMetricsToDatabase();
      setQuizFinished(true);
    }
  };

  const saveMetricsToDatabase = async () => {
    try {
      setSavingLog(true);
      const calculatedPercentage = Math.round((score / aiQuestions.length) * 100);

      await supabase.from('user_progress').insert({
        username: username,
        module_name: `${detectedTitle.trim()}`,
        score: calculatedPercentage,
        status: 'completed',
        pdf_url: fileUrl,
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      console.error("Database save failed:", err);
    } finally {
      setSavingLog(false);
    }
  };

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-6 antialiased relative">
      {showExitModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <Card className="w-full max-w-sm border-slate-200 shadow-2xl bg-white rounded-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 mx-auto flex items-center justify-center text-lg border border-amber-100">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-black text-slate-900 tracking-tight">Discard Active Assessment?</h3>
              <p className="text-xs text-slate-500 leading-relaxed px-2">An active evaluation loop is currently running. Leaving now will permanently lose your session metrics.</p>
            </div>
            <div className="flex gap-2.5 pt-1">
              <Button onClick={() => setShowExitModal(false)} className="w-1/2 bg-slate-100 text-slate-700 font-bold text-xs h-9 rounded-xl shadow-none cursor-pointer">Continue Test</Button>
              <Button onClick={confirmExitAction} className="w-1/2 bg-rose-600 text-white font-bold text-xs h-9 rounded-xl shadow-sm cursor-pointer">Discard & Quit</Button>
            </div>
          </Card>
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => handleProtectedExit('/dashboard')} className="text-xs font-bold text-slate-500 hover:text-slate-800 gap-1 rounded-xl h-8 cursor-pointer">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Button>
        <Badge variant="outline" className="border-indigo-100 bg-indigo-50/50 text-indigo-700 font-mono font-bold px-2.5 py-0.5 text-[10px] rounded-lg">@{username} Gemini Engine</Badge>
      </div>

      {!quizStarted && !quizFinished && (
        <Card className="border-slate-200/80 shadow-xl bg-white rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-slate-50 p-6 flex flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-1.5 shadow-inner">
              <Image src="/logo.svg" alt="MindSprint Logo" width={24} height={24} className="object-contain" priority />
            </div>
            <div>
              <CardTitle className="text-sm font-black text-slate-900 tracking-tight">AI Assessment Creator</CardTitle>
              <p className="text-[11px] text-slate-400 mt-0.5">Drop your reading material PDF. Gemini will deduce the topic matter and generate your session.</p>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase flex items-center gap-1">Assessment Size Length</label>
              <div className="grid grid-cols-3 gap-3">
                {[10, 20, 30].map((num) => (
                  <button key={num} type="button" onClick={() => setSessionLimit(num)} className={`h-10 text-xs font-mono font-bold rounded-xl border transition-all ${sessionLimit === num ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200'}`}>{num} Questions</button>
                ))}
              </div>
            </div>
            <div className="border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-2xl p-8 text-center relative cursor-pointer">
              <input type="file" accept=".pdf" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={isAnalyzing} />
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400"><UploadCloud className="w-5 h-5" /></div>
                {file ? (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-800 flex items-center justify-center gap-1.5"><FileText className="w-3.5 h-3.5 text-indigo-500" /> {file.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{(file.size / (1024 * 1024)).toFixed(2)} MB • PDF Ready</p>
                  </div>
                ) : (
                  <>
                    <p className="text-xs font-bold text-slate-800">Click to upload or drop lecture notes PDF</p>
                    <p className="text-[10px] text-slate-400">Reads text layer segments instantly to formulate evaluation runs</p>
                  </>
                )}
              </div>
            </div>
            {file && (
              <Button onClick={handleStartAnalysis} disabled={isAnalyzing} className="w-full bg-indigo-600 text-white font-bold text-xs h-10 rounded-xl shadow-md cursor-pointer">
                {isAnalyzing ? "Processing & Uploading..." : `Analyze Notes & Build ${sessionLimit} Inquiries →`}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {quizStarted && !quizFinished && (
        <Card className="border-slate-200/80 shadow-xl bg-white rounded-3xl p-6 space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 max-w-[70%]"><span className="text-[10px] font-mono font-bold uppercase tracking-tight text-indigo-600 truncate">📖 Subject: {detectedTitle}</span></div>
            <div className="flex gap-3 text-[10px] font-mono font-bold shrink-0"><span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{currentQuestionIndex + 1} of {aiQuestions.length}</span><span className="text-emerald-600">Correct: {score}</span></div>
          </div>
          <h3 className="text-sm font-black text-slate-800 leading-relaxed tracking-tight">{aiQuestions[currentQuestionIndex]?.question}</h3>
          <div className="space-y-2.5">
            {aiQuestions[currentQuestionIndex]?.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === aiQuestions[currentQuestionIndex].answerIndex;
              let optionStyle = "border-slate-200/80 bg-white hover:bg-slate-50 cursor-pointer";
              if (selectedOption !== null) {
                if (isCorrect) optionStyle = "border-emerald-200 bg-emerald-50/60 text-emerald-900";
                else if (isSelected) optionStyle = "border-rose-200 bg-rose-50/60 text-rose-900";
                else optionStyle = "border-slate-100 opacity-60 bg-white";
              }
              return (
                <button key={idx} onClick={() => handleOptionSelect(idx)} disabled={selectedOption !== null} className={`w-full text-left p-3 border rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${optionStyle}`}>
                  <span>{option}</span>
                </button>
              );
            })}
          </div>
          {selectedOption !== null && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 text-left space-y-3">
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase text-indigo-600 tracking-wider flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Source Context Reference</span>
                <p className="text-xs font-medium text-slate-600 italic leading-relaxed">"{aiQuestions[currentQuestionIndex]?.referenceQuote || "Context reference verification details not extracted."}"</p>
              </div>
              {fileUrl && aiQuestions[currentQuestionIndex]?.pageNumber && (
                <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Page {aiQuestions[currentQuestionIndex].pageNumber}</span>
                  {(() => {
                    // Normalize the quote: remove quotes, double spaces, and strip down to a clean 3-4 word phrase
                    // Long sentences break the Chrome PDF highlighting engine easily
                    const words = (aiQuestions[currentQuestionIndex]?.referenceQuote || "")
                      .replace(/["'“”‘’.,/#!$%^&*;:{}=\-_`~()]/g, '')
                      .trim()
                      .split(/\s+/);
                    
                    const searchQuery = words.slice(0, Math.min(words.length, 4)).join(' ');
                    const targetHref = `${fileUrl}#page=${aiQuestions[currentQuestionIndex].pageNumber}&search="${encodeURIComponent(searchQuery)}"`;

                    return (
                      <a href={targetHref} target="_blank" rel="noopener noreferrer">
                        <Button type="button" variant="outline" className="h-7 text-[10px] font-bold font-mono tracking-tight bg-white rounded-lg border-slate-200 shadow-none px-2.5 gap-1 cursor-pointer">
                          Open PDF Origin <ExternalLink className="w-3 h-3 text-slate-400" />
                        </Button>
                      </a>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
          {selectedOption !== null && (
            <Button onClick={handleNextQuestion} className="w-full bg-slate-900 text-white font-bold text-xs h-10 rounded-xl mt-2 cursor-pointer">
              {currentQuestionIndex + 1 === aiQuestions.length ? "Finish Assessment & Record History →" : "Next Question →"}
            </Button>
          )}
        </Card>
      )}

      {quizFinished && (
        <Card className="border-slate-200/80 shadow-xl bg-white rounded-3xl p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-500 mx-auto flex items-center justify-center text-xl shadow-inner">🎉</div>
          <div className="space-y-1">
            <h2 className="text-base font-black text-slate-900 tracking-tight">Assessment Record Committed</h2>
            <p className="text-xs text-slate-400">Performance statistics safely updated into history metrics.</p>
          </div>
          <div className="py-4 bg-slate-50/60 rounded-2xl max-w-xs mx-auto border border-slate-100">
            <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide">Target Topic</p>
            <p className="text-xs font-bold text-indigo-700 px-2 truncate mt-0.5">{detectedTitle}</p>
            <p className="text-3xl font-black text-slate-800 mt-2">{Math.round((score / aiQuestions.length) * 100)}%</p>
            <p className="text-[10px] text-emerald-600 font-mono font-bold mt-1">({score} / {aiQuestions.length} Correct)</p>
          </div>
          <div className="flex gap-3 max-w-sm mx-auto pt-2">
            <Button onClick={() => { setQuizStarted(false); setQuizFinished(false); setCurrentQuestionIndex(0); setSelectedOption(null); setScore(0); setAiQuestions([]); }} className="w-1/2 bg-white border border-slate-200 text-slate-600 font-bold text-xs h-10 rounded-xl cursor-pointer">Test New File</Button>
            <Button onClick={() => handleProtectedExit('/dashboard')} className="w-1/2 bg-indigo-600 text-white font-bold text-xs h-10 rounded-xl cursor-pointer">Go to Dashboard</Button>
          </div>
        </Card>
      )}
    </main>
  );
}