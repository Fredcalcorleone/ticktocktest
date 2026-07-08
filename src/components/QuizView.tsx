'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';

interface QuestionItem {
  id: string | number;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizViewProps {
  initialQuestions: QuestionItem[];
  chapterId: string; // Captured from query string router
}

export default function QuizView({ initialQuestions, chapterId }: QuizViewProps) {
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [isSavingScore, setIsSavingScore] = useState(false);

  useEffect(() => {
    if (secondsLeft <= 0 || quizSubmitted) {
      if (secondsLeft === 0 && !quizSubmitted) {
        handleAutoSubmit();
      }
      return;
    }

    const timerInterval = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [secondsLeft, quizSubmitted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectAnswer = (optionIndex: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: optionIndex
    });
  };

  // Live score tracking calculations
  const totalQuestions = initialQuestions.length;
  const totalCorrect = initialQuestions.reduce((acc, q, idx) => {
    return selectedAnswers[idx] === q.correctAnswer ? acc + 1 : acc;
  }, 0);
  const finalPercentage = Math.round((totalCorrect / totalQuestions) * 100);

  // Optimized database submission handler synced with Username context
  const logAttemptToDatabase = async (calculatedCorrect: number, calculatedPercentage: number) => {
    setIsSavingScore(true);
    
    // Fall back gracefully to 'anonymous' if no explicit login profile exists in window scope
    const sessionUsername = typeof window !== 'undefined' 
      ? localStorage.getItem('mindsprint_user') || 'anonymous' 
      : 'anonymous';

    try {
      const { error } = await supabase
        .from('quiz_attempts')
        .insert([
          {
            chapter_id: chapterId,
            score_percentage: calculatedPercentage,
            total_questions: totalQuestions,
            correct_answers: calculatedCorrect,
            student_username: sessionUsername // 👈 Tracks who took this test
          }
        ]);

      if (error) throw error;
      console.log(`Quiz metrics logged safely for user: ${sessionUsername}`);
    } catch (err: any) {
      console.error('Error writing analytics rows:', err.message);
    } finally {
      setIsSavingScore(false);
    }
  };

  const handleAutoSubmit = () => {
    setQuizSubmitted(true);
    logAttemptToDatabase(totalCorrect, finalPercentage);
  };

  const handleSubmitQuiz = () => {
    if (confirm("Are you sure you want to finalize and submit your quiz responses?")) {
      setQuizSubmitted(true);
      logAttemptToDatabase(totalCorrect, finalPercentage);
    }
  };

  const isTimeUrgent = secondsLeft <= 15;
  const currentQuestion = initialQuestions[currentQuestionIndex];

  return (
    <div className="max-w-3xl mx-auto my-8 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
      
      {/* HEADER BAR */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">Practice Portal</span>
          <h2 className="text-xl font-extrabold text-gray-800">
            {quizSubmitted ? "Performance Summary" : "Interactive Chapter Quiz"}
          </h2>
        </div>
        
        {!quizSubmitted && (
          <div className={`px-4 py-2 rounded-xl border text-lg font-mono font-bold flex items-center gap-2 transition-colors duration-300 ${
            isTimeUrgent 
              ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' 
              : 'bg-gray-50 text-gray-700 border-gray-200'
          }`}>
            <span>⏱️</span>
            <span>{formatTime(secondsLeft)}</span>
          </div>
        )}
      </div>

      {/* RENDER MODE A: POST-SUBMISSION INSIGHTS */}
      {quizSubmitted ? (
        <div className="space-y-8">
          
          {/* Main Score Banner */}
          <div className="bg-gray-900 text-white rounded-2xl p-6 text-center shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 font-mono text-xs text-gray-500">
              {isSavingScore ? "⏳ Syncing Metrics..." : "📊 Cloud Synced"}
            </div>
            <p className="text-sm font-bold tracking-widest text-indigo-400 uppercase">Final Score</p>
            <div className="text-6xl font-black mt-2 text-white tracking-tight">{finalPercentage}%</div>
            <p className="text-sm text-gray-400 mt-2">
              You answered <strong className="text-emerald-400">{totalCorrect}</strong> out of <strong>{totalQuestions}</strong> questions correctly.
            </p>
  
          </div>

          {/* Itemized Question Breakdown */}
          <div className="space-y-6">
            <h3 className="text-md font-bold text-gray-900 border-b border-gray-100 pb-2">📋 Itemized Question Breakdown:</h3>
            
            {initialQuestions.map((q, qIdx) => {
              const studentAnswer = selectedAnswers[qIdx];
              const isCorrect = studentAnswer === q.correctAnswer;

              return (
                <div key={q.id} className={`p-5 rounded-2xl border transition-all ${
                  isCorrect ? 'bg-emerald-50/40 border-emerald-200/60' : 'bg-red-50/30 border-red-200/50'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCorrect ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                    }`}>
                      {qIdx + 1}
                    </span>
                    <span className={`text-xs font-bold uppercase tracking-wider ${
                      isCorrect ? 'text-emerald-700' : 'text-red-700'
                    }`}>
                      {isCorrect ? '✓ Correct Response' : '✗ Incorrect Response'}
                    </span>
                  </div>

                  <h4 className="font-bold text-gray-900 text-sm mb-4 leading-relaxed">{q.question}</h4>

                  <div className="space-y-2">
                    {q.options.map((option, oIdx) => {
                      const wasSelected = studentAnswer === oIdx;
                      const isTargetCorrect = q.correctAnswer === oIdx;

                      let optionStyle = "border-gray-200 text-gray-500 bg-white/50";
                      
                      if (isTargetCorrect) {
                        optionStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold ring-1 ring-emerald-500/20";
                      } else if (wasSelected && !isTargetCorrect) {
                        optionStyle = "border-red-400 bg-red-50 text-red-900 font-medium line-through";
                      }

                      return (
                        <div key={oIdx} className={`p-3 text-xs rounded-xl border flex items-center justify-between ${optionStyle}`}>
                          <span>{option}</span>
                          {isTargetCorrect && <span className="text-emerald-600 font-bold text-xs">Correct Choice</span>}
                          {wasSelected && !isTargetCorrect && <span className="text-red-600 font-bold text-xs">Your Pick</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      ) : (
        
        /* RENDER MODE B: ACTIVE QUIZ INTERFACE */
        <div>
          <div className="mb-4 text-sm text-gray-500 font-medium">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </div>
          
          <h4 className="text-lg font-bold text-gray-900 mb-6 leading-relaxed">
            {currentQuestion?.question}
          </h4>

          <div className="space-y-3">
            {currentQuestion?.options.map((option, idx) => {
              const isSelected = selectedAnswers[currentQuestionIndex] === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectAnswer(idx)}
                  className={`w-full text-left p-4 rounded-xl border text-sm transition-all duration-150 ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-semibold ring-2 ring-indigo-600/20 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100/50'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          <div className="flex justify-between items-center border-t border-gray-100 mt-8 pt-6">
            <button
              type="button"
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
              className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition"
            >
              &larr; Previous
            </button>

            {currentQuestionIndex < totalQuestions - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                className="px-5 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 shadow-sm transition"
              >
                Next Option &rarr;
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitQuiz}
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-sm transition"
              >
                Submit Assessment
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}