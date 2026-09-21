'use client';

import { useState, useTransition } from 'react';
import { Star, Loader2, MessageSquarePlus, CheckCircle2, AlertCircle } from 'lucide-react';
import { createPropertyReviewAction, createServiceReviewAction } from '@/app/actions/review-actions';

interface ReviewFormProps {
  bookingId?: string;
  propertyId?: string;
  serviceOrderId?: string;
  serviceId?: string;
  targetType: 'property' | 'service';
  title?: string;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Décevant',
  2: 'Moyen',
  3: 'Bien',
  4: 'Très bien',
  5: 'Parfait !',
};

export function ReviewForm({
  bookingId,
  propertyId,
  serviceOrderId,
  serviceId,
  targetType,
  title,
}: ReviewFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const activeRating = hoverRating || rating;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set('rating', String(rating));

    startTransition(async () => {
      try {
        if (targetType === 'property') {
          await createPropertyReviewAction(formData);
        } else {
          await createServiceReviewAction(formData);
        }
      } catch (err: any) {
        if (!err?.message?.includes('NEXT_REDIRECT')) {
          setError(err?.message || 'Erreur lors de la publication de votre avis.');
        }
      }
    });
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 bg-sun/10 text-sun font-semibold text-xs sm:text-sm px-4 py-2 rounded-full hover:bg-sun hover:text-white transition shadow-sm"
      >
        <MessageSquarePlus className="w-4 h-4" />
        <span>Donner mon avis sur ce séjour</span>
      </button>
    );
  }

  return (
    <div className="mt-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 p-5 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h4 className="font-display font-bold text-navy text-sm sm:text-base flex items-center gap-2">
          <Star className="w-4 h-4 fill-sun text-sun" />
          <span>Laissez un avis sur {title || (targetType === 'property' ? 'votre séjour' : 'cette prestation')}</span>
        </h4>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-xs text-navy/40 hover:text-navy font-semibold"
        >
          Annuler
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 p-3 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {bookingId && <input type="hidden" name="booking_id" value={bookingId} />}
        {propertyId && <input type="hidden" name="property_id" value={propertyId} />}
        {serviceOrderId && <input type="hidden" name="service_order_id" value={serviceOrderId} />}
        {serviceId && <input type="hidden" name="service_id" value={serviceId} />}

        {/* Sélection de la note (étoiles) */}
        <div>
          <label className="block text-xs font-semibold text-navy/70 mb-1.5 uppercase tracking-wider">
            Votre note *
          </label>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 hover:scale-110 transition-transform focus:outline-none"
              >
                <Star
                  className={`w-7 h-7 ${
                    star <= activeRating
                      ? 'fill-golden text-golden'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-xs font-bold text-navy/70">
              {RATING_LABELS[activeRating] || ''}
            </span>
          </div>
        </div>

        {/* Commentaire */}
        <div>
          <label className="block text-xs font-semibold text-navy/70 mb-1.5 uppercase tracking-wider">
            Votre commentaire <span className="text-navy/40 font-normal">(optionnel)</span>
          </label>
          <textarea
            name="comment"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Partagez vos impressions (accueil, propreté, emplacement, expérience globale)..."
            className="w-full rounded-xl border border-navy/10 bg-white p-3 text-xs sm:text-sm text-navy placeholder:text-navy/40 focus:outline-none focus:ring-2 focus:ring-sun/50"
          />
        </div>

        {/* Bouton envoi */}
        <div className="flex justify-end gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 bg-sun text-white font-bold text-xs sm:text-sm rounded-full px-5 py-2.5 shadow-md hover:bg-sun/90 transition disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publication…</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Publier mon avis</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
