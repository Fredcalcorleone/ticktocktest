'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Flame, ArrowLeft, Trophy, CheckCircle2, Circle, Award, 
  Target, Zap, Star, ShieldCheck, Sparkles, CalendarCheck 
} from 'lucide-react';

interface Mission {
  id: number;
  title: string;
  description: string;
  xp: number;
  category: 'Bronze' | 'Elite' | 'Grandmaster';
  completed: boolean;
}

const INITIAL_MISSIONS: Mission[] = [
  // Bronze Tier (Missions 1 - 5)
  { id: 1, title: 'First Steps', description: 'Complete your first practice module or test run.', xp: 100, category: 'Bronze', completed: false },
  { id: 2, title: 'Identity Confirmed', description: 'Upload a custom profile photo in account settings.', xp: 50, category: 'Bronze', completed: false },
  { id: 3, title: 'Consistent Learner', description: 'Maintain a 3-day login streak.', xp: 150, category: 'Bronze', completed: false },
  { id: 4, title: 'Passing Grade', description: 'Score at least 70% on any quiz or evaluation.', xp: 100, category: 'Bronze', completed: false },
  { id: 5, title: 'Handle Claimed', description: 'Set up your unique display username.', xp: 50, category: 'Bronze', completed: false },

  // Elite Tier (Missions 6 - 10)
  { id: 6, title: 'High Performer', description: 'Score 85% or higher on 3 different modules.', xp: 250, category: 'Elite', completed: false },
  { id: 7, title: 'Streak Master', description: 'Keep your daily login streak active for 7 consecutive days.', xp: 300, category: 'Elite', completed: false },
  { id: 8, title: 'Sprint Competitor', description: 'Complete at least 5 total evaluation runs.', xp: 200, category: 'Elite', completed: false },
  { id: 9, title: 'Leaderboard Contender', description: 'Reach the Top 10 on the Global Leaderboard.', xp: 350, category: 'Elite', completed: false },
  { id: 10, title: 'Perfectionist', description: 'Achieve a perfect 100% score on any module.', xp: 300, category: 'Elite', completed: false },

  // Grandmaster Tier (Missions 11 - 15)
  { id: 11, title: 'Sprint Legend', description: 'Complete 15 total assessment runs.', xp: 500, category: 'Grandmaster', completed: false },
  { id: 12, title: 'Unstoppable Momentum', description: 'Reach a 14-day consecutive login streak.', xp: 600, category: 'Grandmaster', completed: false },
  { id: 13, title: 'Elite Mastery', description: 'Maintain an overall average score above 90%.', xp: 750, category: 'Grandmaster', completed: false },
  { id: 14, title: 'Domination', description: 'Secure Rank #1 on the Global Leaderboard.', xp: 1000, category: 'Grandmaster', completed: false },
  { id: 15, title: 'Grandmaster Sprint Status', description: 'Unlock the highest rank tier in MindSprint.', xp: 1200, category: 'Grandmaster', completed: false },
];

