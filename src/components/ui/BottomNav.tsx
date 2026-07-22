'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Target, Brain, History, User } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Goals', href: '/course', icon: Target },
    { name: 'Quiz', href: '/quiz', icon: Brain, primary: true },
    { name: 'History', href: '/manual-exam', icon: History },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  return (
    /* md:hidden ensures this ONLY appears on mobile screen sizes (< 768px) */
    <div className="fixed bottom-6 inset-x-0 mx-auto w-[90%] max-w-md z-50 pointer-events-auto md:hidden">
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.08)] rounded-full px-4 py-2 flex items-center justify-between">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.primary) {
            return (
              <Link key={item.name} href={item.href} className="relative -top-2">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 hover:scale-105 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
                isActive ? 'text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-1 font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}