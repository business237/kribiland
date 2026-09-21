"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOutAction } from '@/app/actions/auth-actions';
import type { Profile } from '@/lib/auth/get-current-profile';

export function AdminSidebar({ profile }: { profile: Profile }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const NAV_ITEMS = [
    { href: '/admin', label: "📊 Vue d'ensemble" },
    { href: '/admin/utilisateurs', label: '👥 Utilisateurs' },
    { href: '/admin/annonces', label: '📋 Annonces' },
    { href: '/admin/transactions', label: '💳 Transactions' },
    { href: '/admin/retraits', label: '🏧 Retraits & Versements' },
  ];

  return (
    <>
      {/* --- En-tête mobile Admin (Visible sur mobile < md) --- */}
      <header className="md:hidden sticky top-0 z-40 bg-navy-900 text-white px-4 py-3.5 flex items-center justify-between shadow-md border-b border-navy-700">
        <Link href="/admin" className="flex items-center gap-1.5">
          <span className="font-display text-xl font-bold tracking-tight text-white">
            KRIBI<span className="text-sun">LAND</span>
          </span>
          <span className="text-[10px] bg-red-950 text-red-300 font-bold px-2 py-0.5 rounded-full border border-red-800">
            ADMIN
          </span>
        </Link>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          type="button"
          className="p-2 rounded-xl bg-navy-800 text-navy-100 hover:text-white focus:outline-none border border-navy-700 transition"
          aria-label="Toggle admin navigation"
        >
          {mobileOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </header>

      {/* --- Overlay sombre sur mobile --- */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* --- Drawer Mobile & Sidebar Desktop --- */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 md:w-64 bg-navy-900 text-white flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        } min-h-screen shrink-0 border-r border-navy-800`}
      >
        <div className="px-6 py-6 border-b border-navy-800 flex items-center justify-between">
          <div>
            <span className="font-display text-2xl font-bold tracking-tight text-white">
              KRIBI<span className="text-sun">LAND</span>
            </span>
            <p className="text-xs text-sun-200 font-medium mt-0.5">Back-office admin</p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1 text-navy-200 hover:text-white"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-semibold transition ${
                  isActive
                    ? 'bg-sun text-white font-bold shadow-md shadow-sun/30'
                    : 'text-navy-100 hover:bg-navy-800 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-6 py-4 border-t border-navy-800 bg-navy-950/60">
          <p className="text-sm font-bold text-white truncate">{profile.full_name}</p>
          <p className="text-xs text-navy-200 truncate mb-2">{profile.email}</p>
          <form action={signOutAction}>
            <button
              type="submit"
              className="w-full text-left text-xs font-bold text-red-400 hover:text-red-300 transition py-1 cursor-pointer"
            >
              🚪 Se déconnecter
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}