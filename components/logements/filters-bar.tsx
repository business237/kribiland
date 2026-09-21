'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import { SlidersHorizontal, X, Search } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { PROPERTY_TYPE_LABELS } from '@/lib/listing-constants';

interface FiltersBarProps {
  quartiers: string[];
}

const TYPE_OPTIONS = Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => ({ value, label }));

export function FiltersBar({ quartiers }: FiltersBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Lire les valeurs actuelles depuis l'URL
  const currentQuartier = searchParams.get('quartier') ?? '';
  const currentType = searchParams.get('type') ?? '';
  const currentPriceMin = searchParams.get('priceMin') ?? '';
  const currentPriceMax = searchParams.get('priceMax') ?? '';
  const currentGuests = searchParams.get('guests') ?? '';
  const currentCheckIn = searchParams.get('checkIn') ?? '';
  const currentCheckOut = searchParams.get('checkOut') ?? '';

  const hasFilters =
    currentQuartier || currentType || currentPriceMin || currentPriceMax ||
    currentGuests || currentCheckIn || currentCheckOut;

  const applyFilters = useCallback(
    (formData: FormData) => {
      const params = new URLSearchParams();
      const fields: Array<[string, string]> = [
        ['quartier', formData.get('quartier') as string],
        ['type', formData.get('type') as string],
        ['priceMin', formData.get('priceMin') as string],
        ['priceMax', formData.get('priceMax') as string],
        ['guests', formData.get('guests') as string],
        ['checkIn', formData.get('checkIn') as string],
        ['checkOut', formData.get('checkOut') as string],
      ];
      for (const [key, val] of fields) {
        if (val && val.trim()) params.set(key, val.trim());
      }
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname]
  );

  const clearFilters = useCallback(() => {
    startTransition(() => {
      router.push(pathname);
    });
  }, [router, pathname]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    applyFilters(new FormData(e.currentTarget));
  };

  const today = new Date().toISOString().split('T')[0];

  // --- Champs du formulaire ---
  const FilterFields = () => (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-3">
      {/* Quartier */}
      <div className="flex-1 min-w-[130px]">
        <label className="block text-[10px] font-bold uppercase tracking-widest text-navy/50 mb-1">
          Quartier
        </label>
        <select
          name="quartier"
          defaultValue={currentQuartier}
          className="w-full rounded-xl border border-navy/10 bg-white px-3 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-sun/50 appearance-none cursor-pointer"
        >
          <option value="">Tous</option>
          {quartiers.map((q) => (
            <option key={q} value={q}>
              {q}
            </option>
          ))}
        </select>
      </div>

      {/* Type de logement */}
      <div className="flex-1 min-w-[140px]">
        <label className="block text-[10px] font-bold uppercase tracking-widest text-navy/50 mb-1">
          Type
        </label>
        <select
          name="type"
          defaultValue={currentType}
          className="w-full rounded-xl border border-navy/10 bg-white px-3 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-sun/50 appearance-none cursor-pointer"
        >
          <option value="">Tous types</option>
          {TYPE_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Prix min / max */}
      <div className="flex gap-2 flex-1 min-w-[180px]">
        <div className="flex-1">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-navy/50 mb-1">
            Prix min
          </label>
          <input
            type="number"
            name="priceMin"
            defaultValue={currentPriceMin}
            min={0}
            step={1000}
            placeholder="0"
            className="w-full rounded-xl border border-navy/10 bg-white px-3 py-2.5 text-sm text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-sun/50"
          />
        </div>
        <div className="flex-1">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-navy/50 mb-1">
            Prix max
          </label>
          <input
            type="number"
            name="priceMax"
            defaultValue={currentPriceMax}
            min={0}
            step={1000}
            placeholder="∞"
            className="w-full rounded-xl border border-navy/10 bg-white px-3 py-2.5 text-sm text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-sun/50"
          />
        </div>
      </div>

      {/* Voyageurs */}
      <div className="w-full lg:w-28">
        <label className="block text-[10px] font-bold uppercase tracking-widest text-navy/50 mb-1">
          Voyageurs
        </label>
        <input
          type="number"
          name="guests"
          defaultValue={currentGuests}
          min={1}
          max={20}
          placeholder="1+"
          className="w-full rounded-xl border border-navy/10 bg-white px-3 py-2.5 text-sm text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-sun/50"
        />
      </div>

      {/* Dates */}
      <div className="flex gap-2 flex-1 min-w-[220px]">
        <div className="flex-1">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-navy/50 mb-1">
            Arrivée
          </label>
          <input
            type="date"
            name="checkIn"
            defaultValue={currentCheckIn}
            min={today}
            className="w-full rounded-xl border border-navy/10 bg-white px-3 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-sun/50"
          />
        </div>
        <div className="flex-1">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-navy/50 mb-1">
            Départ
          </label>
          <input
            type="date"
            name="checkOut"
            defaultValue={currentCheckOut}
            min={currentCheckIn || today}
            className="w-full rounded-xl border border-navy/10 bg-white px-3 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-sun/50"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 shrink-0">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-1.5 rounded-full bg-sun px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-sun/30 hover:bg-sun/90 active:scale-[0.98] transition disabled:opacity-60"
        >
          <Search className="w-3.5 h-3.5" />
          Rechercher
        </button>
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            disabled={isPending}
            className="flex items-center gap-1 rounded-full border border-navy/15 bg-white px-4 py-2.5 text-sm text-navy/70 hover:bg-navy/5 transition disabled:opacity-60"
          >
            <X className="w-3.5 h-3.5" />
            Effacer
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop : barre sticky ──────────────────────────────────── */}
      <div className="sticky top-[72px] z-30 hidden lg:block">
        <div className="border-b border-navy/8 bg-warm/95 backdrop-blur-md shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
            <form onSubmit={handleSubmit}>
              <FilterFields />
            </form>
          </div>
        </div>
      </div>

      {/* ── Mobile : bouton Filtres → Sheet ────────────────────────── */}
      <div className="lg:hidden mb-4">
        <Sheet>
          <div className="flex items-center gap-3">
            <SheetTrigger asChild>
              <button className="flex items-center gap-2 rounded-full border border-navy/15 bg-white px-4 py-2.5 text-sm font-semibold text-navy shadow-sm hover:bg-navy/5 transition">
                <SlidersHorizontal className="w-4 h-4 text-sun" />
                Filtres
                {hasFilters && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sun text-[10px] font-bold text-white">
                    !
                  </span>
                )}
              </button>
            </SheetTrigger>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 rounded-full border border-navy/15 bg-white px-3 py-2 text-xs text-navy/60 hover:bg-navy/5 transition"
              >
                <X className="w-3 h-3" />
                Effacer
              </button>
            )}
          </div>

          <SheetContent side="bottom" className="rounded-t-3xl max-h-[90vh] overflow-y-auto bg-warm">
            <SheetHeader className="mb-6">
              <SheetTitle className="font-display text-navy text-xl">Filtrer les logements</SheetTitle>
            </SheetHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                applyFilters(new FormData(e.currentTarget));
                // Fermer le sheet via un clic sur le close button (solution simple)
                const closeBtn = document.querySelector<HTMLButtonElement>('[data-radix-dialog-close]');
                closeBtn?.click();
              }}
            >
              <FilterFields />
            </form>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
