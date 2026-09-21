'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Heart, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { label: 'Réservations & Commandes', href: '/mon-compte/reservations', icon: Calendar },
  { label: 'Mes favoris', href: '/mon-compte/favoris', icon: Heart },
  { label: 'Mon profil', href: '/mon-compte/profil', icon: User },
];

export function AccountTabNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-2 border-b border-navy/10 overflow-x-auto no-scrollbar pb-px mb-8">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href || (tab.href === '/mon-compte/reservations' && pathname === '/mon-compte');

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-t-2xl transition-all shrink-0 border-b-2 -mb-px',
              isActive
                ? 'border-sun text-sun bg-white/80 shadow-sm'
                : 'border-transparent text-navy/60 hover:text-navy hover:bg-white/40'
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
