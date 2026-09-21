import React from 'react';
import { cn } from '@/lib/utils';

export interface UserAvatarProps {
  fullName?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Extrait 1 à 2 initiales en majuscules depuis le nom complet.
 * - Si plusieurs mots : 1re lettre du premier mot + 1re lettre du dernier mot.
 * - Si 1 seul mot : les 2 premières lettres.
 */
function getInitials(name?: string | null): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  const first = parts[0][0];
  const last = parts[parts.length - 1][0];
  return (first + last).toUpperCase();
}

/**
 * Palette de couleurs fixes issues de tailwind.config.ts (sun, turquoise, navy, ocean, sky, golden).
 */
const AVATAR_PALETTE = [
  'bg-sun',
  'bg-turquoise',
  'bg-navy-700',
  'bg-ocean-600',
  'bg-sky-600',
  'bg-golden-600',
] as const;

/**
 * Calcule une couleur déterministe et stable à partir d'un hash simple du nom.
 */
function getAvatarColor(name?: string | null): string {
  if (!name) return AVATAR_PALETTE[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[index];
}

const SIZE_CLASSES = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
};

export function UserAvatar({
  fullName,
  size = 'md',
  className = '',
}: UserAvatarProps) {
  const initials = getInitials(fullName);
  const bgColor = getAvatarColor(fullName);
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full text-white font-bold shrink-0 select-none shadow-sm',
        bgColor,
        sizeClass,
        className
      )}
      aria-label={fullName || 'Utilisateur'}
      title={fullName || 'Utilisateur'}
    >
      {initials}
    </div>
  );
}
