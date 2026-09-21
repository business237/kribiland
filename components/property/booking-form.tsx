'use client';

import { useState, useTransition, useEffect } from 'react';
import { createBookingAction } from '@/app/actions/order-actions';
import { getUnavailableDates } from '@/app/actions/booking-availability';
import { Calendar } from '@/components/ui/calendar';
import { Users, AlertCircle, Loader2, ArrowRight, LogIn, Clock, CalendarDays, ChevronDown, CalendarCheck, Zap } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { format, isBefore, startOfToday, parseISO, addMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

interface BookingFormProps {
  propertyId: string;
  pricePerNight: number;
  minNights: number;
  maxNights?: number | null;
  capacity: number;
  isLoggedIn: boolean;
  initialError?: string;
  rentalMode?: string | null;
  pricePerMonth?: number | null;
  minMonths?: number | null;
  depositAmount?: number | null;
}

function diffDays(from: Date, to: Date): number {
  const d = (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.round(d));
}

export function BookingForm({
  propertyId,
  pricePerNight,
  minNights,
  maxNights,
  capacity,
  isLoggedIn,
  initialError,
  rentalMode = 'courte_duree',
  pricePerMonth,
  minMonths = 1,
  depositAmount,
}: BookingFormProps) {
  const today = startOfToday();
  const supportsLongTerm = rentalMode === 'longue_duree' || rentalMode === 'les_deux' || !!pricePerMonth;
  const supportsShortTerm = rentalMode !== 'longue_duree';

  const [bookingType, setBookingType] = useState<'nuitee' | 'longue_duree'>(
    rentalMode === 'longue_duree' ? 'longue_duree' : 'nuitee'
  );

  // Mode Nuitée (Calendrier)
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Mode Longue Durée (Entrée + mois)
  const [entryDate, setEntryDate] = useState<string>(format(today, 'yyyy-MM-dd'));
  const [monthsCount, setMonthsCount] = useState<number>(minMonths && minMonths > 0 ? minMonths : 1);

  const [guests, setGuests] = useState(1);
  const [error, setError] = useState<string | null>(initialError || null);
  const [isPending, startTransition] = useTransition();

  // Dates indisponibles (Mode Nuitée)
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  const [loadingDates, setLoadingDates] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoadingDates(true);
    getUnavailableDates(propertyId)
      .then((dates) => {
        if (!cancelled) {
          setUnavailableDates(dates.map((d) => parseISO(d)));
          setLoadingDates(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoadingDates(false);
      });
    return () => { cancelled = true; };
  }, [propertyId]);

  // Calculs Nuitée
  const checkIn = range?.from;
  const checkOut = range?.to;
  const nights = checkIn && checkOut ? diffDays(checkIn, checkOut) : 0;
  const nightlyTotal = nights * pricePerNight;

  // Calculs Longue Durée
  const effectivePricePerMonth = pricePerMonth || pricePerNight * 30;
  const longTermTotal = effectivePricePerMonth * monthsCount;
  const grandTotal = longTermTotal + (depositAmount || 0);
  let parsedEntryDate: Date | null = null;
  let longTermCheckOutDate: Date | null = null;
  try {
    if (entryDate) {
      parsedEntryDate = parseISO(entryDate);
      longTermCheckOutDate = addMonths(parsedEntryDate, monthsCount);
    }
  } catch {
    parsedEntryDate = null;
    longTermCheckOutDate = null;
  }

  const currentTotal = bookingType === 'longue_duree' ? longTermTotal : nightlyTotal;

  // Dates désactivées pour calendrier Nuitée
  const disabledDays = [
    { before: today },
    ...unavailableDates,
  ];

  const validate = (): string | null => {
    if (guests < 1 || guests > capacity) return `Capacité : 1 à ${capacity} personnes.`;

    if (bookingType === 'longue_duree') {
      if (!entryDate || !parsedEntryDate) return "Veuillez sélectionner la date d'entrée.";
      if (parsedEntryDate < today) return "La date d'entrée ne peut pas être dans le passé.";
      if (monthsCount < (minMonths || 1)) return `Durée minimale : ${minMonths || 1} mois.`;
    } else {
      if (!checkIn || !checkOut) return 'Veuillez sélectionner vos dates de séjour.';
      if (nights < minNights) return `Durée minimale : ${minNights} nuit(s).`;
      if (maxNights && nights > maxNights) return `Durée maximale : ${maxNights} nuits.`;
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError(null);

    const fd = new FormData(e.currentTarget);
    fd.set('booking_type', bookingType);

    if (bookingType === 'longue_duree') {
      fd.set('check_in', entryDate);
      fd.set('check_out', longTermCheckOutDate ? format(longTermCheckOutDate, 'yyyy-MM-dd') : entryDate);
      fd.set('total_price', String(grandTotal));
    } else {
      fd.set('check_in', format(checkIn!, 'yyyy-MM-dd'));
      fd.set('check_out', format(checkOut!, 'yyyy-MM-dd'));
      fd.set('total_price', String(nightlyTotal));
    }

    startTransition(async () => {
      try {
        await createBookingAction(fd);
      } catch (ex: any) {
        if (!ex?.message?.includes('NEXT_REDIRECT')) {
          setError('Une erreur est survenue. Veuillez réessayer.');
        }
      }
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-navy/5 text-center space-y-4">
        <p className="text-navy/70 text-sm">
          Connectez-vous pour envoyer une demande de réservation à l&apos;hôte.
        </p>
        <a
          href={`/connexion?redirect=${encodeURIComponent(`/logements/${propertyId}`)}`}
          className="inline-flex items-center gap-2 bg-sun text-white font-semibold rounded-full px-6 py-3 hover:bg-sun/90 transition text-sm shadow-md"
        >
          <LogIn className="w-4 h-4" />
          Se connecter pour réserver
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Toggle Mode de Réservation (Nuitée / Longue Durée) */}
      {supportsLongTerm && (
        <div className="flex rounded-xl bg-gray-100 p-1 ring-1 ring-navy/5">
          {supportsShortTerm && (
            <button
              type="button"
              onClick={() => { setBookingType('nuitee'); setError(null); }}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
                bookingType === 'nuitee'
                  ? 'bg-white text-navy shadow-sm'
                  : 'text-navy/60 hover:text-navy'
              }`}
            >
              🌙 Nuitée
            </button>
          )}
          <button
            type="button"
            onClick={() => { setBookingType('longue_duree'); setError(null); }}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
              bookingType === 'longue_duree'
                ? 'bg-white text-navy shadow-sm'
                : 'text-navy/60 hover:text-navy'
            }`}
          >
            🏢 Longue durée (Mois)
          </button>
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="flex-1">{error}</span>
          <button type="button" onClick={() => setError(null)} className="text-red-400 hover:text-red-600 font-bold leading-none">×</button>
        </div>
      )}

      {/* Inputs selon le mode sélectionné */}
      {bookingType === 'nuitee' ? (
        /* MODE NUITÉE : Calendrier Range */
        <div>
          <label className="block text-xs font-bold text-navy/60 uppercase tracking-wider mb-1.5">
            <span className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" />Dates du séjour</span>
          </label>
          <button
            type="button"
            onClick={() => setCalendarOpen((v) => !v)}
            className="w-full flex items-center justify-between rounded-xl border border-navy/10 bg-gray-50 px-4 py-3 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-sun/50 hover:bg-gray-100 transition"
          >
            <span className={!checkIn ? 'text-navy/40' : ''}>
              {checkIn && checkOut
                ? `${format(checkIn, 'd MMM', { locale: fr })} → ${format(checkOut, 'd MMM yyyy', { locale: fr })}`
                : checkIn
                ? `${format(checkIn, 'd MMM yyyy', { locale: fr })} — choisir départ`
                : 'Sélectionner arrivée & départ'}
            </span>
            <ChevronDown className={`w-4 h-4 text-navy/40 transition-transform ${calendarOpen ? 'rotate-180' : ''}`} />
          </button>

          {calendarOpen && (
            <div className="mt-2 rounded-2xl border border-navy/8 bg-white shadow-xl overflow-hidden p-1 sm:p-2">
              {loadingDates ? (
                <div className="flex items-center justify-center py-8 text-navy/40 text-sm gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Chargement des disponibilités…
                </div>
              ) : (
                <>
                  <div className="px-2 pt-2 pb-1 text-[11px] text-navy/50 font-medium text-center">
                    Les jours grisés sont déjà réservés
                  </div>
                  <Calendar
                    mode="range"
                    selected={range}
                    onSelect={(r) => {
                      setRange(r);
                      if (r?.from && r?.to) setCalendarOpen(false);
                    }}
                    disabled={disabledDays}
                    numberOfMonths={1}
                    showOutsideDays={false}
                    locale={fr}
                    fromDate={today}
                    className="p-1 sm:p-3"
                    classNames={{
                      day_selected: 'bg-sun text-white hover:bg-sun hover:text-white focus:bg-sun focus:text-white',
                      day_range_middle: 'aria-selected:bg-sun/15 aria-selected:text-navy rounded-none',
                      day_range_start: 'bg-sun text-white rounded-l-full',
                      day_range_end: 'bg-sun text-white rounded-r-full',
                      day_today: 'border border-sun/50 text-navy font-bold',
                      day_disabled: 'text-navy/25 line-through cursor-not-allowed opacity-40',
                    }}
                  />
                  {range?.from && !range?.to && (
                    <p className="text-center text-xs text-sun font-medium pb-2">
                      Sélectionnez votre date de départ
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        /* MODE LONGUE DURÉE : Date d'entrée + Nombre de mois */
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-navy/60 uppercase tracking-wider mb-1.5">
              <span className="flex items-center gap-1"><CalendarCheck className="w-3.5 h-3.5" />Date d'entrée souhaitée</span>
            </label>
            <input
              type="date"
              required
              min={format(today, 'yyyy-MM-dd')}
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              className="w-full rounded-xl border border-navy/10 bg-gray-50 px-4 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-sun/50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-navy/60 uppercase tracking-wider mb-1.5">
              <span>Nombre de mois (min. {minMonths || 1} mois)</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                required
                min={minMonths || 1}
                value={monthsCount}
                onChange={(e) => setMonthsCount(Math.max(minMonths || 1, Number(e.target.value)))}
                className="w-full rounded-xl border border-navy/10 bg-gray-50 px-4 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-sun/50"
              />
              <span className="text-sm font-semibold text-navy/70 shrink-0">mois</span>
            </div>
          </div>

          {longTermCheckOutDate && (
            <p className="text-xs text-navy/60 bg-blue-50/70 border border-blue-100 rounded-lg p-2.5">
              📅 Fin prévisionnelle du contrat : <strong>{format(longTermCheckOutDate, 'd MMMM yyyy', { locale: fr })}</strong>
            </p>
          )}
        </div>
      )}

      {/* Voyageurs */}
      <div>
        <label className="block text-xs font-bold text-navy/60 uppercase tracking-wider mb-1.5">
          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />Voyageurs / Occupants</span>
        </label>
        <input
          type="number"
          name="guests"
          required
          min={1}
          max={capacity}
          value={guests}
          onChange={e => setGuests(Number(e.target.value))}
          className="w-full rounded-xl border border-navy/10 bg-gray-50 px-3 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-sun/50"
        />
        <p className="text-xs text-navy/40 mt-1">Max. {capacity} personnes</p>
      </div>

      {/* Récapitulatif ou invitation à sélectionner des dates */}
      {bookingType === 'nuitee' && nights === 0 && (
        <p className="text-center text-xs font-medium text-navy/50 py-1">
          Ajoutez vos dates pour voir le prix total
        </p>
      )}

      {bookingType === 'nuitee' && nights > 0 && pricePerNight != null && (
        <div className="rounded-xl bg-navy/5 px-4 py-3 text-sm text-navy space-y-1">
          <div className="flex justify-between">
            <span>{pricePerNight.toLocaleString('fr-FR')} FCFA × {nights} nuit{nights > 1 ? 's' : ''}</span>
            <span className="font-bold">{nightlyTotal.toLocaleString('fr-FR')} FCFA</span>
          </div>
        </div>
      )}

      {bookingType === 'longue_duree' && monthsCount > 0 && effectivePricePerMonth != null && (
        <div className="rounded-xl bg-navy/5 px-4 py-3 text-sm text-navy space-y-1">
          <div className="flex justify-between">
            <span>{effectivePricePerMonth.toLocaleString('fr-FR')} FCFA × {monthsCount} mois</span>
            <span className="font-bold">{longTermTotal.toLocaleString('fr-FR')} FCFA</span>
          </div>
          {depositAmount != null && <div className="flex justify-between"><span>Caution</span><span>{depositAmount.toLocaleString('fr-FR')} FCFA</span></div>}
          {depositAmount != null && <div className="flex justify-between border-t border-navy/10 pt-1"><span className="font-bold">Total à payer à la signature</span><span className="font-bold">{grandTotal.toLocaleString('fr-FR')} FCFA</span></div>}
        </div>
      )}

      {/* Hidden inputs */}
      <input type="hidden" name="property_id" value={propertyId} />
      <input type="hidden" name="booking_type" value={bookingType} />
      <input type="hidden" name="total_price" value={currentTotal} />

      {/* CTA */}
      <button
        type="submit"
        disabled={
          isPending ||
          (bookingType === 'nuitee' ? nights === 0 : monthsCount < (minMonths || 1) || !entryDate)
        }
        className="w-full flex items-center justify-center gap-2 bg-sun text-white font-bold rounded-full py-3.5 shadow-lg shadow-sun/30 hover:bg-sun/90 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {isPending
          ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Réservation en cours…</span></>
          : <><span>Réserver</span><ArrowRight className="w-4 h-4" /></>}
      </button>

      {/* Message réservation instantanée */}
      <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-amber-900 text-xs">
        <Zap className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
        <span>
          <strong>Réservation instantanée.</strong> Vous allez être redirigé vers le paiement juste après.
        </span>
      </div>
    </form>
  );
}

