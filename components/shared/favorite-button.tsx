'use client';

import { useState, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { toggleFavoriteAction } from '@/app/actions/favorite-actions';
import { cn } from '@/lib/utils';

export interface FavoriteButtonProps {
  propertyId?: string;
  serviceId?: string;
  activityId?: string;
  initialIsFavorite?: boolean;
  className?: string;
}

export function FavoriteButton({
  propertyId,
  serviceId,
  activityId,
  initialIsFavorite = false,
  className = '',
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const nextState = !isFavorite;
    setIsFavorite(nextState);

    const fd = new FormData();
    if (propertyId) fd.set('property_id', propertyId);
    if (serviceId) fd.set('service_id', serviceId);
    if (activityId) fd.set('activity_id', activityId);

    startTransition(async () => {
      try {
        const res = await toggleFavoriteAction(fd);
        if (res && typeof res.isFavorite === 'boolean') {
          setIsFavorite(res.isFavorite);
        }
      } catch (err: any) {
        // En cas d'erreur ou de redirection non captée
        if (!err?.message?.includes('NEXT_REDIRECT')) {
          setIsFavorite(!nextState);
        }
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        'group flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all duration-200 active:scale-90',
        isFavorite
          ? 'bg-red-500 text-white shadow-md shadow-red-500/30 hover:bg-red-600'
          : 'bg-navy/60 text-white hover:bg-navy/80 hover:text-red-400',
        className
      )}
      aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      <Heart
        className={cn(
          'h-4 w-4 transition-transform duration-200 group-hover:scale-110',
          isFavorite && 'fill-current'
        )}
      />
    </button>
  );
}
