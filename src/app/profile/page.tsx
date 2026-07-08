'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from '@/utils/supabase';
import { User, GraduationCap, BarChart3, ShieldCheck, ArrowLeft, Award, Trophy, Zap, LineChart, X, Flame, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface ProgressTelemetryRow {
  username: string;
  score: number;
  module_name: string;
  updated_at: string;
}

interface LeaderboardUser {
  username: string;
  averageScore: number;
  totalUploads: number;
  rankTier: string;
}

export default function ProfilePage() {
  const [username, setUsername] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [chartData, setChartData] = useState<{ name: string; score: number }[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardUser[]>([]);
  
  const [stats, setStats] = useState({
    totalTests: 0,
    averageScore: 0,
    highestScore: 0,
    rank: 'Bronze Scholar'
  });

  const getNextTierRequirements = (currentRank: string, currentUploads: number) => {
    if (currentRank === 'Bronze Scholar') {
      return { next: 'Elite Thinker', par: 3, remaining: Math.max(0, 3 - currentUploads) };
    }
    if (currentRank === 'Elite Thinker') {
      return { next: 'Grandmaster Sprint', par: 5, remaining: Math.max(0, 5 - currentUploads) };
    }
    return { next: 'MAX RANK REACHED', par: 5, remaining: 0 };
  };

  useEffect(() => {
    const cachedUser = localStorage.getItem('mindsprint_user');
    if (!cachedUser) {
      window.location.href = '/';
      return;
    }
    setUsername(cachedUser);
    fetchProfileAndLeaderboard(cachedUser);

    const isDark = localStorage.getItem('theme') === 'dark';
    if (isDark) document.documentElement.classList.add('dark');
  }, []);

  const fetchProfileAndLeaderboard = async (userKey: string) => {
    try {
      setLoading(true);

      const { data: allData, error: globalErr } = await supabase
        .from('user_progress')
        .select('username, score, module_name, updated_at');

      if (globalErr) throw globalErr;

      if (allData) {
        const globalRows = allData as ProgressTelemetryRow[];

        const userGroups: { [key: string]: number[] } = {};
        globalRows.forEach(row => {
          if (!userGroups[row.username]) userGroups[row.username] = [];
          userGroups[row.username].push(row.score);
        });

        const compiledLeaderboard: LeaderboardUser[] = Object.keys(userGroups).map(user => {
          const userScores = userGroups[user];
          const totalUploads = userScores.length;
          const avgScore = Math.round(userScores.reduce((a, b) => a + b, 0) / totalUploads);
          
          let tier = 'Bronze Scholar';
          if (totalUploads >= 5 && avgScore >= 85) tier = 'Grandmaster Sprint';
          else if (totalUploads >= 3) tier = 'Elite Thinker';

          return { username: user, averageScore: avgScore, totalUploads, rankTier: tier };
        });

        compiledLeaderboard.sort((a, b) => b.averageScore - a.averageScore);
        setGlobalLeaderboard(compiledLeaderboard);

        const userRows = globalRows.filter(row => row.username === userKey);
        userRows.sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime());

        if (userRows.length > 0) {
          const total = userRows.length;
          const scores = userRows.map(r => r.score);
          const average = Math.round(scores.reduce((acc, s) => acc + s, 0) / total);
          const highest = Math.max(...scores);
          
          let computedRank = 'Bronze Scholar';
          if (total >= 5 && average >= 85) computedRank = 'Grandmaster Sprint';
          else if (total >= 3) computedRank = 'Elite Thinker';

          setStats({
            totalTests: total,
            averageScore: average,
            highestScore: highest,
            rank: computedRank
          });

          setChartData(userRows.map(row => ({
            name: row.module_name.length > 15 ? `${row.module_name.substring(0, 15)}...` : row.module_name,
            score: row.score
          })));
        }
      }
    } catch (err) {
      console.error("Error generating leaderboard tiers:", err);
    } finally {
      setLoading(false);
    }
  };

  const userRankPosition = globalLeaderboard.findIndex(u => u.username === username) + 1;
  const promotionMeta = getNextTierRequirements(stats.rank, stats.totalTests);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors duration-200 antialiased p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-slate-600 dark:text-slate-400 gap-1.5 text-xs font-bold font-mono hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full cursor-pointer">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Button>
          </Link>
          <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-indigo-700 dark:text-indigo-400 font-mono font-bold px-2.5 py-0.5 rounded-full select-none">
            Verified Account
          </span>
        </div>

        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 relative overflow-hidden shadow-xl border border-slate-800/20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-20 h-20 bg-indigo-600 border-4 border-slate-800 rounded-2xl flex items-center justify-center shadow-inner">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>

              <div className="space-y-1.5 text-center sm:text-left">
                <h2 className="text-2xl font-black tracking-tight font-sans">@{username}</h2>
                <button
                  onClick={() => setShowLeaderboard(true)}
                  className="group px-3 py-1 bg-indigo-500/20 hover:bg-indigo-500/40 border border-indigo-400/30 text-indigo-300 text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
                  League Rank: <span className="text-white underline">{loading ? 'Loading...' : stats.rank}</span>
                  <ArrowUpRight className="w-3 h-3 text-indigo-400" />
                </button>
              </div>
            </div>

            {!loading && promotionMeta.par > 0 && (
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl max-w-xs text-center sm:text-right">
                <p className="text-[10px] text-indigo-300 font-bold uppercase font-mono tracking-wider flex items-center justify-center sm:justify-end gap-1">
                  <Flame className="w-3 h-3 text-amber-500 animate-bounce" /> Tier Upgrade Path Par
                </p>
                <p className="text-xs font-medium text-slate-200 mt-1">
                  {promotionMeta.remaining > 0 
                    ? `Upload and evaluate ${promotionMeta.remaining} more packets to enter ${promotionMeta.next}.` 
                    : `Upload par met! Secure a cumulative average >85% to reach ${promotionMeta.next}.`
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 border-slate-200/80 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900 rounded-2xl">
            <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">Competitor Metrics</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs font-medium text-slate-700 dark:text-slate-300">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase">Global Ladder Standing</span>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold text-sm">
                  <Trophy className="w-4 h-4 text-amber-500" /> Position #{loading ? '...' : userRankPosition} Globally
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 border-slate-200/80 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900 rounded-2xl">
            <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">Supabase Telemetry Aggregates</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1 p-4 bg-slate-50/70 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/60 rounded-2xl">
                  <BarChart3 className="w-5 h-5 mx-auto text-indigo-600 dark:text-indigo-400" />
                  <p className="text-[10px] font-mono font-bold uppercase text-slate-400">Total Runs</p>
                  <p className="text-xl font-black text-slate-900 dark:text-slate-100">{loading ? '...' : stats.totalTests}</p>
                </div>
                <div className="space-y-1 p-4 bg-slate-50/70 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/60 rounded-2xl">
                  <Trophy className="w-5 h-5 mx-auto text-amber-500" />
                  <p className="text-[10px] font-mono font-bold uppercase text-slate-400">Top Grade</p>
                  <p className="text-xl font-black text-slate-900 dark:text-slate-100">{loading ? '...' : `${stats.highestScore}%`}</p>
                </div>
                <div className="space-y-1 p-4 bg-slate-50/70 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/60 rounded-2xl">
                  <Award className="w-5 h-5 mx-auto text-emerald-600 dark:text-emerald-400" />
                  <p className="text-[10px] font-mono font-bold uppercase text-slate-400">Avg Rating</p>
                  <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{loading ? '...' : `${stats.averageScore}%`}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CHART TRACKER */}
        <Card className="w-full border-slate-200/80 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
          <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center gap-2">
            <LineChart className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <div>
              <CardTitle className="text-sm font-black text-slate-900 dark:text-slate-100 tracking-tight">Performance Progress Analytics</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="h-64 flex items-center justify-center text-xs text-slate-400 font-mono">Compiling analytics...</div>
            ) : chartData.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center">
                <p className="text-xs font-bold text-slate-500">No data found.</p>
              </div>
            ) : (
              <div className="w-full h-64 pr-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800/60" />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '11px', color: '#fff', fontWeight: 'bold' }} />
                    <Area type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#scoreGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* OVERLAY MODAL */}
        {showLeaderboard && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-xl border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900 rounded-3xl max-h-[80vh] flex flex-col overflow-hidden">
              <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <CardTitle className="text-sm font-black text-slate-900 dark:text-slate-100">Global Sprint Rankings</CardTitle>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowLeaderboard(false)} className="w-8 h-8 rounded-full">
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto flex-1">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {globalLeaderboard.map((userRow, i) => {
                    const isCurrentUser = userRow.username === username;
                    const position = i + 1;
                    return (
                      <div key={userRow.username} className={`p-4 flex items-center justify-between ${isCurrentUser ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''}`}>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-black">{position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : `#${position}`}</span>
                          <span className="text-xs font-bold">@{userRow.username}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">{userRow.rankTier}</span>
                          <span className="text-xs font-mono font-black">{userRow.averageScore}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}