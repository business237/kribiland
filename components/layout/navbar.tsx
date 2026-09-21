'use client';

import { useEffect, useState, useRef } from 'react';
import { Menu, X, Compass, ChevronDown, User, LogOut, Calendar, LayoutDashboard, Home, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import { useCurrentProfileClient } from '@/lib/hooks/use-current-profile-client';
import { UserAvatar } from '@/components/shared/user-avatar';
import { signOutAction } from '@/app/actions/auth-actions';

const navLinks = [
  { label: 'Découvrir', href: '/#decouvrir' },
  { label: 'Séjours', href: '/#sejours' },
  { label: 'Expériences', href: '/#experiences' },
  { label: 'Restaurants', href: '/#restaurants' },
  { label: 'Services', href: '/#services' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { profile, loading } = useCurrentProfileClient();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isPartner = profile && ['host', 'provider', 'admin'].includes(profile.role);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/95 backdrop-blur-xl border-b border-gray-200/80 shadow-lg shadow-black/5 py-3'
          : 'bg-white/90 backdrop-blur-md border-b border-gray-100/60 shadow-sm py-4'
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo Original (kribiland_logo_transparent.png) */}
        <a href="/" className="group flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo/kribiland_logo_transparent.png"
            alt="KribiLand Logo"
            className="h-11 sm:h-13 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </a>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-bold text-navy/90 hover:text-sun transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-4 lg:flex">
          {loading ? (
            <div className="h-9 w-24 bg-gray-200 rounded-full animate-pulse" />
          ) : profile ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2.5 rounded-full bg-slate-100 p-1.5 pr-3 text-slate-800 transition-all hover:bg-slate-200 focus:outline-none ring-1 ring-slate-200"
              >
                <UserAvatar fullName={profile.full_name} size="sm" />
                <span className="text-sm font-semibold max-w-[120px] truncate">
                  {profile.full_name}
                </span>
                <ChevronDown className={cn("w-4 h-4 text-slate-500 transition-transform duration-200", dropdownOpen && "rotate-180")} />
              </button>

              {/* Menu Déroulant */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-navy/10 text-navy z-50 animate-in fade-in-50 zoom-in-95">
                  <div className="px-3 py-2 border-b border-navy/5 mb-1">
                    <p className="text-xs text-navy/50 font-medium">Connecté en tant que</p>
                    <p className="text-sm font-bold text-navy truncate">{profile.full_name}</p>
                  </div>

                  <a
                    href="/mon-compte"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-navy/80 hover:bg-navy/5 hover:text-navy transition-colors"
                  >
                    <User className="w-4 h-4 text-sun" />
                    <span>Mon compte</span>
                  </a>

                  <a
                    href="/mon-compte/reservations"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-navy/80 hover:bg-navy/5 hover:text-navy transition-colors"
                  >
                    <Calendar className="w-4 h-4 text-turquoise" />
                    <span>Mes réservations</span>
                  </a>

                  {isPartner && (
                    <a
                      href="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-navy/80 hover:bg-navy/5 hover:text-navy transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-sky-600" />
                      <span>Tableau de bord</span>
                    </a>
                  )}

                  <div className="my-1 border-t border-navy/5" />
                  <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-navy/30">Élargir mon activité</p>
                  <a
                    href="/devenir-hote"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 hover:text-amber-800 transition-colors"
                  >
                    <Home className="w-4 h-4 text-amber-500" />
                    <span>Devenir hôte</span>
                  </a>
                  <a
                    href="/devenir-prestataire"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                  >
                    <Wrench className="w-4 h-4 text-emerald-500" />
                    <span>Devenir prestataire</span>
                  </a>

                  <div className="my-1 border-t border-navy/5" />

                  <form action={signOutAction}>
                    <button
                      type="submit"
                      className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Se déconnecter</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <>
              <a
                href="/connexion"
                className="text-sm font-bold text-navy/90 hover:text-sun transition-colors"
              >
                Se connecter
              </a>
              <a
                href="/devenir-hote"
                className="inline-flex items-center rounded-full bg-sun px-5 py-2 text-sm font-semibold text-white shadow-md shadow-sun/30 transition-colors hover:bg-sun/90"
              >
                Devenir hôte
              </a>
              <a
                href="/devenir-prestataire"
                className="text-sm font-semibold text-navy/60 hover:text-navy transition-colors"
              >
                Prestataire&nbsp;?
              </a>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-lg text-navy transition-colors hover:bg-slate-100 lg:hidden"
              aria-label="Ouvrir le menu"
            >
              <Menu className="h-6 w-6 text-navy" />
            </button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-full border-l-0 bg-white text-navy p-0 sm:max-w-sm"
          >
            <div className="flex h-full flex-col bg-white text-navy">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                <SheetTitle className="font-display text-lg font-bold text-navy">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/logo/kribiland_logo_transparent.png"
                    alt="KribiLand Logo"
                    className="h-10 w-auto object-contain"
                  />
                </SheetTitle>
                <SheetClose asChild>
                  <button
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-navy/70 transition-colors hover:bg-slate-100 hover:text-navy"
                    aria-label="Fermer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </SheetClose>
              </div>

              <div className="flex flex-1 flex-col gap-1 px-4 py-6">
                {profile && (
                  <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-2xl bg-slate-100 text-navy">
                    <UserAvatar fullName={profile.full_name} size="md" />
                    <div className="overflow-hidden">
                      <p className="font-bold text-sm truncate text-navy">{profile.full_name}</p>
                      <p className="text-xs text-navy/60 capitalize">{profile.role}</p>
                    </div>
                  </div>
                )}

                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-4 py-3 text-base font-bold text-navy hover:bg-slate-50 hover:text-sun transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>

              <div className="flex flex-col gap-3 border-t border-gray-100 px-6 py-6">
                {profile ? (
                  <>
                    <a
                      href="/mon-compte"
                      onClick={() => setOpen(false)}
                      className="rounded-full bg-slate-100 px-5 py-3 text-center text-sm font-semibold text-navy transition-colors hover:bg-slate-200"
                    >
                      Mon compte
                    </a>
                    <a
                      href="/mon-compte/reservations"
                      onClick={() => setOpen(false)}
                      className="rounded-full bg-slate-100 px-5 py-3 text-center text-sm font-semibold text-navy transition-colors hover:bg-slate-200"
                    >
                      Mes réservations
                    </a>
                    {isPartner && (
                      <a
                        href="/dashboard"
                        onClick={() => setOpen(false)}
                        className="rounded-full bg-sun px-5 py-3 text-center text-sm font-semibold text-white shadow-md transition-colors hover:bg-sun/90"
                      >
                        Tableau de bord
                      </a>
                    )}
                    <div className="pt-1 border-t border-gray-100">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-navy/40 text-center mb-2">Élargir mon activité</p>
                      <div className="flex gap-2">
                        <a
                          href="/devenir-hote"
                          onClick={() => setOpen(false)}
                          className="flex-1 rounded-full bg-amber-50 border border-amber-200 px-3 py-2.5 text-center text-xs font-bold text-amber-800 transition-colors hover:bg-amber-100"
                        >
                          🏠 Devenir hôte
                        </a>
                        <a
                          href="/devenir-prestataire"
                          onClick={() => setOpen(false)}
                          className="flex-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-2.5 text-center text-xs font-bold text-emerald-800 transition-colors hover:bg-emerald-100"
                        >
                          🔧 Prestataire
                        </a>
                      </div>
                    </div>
                    <form action={signOutAction} className="mt-2">
                      <button
                        type="submit"
                        className="w-full rounded-full border border-red-200 px-5 py-3 text-center text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                      >
                        Se déconnecter
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <a
                      href="/connexion"
                      onClick={() => setOpen(false)}
                      className="rounded-full border border-gray-300 px-5 py-3 text-center text-sm font-bold text-navy transition-colors hover:bg-slate-50"
                    >
                      Se connecter
                    </a>
                    <a
                      href="/devenir-hote"
                      onClick={() => setOpen(false)}
                      className="rounded-full bg-sun px-5 py-3 text-center text-sm font-bold text-white shadow-md shadow-sun/30 transition-colors hover:bg-sun/90"
                    >
                      Devenir hôte
                    </a>
                    <a
                      href="/devenir-prestataire"
                      onClick={() => setOpen(false)}
                      className="rounded-full border border-gray-300 px-5 py-3 text-center text-sm font-semibold text-navy transition-colors hover:bg-slate-50"
                    >
                      Devenir prestataire
                    </a>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
