'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, Target, BrainCircuit, History, User } from 'lucide-react';

export function TopNav() {
  const pathname = usePathname();

  // Hide Top Navigation on Auth / Landing pages
  const isAuthPage = pathname === '/' || pathname === '/login' || pathname === '/signup';
  if (isAuthPage) return null;

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

        {/* NAVIGATION LINKS */}
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

      </div>
    </header>
  );
}