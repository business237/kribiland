'use client';

import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: 'div' | 'section' | 'article' | 'li' | 'span';
}

export function Reveal({ children, className, delay = 0, as = 'div' }: RevealProps) {
  const Tag = as;
  const ref = useRef<HTMLElement>(null);
  // null = pas encore monté (SSR), false = monté mais pas visible, true = visible
  const [isRevealed, setIsRevealed] = useState<boolean | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          observer.unobserve(entry.target);
        } else {
          // Initialise à false une fois monté (évite le mismatch SSR)
          setIsRevealed((prev) => (prev === null ? false : prev));
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <Tag
      ref={ref as any}
      // suppressHydrationWarning évite l'erreur React si la classe diffère entre SSR et client
      suppressHydrationWarning
      className={cn('reveal', isRevealed === true && 'revealed', className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