export default function GoalsPage() {
  const [streak, setStreak] = useState<number>(1);
  const [hasClaimedToday, setHasClaimedToday] = useState<boolean>(false);
  const [missions, setMissions] = useState<Mission[]>(INITIAL_MISSIONS);

  useEffect(() => {
    // 1. Load Streak Data
    const savedStreak = localStorage.getItem('mindsprint_streak');
    const lastLogin = localStorage.getItem('mindsprint_last_login');
    const today = new Date().toDateString();

    if (savedStreak) setStreak(parseInt(savedStreak, 10));

    if (lastLogin === today) {
      setHasClaimedToday(true);
    } else if (lastLogin) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastLogin !== yesterday.toDateString()) {
        // Reset streak if missed a day
        setStreak(1);
        localStorage.setItem('mindsprint_streak', '1');
      }
    }

    // 2. Load Missions Progress
    const savedMissions = localStorage.getItem('mindsprint_missions');
    if (savedMissions) {
      setMissions(JSON.parse(savedMissions));
    }
  }, []);

  const claimDailyStreak = () => {
    const today = new Date().toDateString();
    const newStreak = streak + 1;
    setStreak(newStreak);
    setHasClaimedToday(true);
    localStorage.setItem('mindsprint_streak', newStreak.toString());
    localStorage.setItem('mindsprint_last_login', today);
  };

  const toggleMission = (id: number) => {
    const updated = missions.map(m => m.id === id ? { ...m, completed: !m.completed } : m);
    setMissions(updated);
    localStorage.setItem('mindsprint_missions', JSON.stringify(updated));
  };

  const completedCount = missions.filter(m => m.completed).length;
  const progressPercentage = Math.round((completedCount / missions.length) * 100);
  const totalXpEarned = missions.filter(m => m.completed).reduce((acc, curr) => acc + curr.xp, 0);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors duration-200 antialiased p-4 md:p-6 pb-24 md:pb-12">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-slate-600 dark:text-slate-400 gap-1.5 text-xs font-bold font-mono hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full cursor-pointer">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Button>
          </Link>
          <span className="text-[10px] bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 font-mono font-bold px-2.5 py-0.5 rounded-full select-none flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Level Up Season Active
          </span>
        </div>

        {/* TOP STREAK HEADER */}
        <Card className="border-none shadow-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white rounded-3xl overflow-hidden relative">
          <CardContent className="p-6 md:p-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5 text-center md:text-left">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shrink-0 shadow-inner">
                <Flame className="w-12 h-12 text-yellow-300 animate-pulse" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-amber-100">Daily Login Streak</p>
                <h1 className="text-3xl md:text-4xl font-black">{streak} {streak === 1 ? 'Day' : 'Days'} Active</h1>
                <p className="text-xs text-amber-100/90 font-medium">Log in daily to claim bonus XP and level up faster!</p>
              </div>
            </div>

            <Button
              onClick={claimDailyStreak}
              disabled={hasClaimedToday}
              className={`font-black text-xs px-6 py-6 rounded-2xl shadow-lg transition-all cursor-pointer ${
                hasClaimedToday 
                  ? 'bg-white/20 text-white border border-white/30 cursor-not-allowed' 
                  : 'bg-white text-orange-600 hover:bg-amber-50 hover:scale-105'
              }`}
            >
              {hasClaimedToday ? (
                <span className="flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4" /> Streak Claimed Today!
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4 fill-orange-600" /> Claim Daily Streak (+50 XP)
                </span>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* MISSION PROGRESS METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-slate-200/80 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900 rounded-2xl">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-indigo-600 dark:text-indigo-400">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">Missions Cleared</p>
                <p className="text-xl font-black text-slate-900 dark:text-slate-100">{completedCount} / {missions.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900 rounded-2xl">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl text-emerald-600 dark:text-emerald-400">
                <Star className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">Total XP Unlocked</p>
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{totalXpEarned} XP</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900 rounded-2xl">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/50 rounded-xl text-amber-600 dark:text-amber-400">
                <Trophy className="w-6 h-6" />
              </div>
              <div className="w-full space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Level Progress</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2 bg-slate-100 dark:bg-slate-800" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 15 MISSIONS BOARD */}
        <Card className="border-slate-200/80 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
          <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-base font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Level-Up Campaign Missions
            </CardTitle>
            <CardDescription className="text-xs">Complete all 15 achievements to unlock Grandmaster Tier standing.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            
            {['Bronze', 'Elite', 'Grandmaster'].map((tier) => {
              const tierMissions = missions.filter(m => m.category === tier);
              
              return (
                <div key={tier} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Award className={`w-4 h-4 ${
                      tier === 'Bronze' ? 'text-amber-700' : tier === 'Elite' ? 'text-indigo-500' : 'text-purple-500'
                    }`} />
                    <h3 className="text-xs font-mono font-black uppercase tracking-wider text-slate-500">
                      {tier} Tier Missions
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {tierMissions.map((mission) => (
                      <div
                        key={mission.id}
                        onClick={() => toggleMission(mission.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                          mission.completed 
                            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50' 
                            : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <button className="text-emerald-600 dark:text-emerald-400 focus:outline-none">
                            {mission.completed ? (
                              <CheckCircle2 className="w-5 h-5 fill-emerald-600 text-white dark:fill-emerald-400 dark:text-slate-900" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                            )}
                          </button>
                          <div>
                            <p className={`text-xs font-bold ${mission.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-slate-100'}`}>
                              #{mission.id}. {mission.title}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {mission.description}
                            </p>
                          </div>
                        </div>

                        <span className={`text-[10px] font-mono font-black px-2.5 py-1 rounded-xl shrink-0 ${
                          mission.completed 
                            ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' 
                            : 'bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          +{mission.xp} XP
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

          </CardContent>
        </Card>

      </div>
    </div>
  );
}