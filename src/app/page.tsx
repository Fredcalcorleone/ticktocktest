'use client';

import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/utils/supabase';
import Link from 'next/link';
import Image from 'next/image'; // FIXED: Missing import added

export default function AuthPortal() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password;

    if (!cleanUsername || !cleanPassword) {
      alert("Please enter both your username and security code access key.");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('username', cleanUsername)
        .single();

      if (error || !data) {
        alert("Invalid username identifier credentials.");
        setLoading(false);
        return;
      }

      if (data.password_hash !== cleanPassword) {
        alert("Invalid password credential lock match.");
        setLoading(false);
        return;
      }

      localStorage.setItem('mindsprint_user', cleanUsername);
      window.location.href = `${window.location.origin}/dashboard`;

    } catch (err: any) {
      console.error("Authentication interaction error:", err);
      alert(`System Error: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50/40 flex flex-col items-center justify-center p-4 antialiased">
      
      {/* BRANDING HEADER */}
      <div className="text-center space-y-2 mb-6 flex flex-col items-center">
        {/* FIXED: Scaled down from 300x300 to a standard clean size so it fits inside the view layout nicely */}
        <Image 
          src="/logo.svg" 
          alt="MindSprint Logo" 
          width={400} 
          height={60} 
          className="object-contain mb-2" 
          priority 
        />      
      </div>

      {/* AUTH CARD CONTAINER */}
      <Card className="w-full max-w-md border-slate-200/80 shadow-xl bg-white rounded-3xl overflow-hidden p-6">
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100">
          <h2 className="text-sm font-black text-slate-800 tracking-tight">Portal Sign In</h2>
          <span className="text-[10px] font-mono font-bold uppercase bg-indigo-50 px-2 py-0.5 rounded text-indigo-600 tracking-wider">
            Student View
          </span>
        </div>

        <form className="space-y-4" onSubmit={handleSignIn}>
          {/* USERNAME FIELD */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Username</label>
            <Input 
              type="text" 
              placeholder="enter username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded-xl border-slate-200 text-xs font-medium h-10 bg-white"
              disabled={loading}
              required
            />
          </div>

          {/* SECURITY PASS ACCESS KEY */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Password</label>
            <div className="relative flex items-center">
              <Input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl border-slate-200 text-xs font-medium h-10 pr-10 bg-white"
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-400 hover:text-slate-600"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-3 pt-2">
            <Link href="/signup" className="w-1/2">
              <Button 
                type="button"
                disabled={loading}
                className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs h-10 rounded-xl shadow-none"
              >
                Sign Up +
              </Button>
            </Link>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-1/2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-10 rounded-xl shadow-sm"
            >
              {loading ? "Verifying..." : "Sign In →"}
            </Button>
          </div>
        </form>
      </Card>

      <p className="text-[10px] text-slate-400 mt-4 font-medium tracking-wide">
        © 2026 MindSprint. Developed by Irfan Khalis. All rights reserved. Powered by the Gemini AI Engine to deliver real-time, intelligent assessment generation.
      </p>
    </main>
  );
}