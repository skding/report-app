'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Building2,
  ListChecks,
  Users,
  UserCheck,
  Settings,
  PlusCircle,
  Wrench,
  Activity,
  ClipboardList,
} from 'lucide-react';
import { UserSession } from '@/lib/types';

interface SidebarProps {
  isOpen: boolean;
  user: UserSession | null;
}

export default function Sidebar({ isOpen, user }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'All Reports',
      href: '/reports',
      icon: FileText,
      subItems: [
        { label: "Service (ESR)", href: '/reports?type=SERVICE', icon: Wrench },
        { label: 'Site / Remote (DSR)', href: '/reports?type=SITE_WORK', icon: Activity },
        { label: 'Maintenance (PMR)', href: '/reports?type=MAINTENANCE', icon: ClipboardList },
      ],
    },
    {
      label: 'Customers & Sites',
      href: '/customers',
      icon: Building2,
    },
    {
      label: 'Checklist Templates',
      href: '/templates',
      icon: ListChecks,
    },
  ];

  const adminItems = [
    {
      label: 'Staff Directory',
      href: '/users',
      icon: Users,
    },
    {
      label: 'System & SMTP',
      href: '/settings',
      icon: Settings,
    },
  ];

  return (
    <aside
      className={`${
        isOpen ? 'w-64' : 'w-0 -translate-x-full md:w-16 md:translate-x-0'
      } bg-slate-900/95 border-r border-slate-800 transition-all duration-200 flex flex-col flex-shrink-0 z-30 select-none overflow-hidden`}
    >
      <div className="flex-1 py-4 px-2 space-y-6 overflow-y-auto custom-scrollbar">
        {/* Main Navigation */}
        <div className="space-y-1">
          <p
            className={`px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 ${
              !isOpen && 'md:hidden'
            }`}
          >
            Workspaces
          </p>

          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <div key={item.href} className="space-y-1">
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-600/15 text-emerald-400 border border-emerald-500/20 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                  title={item.label}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span className={`${!isOpen && 'md:hidden'} truncate`}>{item.label}</span>
                </Link>

                {/* Sub items if open */}
                {isOpen && item.subItems && (
                  <div className="pl-7 space-y-0.5 pt-0.5">
                    {item.subItems.map((sub) => {
                      const SubIcon = sub.icon;
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] text-slate-400 hover:text-emerald-300 hover:bg-slate-800/40 transition-colors"
                        >
                          <SubIcon className="w-3 h-3 text-slate-500" />
                          <span>{sub.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Administration Section */}
        {user?.role === 'ADMIN' && (
          <div className="space-y-1 pt-4 border-t border-slate-800">
            <p
              className={`px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 ${
                !isOpen && 'md:hidden'
              }`}
            >
              Admin Control
            </p>
            {adminItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-600/15 text-emerald-400 border border-emerald-500/20 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                  title={item.label}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span className={`${!isOpen && 'md:hidden'} truncate`}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* Profile */}
        <div className="space-y-1 pt-4 border-t border-slate-800">
          <Link
            href="/profile"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
              pathname === '/profile'
                ? 'bg-emerald-600/15 text-emerald-400 border border-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="My Profile & Signature"
          >
            <UserCheck className="w-4 h-4 flex-shrink-0" />
            <span className={`${!isOpen && 'md:hidden'} truncate`}>Signature & Security</span>
          </Link>
        </div>
      </div>

      {/* Footer Info */}
      <div className={`p-3 border-t border-slate-800 bg-slate-950/60 ${!isOpen && 'md:hidden'}`}>
        <p className="text-[10px] text-slate-500 text-center font-mono">
          Clover Digital v1.0 • 1080p
        </p>
      </div>
    </aside>
  );
}
