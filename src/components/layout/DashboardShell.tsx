'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Settings,
  Palette,
  FileText,
  PenTool,
  HelpCircle,
  Tag,
  QrCode,
  BadgeCheck,
  Calendar,
  BarChart3,
  Mail,
  BookOpen,
  Users,
} from 'lucide-react';

const topNav = [
  { label: 'Home', href: '#' },
  { label: 'Event Settings', href: '#' },
  { label: 'Registration', href: '#', active: true },
  { label: 'Companies', href: '#' },
  { label: 'Content', href: '#' },
  { label: 'Insights', href: '#' },
];

const subNav = [
  { label: 'Signups', href: '#' },
  { label: 'Ticket Types', href: '#' },
  { label: 'Coupons', href: '#' },
  { label: 'Beacon Registration', href: '#' },
  { label: 'Web Submissions', href: '#' },
  { label: 'Settings', href: '#', active: true },
];

const sidebarItems = [
  { label: 'Settings', href: '#', icon: Settings },
  { label: 'Branding', href: '#', icon: Palette },
  { label: 'Form Fields', href: '#', icon: FileText },
  { label: 'Themes', href: '#', icon: PenTool },
  { label: 'Questions', href: '#', icon: HelpCircle },
  { label: 'Attributes', href: '#', icon: Tag },
  { label: 'Registration QR Code', href: '#', icon: QrCode },
  { label: 'Badge Designer', href: '/badge-designer', icon: BadgeCheck },
];

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Top header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-800 text-white rounded flex items-center justify-center text-xs font-bold">
              EV
            </div>
            <div>
              <div className="text-xs text-gray-500">Event</div>
              <div className="text-sm font-semibold text-gray-900">My Event</div>
            </div>
          </div>
          <nav className="flex items-center gap-6">
            {topNav.map((item) => (
              <span
                key={item.label}
                className={`text-sm cursor-pointer ${
                  item.active
                    ? 'text-gray-900 font-semibold'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {item.label}
              </span>
            ))}
          </nav>
          <div className="w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center text-xs font-bold">
            R
          </div>
        </div>
        {/* Sub navigation */}
        <div className="flex items-center gap-6 px-6 h-10 border-t border-gray-100">
          {subNav.map((item) => (
            <span
              key={item.label}
              className={`text-sm cursor-pointer ${
                item.active
                  ? 'text-gray-900 font-medium border-b-2 border-gray-900 pb-2'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {item.label}
            </span>
          ))}
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside className="w-52 border-r border-gray-200 bg-gray-50/50 py-2 overflow-y-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href !== '#' && pathname.startsWith(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto min-h-0">{children}</main>
      </div>
    </div>
  );
}
