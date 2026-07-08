'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function NavigationHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('mindsprint_user');
    setUsername(savedUser);

    if (!savedUser && pathname !== '/') {
      router.push('/');
    }
  }, [pathname, router]);

  const handleLogout = () => {
    if (confirm("Are you sure you want to sign out of your portal session?")) {
      localStorage.clear();
      router.push('/');
    }
  };

  // Hide the entire nav bar on the root authentication page
  if (pathname === '/') return null;

  // Check if user is on any main entry landing dashboard
  const isDashboardPage = pathname === '/dashboard' || pathname === '/constructor-dashboard';

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 shadow-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        
        {/* CONDITIONAL BACK BUTTON */}
        <div>
          {!isDashboardPage ? (
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all"
            >
              <span>&larr;</span> Go Back
            </button>
          ) : (
            // Empty placeholder box to maintain right-aligned profile spacing on dashboards
            <div className="w-1" />
          )}
        </div>

        {/* PROFILE STATE & LOGOUT */}
        <div className="flex items-center gap-4">
          {username && (
            <span className="text-xs text-gray-500 font-medium hidden sm:inline">
              Workspace active: <strong className="text-indigo-600 font-mono">@{username}</strong>
            </span>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200/60 text-red-600 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            🛑 Sign Out
          </button>
        </div>

      </div>
    </nav>
  );
}