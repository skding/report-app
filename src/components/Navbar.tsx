'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  LogOut,
  User,
  ShieldCheck,
  Wrench,
  Building,
  Settings as SettingsIcon,
  Menu,
} from 'lucide-react';
import { UserSession } from '@/lib/types';

interface NavbarProps {
  user: UserSession | null;
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function Navbar({ user, toggleSidebar, isSidebarOpen }: NavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error('Logout failed:', e);
    }
  };

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 select-none">
      {/* Left: Brand & Sidebar toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          title="Toggle Navigation Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="h-9 flex items-center">
            <img
              src="/cloverdigital-logo.png"
              alt="Clover Digital"
              className="max-h-8 max-w-full object-contain"
            />
          </div>
          <div className="hidden sm:block border-l border-slate-700 pl-3">
            <h1 className="text-sm font-bold text-white leading-none group-hover:text-emerald-400 transition-colors">
              Service Report Portal
            </h1>
            <p className="text-[10px] text-slate-400 leading-none mt-1">
              Clover Digital Sdn Bhd
            </p>
          </div>
        </Link>
      </div>

      {/* Right: Quick Action & User Profile */}
      <div className="flex items-center gap-3">
        <Link
          href="/reports/new"
          className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-950/60 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Report</span>
        </Link>

        {/* User Info Capsule */}
        <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-800">
          <Link
            href="/profile"
            className="flex items-center gap-2 p-1.5 hover:bg-slate-800/80 rounded-xl transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 font-bold text-xs">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'CD'}
            </div>
            <div className="text-left leading-tight">
              <p className="text-xs font-semibold text-white truncate max-w-[120px]">
                {user?.name || 'User'}
              </p>
              <span className="text-[10px] font-medium text-emerald-400 flex items-center gap-0.5">
                {user?.role === 'ADMIN' ? (
                  <ShieldCheck className="w-3 h-3" />
                ) : (
                  <Wrench className="w-3 h-3" />
                )}
                {user?.role || 'ENGINEER'}
              </span>
            </div>
          </Link>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
