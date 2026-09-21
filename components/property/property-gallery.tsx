'use client';

import { useState } from 'react';
import { Grid3x3, Share2, X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { FavoriteButton } from '@/components/shared/favorite-button';

interface PropertyGalleryProps {
  propertyId: string;
  title: string;
  mainImage: string;
  images: Array<{ id: string; url: string }>;
  initialIsFavorite: boolean;
}

export function PropertyGallery({
  propertyId,
  title,
  mainImage,
  images,
  initialIsFavorite,
}: {
  propertyId: string;
  title: string;
  mainImage: string;
  images: Array<{ id: string; url: string }>;
  initialIsFavorite: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  // Reconstruct all images array ensuring mainImage is first if not included
  const allImages = images.length > 0 
    ? images 
    : [{ id: 'main', url: mainImage }];

  const secondaryImages = allImages.slice(1, 5);

  const handleOpenAt = (index: number) => {
    setActiveIndex(index);
    setIsOpen(true);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % allImages.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // User cancelled share dialog or fallback
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="w-full">
      {/* Title & Actions Bar (Airbnb Style) */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-bold tracking-tight text-navy sm:text-3xl md:text-4xl">
          {title}
        </h1>

        <div className="flex items-center gap-3 shrink-0">
          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-2 rounded-full border border-navy/15 bg-white px-4 py-2 text-xs font-semibold text-navy shadow-sm transition-all hover:bg-warm active:scale-95 sm:text-sm"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" />
                <span className="text-emerald-700">Lien copié !</span>
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4 text-navy/70" />
                <span>Partager</span>
              </>
            )}
          </button>

          {/* Favorite Button */}
          <div className="inline-flex items-center gap-2 rounded-full border border-navy/15 bg-white px-3 py-1.5 shadow-sm transition-all hover:bg-warm sm:px-4 sm:py-2">
            <FavoriteButton
              propertyId={propertyId}
              initialIsFavorite={initialIsFavorite}
              className="h-7 w-7 text-navy/70 hover:text-rose-500"
            />
            <span className="pr-1 text-xs font-semibold text-navy sm:text-sm">Enregistrer</span>
          </div>
        </div>
      </div>

      {/* Grid Container (Strict Airbnb Rectangular 2:1 Aspect Ratio Layout) */}
      <div className="relative h-[280px] w-full overflow-hidden rounded-2xl shadow-md sm:h-[380px] md:h-[440px] lg:h-[480px]">
        <div className="grid h-full w-full grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-2.5">
          {/* Main Large Image (Left 50% on desktop) */}
          <div
            onClick={() => handleOpenAt(0)}
            className={`group relative h-full w-full cursor-pointer overflow-hidden ${
              secondaryImages.length > 0 ? 'sm:col-span-2 sm:row-span-2' : 'sm:col-span-4 sm:row-span-2'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={allImages[0]?.url || mainImage}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 group-hover:brightness-95"
            />
            <div className="absolute inset-0 bg-black/5 opacity-0 transition-opacity group-hover:opacity-10" />
          </div>

          {/* 4 Secondary Images (Right 2x2 Grid) */}
          {secondaryImages.map((img, idx) => (
            <div
              key={img.id || idx}
              onClick={() => handleOpenAt(idx + 1)}
              className="group relative hidden h-full w-full cursor-pointer overflow-hidden sm:block"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt=""
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 group-hover:brightness-95"
              />
              <div className="absolute inset-0 bg-black/5 opacity-0 transition-opacity group-hover:opacity-10" />
            </div>
          ))}
        </div>

        {/* Floating Button "Afficher toutes les photos" */}
        <button
          type="button"
          onClick={() => handleOpenAt(0)}
          className="absolute bottom-4 right-4 z-10 flex items-center gap-2 rounded-xl border border-navy/15 bg-white/95 px-3.5 py-2 text-xs font-semibold text-navy shadow-lg backdrop-blur-md transition-all hover:bg-white hover:shadow-xl active:scale-95 sm:text-sm"
        >
          <Grid3x3 className="h-4 w-4 text-navy" />
          <span>Afficher les {allImages.length} photos</span>
        </button>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/95 text-white backdrop-blur-md animate-in fade-in duration-200">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <span className="text-sm font-semibold tracking-wider text-white/80">
              {activeIndex + 1} / {allImages.length}
            </span>
            <span className="hidden sm:block font-medium text-sm text-white/70 truncate max-w-md">
              {title}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Fermer"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Main Viewer */}
          <div className="relative flex-1 flex items-center justify-center p-4 sm:p-8">
            {/* Previous Button */}
            {allImages.length > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-4 z-20 rounded-full bg-black/40 p-3 text-white backdrop-blur-sm border border-white/15 transition-all hover:bg-black/70 hover:scale-105"
                aria-label="Photo précédente"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {/* Current Image */}
            <div className="max-h-[80vh] max-w-[90vw] overflow-hidden rounded-xl shadow-2xl flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={allImages[activeIndex]?.url}
                alt={`${title} photo ${activeIndex + 1}`}
                className="max-h-[78vh] max-w-[88vw] object-contain select-none"
              />
            </div>

            {/* Next Button */}
            {allImages.length > 1 && (
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-4 z-20 rounded-full bg-black/40 p-3 text-white backdrop-blur-sm border border-white/15 transition-all hover:bg-black/70 hover:scale-105"
                aria-label="Photo suivante"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>

          {/* Thumbnails Footer */}
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto p-4 justify-center border-t border-white/10 max-w-full">
              {allImages.map((img, idx) => (
                <button
                  key={img.id || idx}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg transition-all ${
                    idx === activeIndex
                      ? 'ring-2 ring-golden scale-105 opacity-100'
                      : 'opacity-50 hover:opacity-80'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
