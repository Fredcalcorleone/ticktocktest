'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Target, BrainCircuit, History, User, LogOut } from 'lucide-react';
import { supabase } from '@/utils/supabase';

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();

  // Hide Top Navigation on Auth / Landing pages
  const isAuthPage = pathname === '/' || pathname === '/login' || pathname === '/signup';
  if (isAuthPage) return null;

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear user session cache
      localStorage.removeItem('mindsprint_user');
      localStorage.removeItem('mindsprint_avatar');
      
      // Redirect to home/login
      router.push('/');
    }
  };

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Goals', href: '/course', icon: Target },
    { name: 'Quiz Engine', href: '/quiz', icon: BrainCircuit },
    { name: 'History', href: '/manual-exam', icon: History },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <header className="hidden md:flex sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto w-full px-6 h-16 flex items-center justify-between">
        
        {/* BRAND LOGO USING logo.svg */}
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="relative w-14 h-14 group-hover:scale-105 transition-transform">
            <Image 
              src="/logo.svg" 
              alt="MindSprint Logo" 
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* NAVIGATION LINKS & LOGOUT BUTTON */}
        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/60 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Divider line */}
          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />

          {/* LOG OUT BUTTON */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/50 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>

      </div>
    </header>
  );
}