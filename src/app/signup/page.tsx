'use client';

import React, { useState, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/utils/supabase';
import Link from 'next/link';
import Image from 'next/image';

export default function SignUpPortal() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const usernameInputRef = useRef<HTMLInputElement>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanUsername = username.trim().toLowerCase();
    const cleanName = fullName.trim(); // Already converted to uppercase via state handler
    const cleanPassword = password;

    if (!cleanUsername || !cleanPassword || !cleanName) {
      alert("Please fill in all registration fields.");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from('app_users')
        .insert({
          username: cleanUsername,
          name: cleanName,
          password_hash: cleanPassword,
          role: 'student'
        });

      if (error) {
        if (error.code === '23505') {
          alert("This username is already taken. Please choose a different handle.");
          setUsername('');
          setLoading(false);
          setTimeout(() => usernameInputRef.current?.focus(), 50);
          return;
        }
        throw error;
      }

      localStorage.setItem('mindsprint_user', cleanUsername);
      window.location.href = `${window.location.origin}/dashboard`;

    } catch (err: any) {
      console.error("Signup validation sequence anomaly:", err);
      alert(`System Error: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50/40 flex flex-col items-center justify-center p-4 antialiased">
      
      {/* BRANDING HEADER */}
      <div className="text-center space-y-2 mb-6 flex flex-col items-center">
        <Image 
          src="/logo.svg" 
          alt="MindSprint Logo" 
          width={300} 
          height={300} 
          className="object-contain mb-2" 
          priority 
        />
        <h1 className="text-xl font-black text-slate-900 tracking-tight">SIGN-UP</h1>
        
      </div>

      {/* AUTH CARD CORE CONTAINER */}
      <Card className="w-full max-w-md border-slate-200/80 shadow-xl bg-white rounded-3xl overflow-hidden p-6">
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100">
          <h2 className="text-sm font-black text-slate-800 tracking-tight">Portal Sign Up</h2>
          <span className="text-[10px] font-mono font-bold uppercase bg-indigo-50 px-2 py-0.5 rounded text-indigo-600 tracking-wider">
            Student Account
          </span>
        </div>

        <form className="space-y-4" onSubmit={handleRegister}>
          {/* FULL NAME FIELD */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Enter Full Name</label>
            <Input 
              type="text" 
              placeholder="e.g., IRFAN KHALIS BIN NORHAMIDI" 
              value={fullName}
              // FIXED: Forces any user input text instantly into UPPERCASE letters as they type
              onChange={(e) => setFullName(e.target.value.toUpperCase())}
              className="rounded-xl border-slate-200 text-xs font-medium h-10 bg-white uppercase font-mono tracking-wide"
              disabled={loading}
              required
            />
          </div>

          {/* USERNAME FIELD */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Enter Username</label>
            <Input 
              ref={usernameInputRef}
              type="text" 
              placeholder="e.g., irfan_khalis" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded-xl border-slate-200 text-xs font-medium h-10 bg-white"
              disabled={loading}
              required
            />
          </div>

          {/* SECURITY PASS ACCESS KEY */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">Enter Password</label>
            <div className="relative flex items-center">
              <Input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••••••••••" 
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
          <div className="flex gap-3 pt-3">
            <Button 
              type="submit" 
              disabled={loading}
              className="w-1/2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-10 rounded-xl shadow-sm"
            >
              {loading ? "Creating Account..." : "Complete Registration"}
            </Button>

            <Link href="/" className="w-1/2">
              <Button 
                type="button"
                disabled={loading}
                className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs h-10 rounded-xl shadow-none"
              >
                Back to Login
              </Button>
            </Link>
          </div>
        </form>
      </Card>

      <p className="text-[10px] text-slate-400 mt-4 font-medium tracking-wide">
        © 2026 MindSprint. Developed by Irfan Khalis. All rights reserved. Powered by the Gemini AI Engine to deliver real-time, intelligent assessment generation.
      </p>
    </main>
  );
}