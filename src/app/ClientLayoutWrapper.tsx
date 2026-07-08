'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { User, Moon, Sun, ChevronDown, LogOut } from 'lucide-react';

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAuthPage = pathname === '/' || pathname === '/signup';
  const activeUser = typeof window !== 'undefined' ? localStorage.getItem('mindsprint_user') : null;

  useEffect(() => {
    if (!activeUser && !isAuthPage) {
      router.push('/');
    }

    const isDark = localStorage.getItem('theme') === 'dark';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [pathname, router, activeUser, isAuthPage]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('mindsprint_user');
    setIsDropdownOpen(false);
    router.push('/');
  };

  const toggleDarkMode = () => {
    const newDark = !darkMode;
    setDarkMode(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <>
      {!isAuthPage && (
        <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800/80 px-6 h-16 flex items-center justify-between sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/90 dark:bg-slate-900/90">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Image 
                src="/logo.svg" 
                alt="MindSprint Logo" 
                width={140} 
                height={35} 
                className="object-contain dark:invert" 
                priority 
              />
            </div>
          </div>

          <div className="flex items-center gap-3 relative" ref={dropdownRef}>
            {activeUser && (
              <>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50/80 hover:bg-indigo-100/80 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 text-xs font-bold font-mono rounded-full border border-indigo-100 dark:border-indigo-900/60 transition-all cursor-pointer select-none"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
                  @{activeUser}
                  <ChevronDown className={`w-3 h-3 text-indigo-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full right-24 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <Link href="/profile" onClick={() => setIsDropdownOpen(false)}>
                      <span className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl transition-all cursor-pointer">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        Profile Page
                      </span>
                    </Link>

                    <button
                      type="button"
                      onClick={toggleDarkMode}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl transition-all cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-slate-400" />}
                        Theme Mode
                      </span>
                      <div className={`w-7 h-4 rounded-full p-0.5 transition-colors ${darkMode ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                        <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${darkMode ? 'translate-x-3' : 'translate-x-0'}`} />
                      </div>
                    </button>
                  </div>
                )}
              </>
            )}
            
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 border border-rose-100/60 dark:border-rose-900/30 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Log Out <LogOut className="w-3 h-3" />
            </button>
          </div>
        </header>
      )}

      <div className="flex-1">
        {children}
      </div>
    </>
  );
}