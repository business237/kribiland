'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Calendar, Sparkles, ArrowRight, ChevronLeft, ChevronRight, Lock } from 'lucide-react';

const HERO_SLIDES = [
  {
    url: '/images/slides/hero1.jpg',
    alt: 'Séjour d\'exception à Kribi',
  },
  {
    url: '/images/slides/hero2.jpg',
    alt: 'Plages et littoraux de Kribi',
  },
  {
    url: '/images/slides/hero3.jpg',
    alt: 'Nature et découvertes à Kribi',
  },
];

const SEARCH_TYPE_OPTIONS = [
  { value: 'tout',      label: 'Tout (logements, services, activités)' },
  { value: 'logement',  label: 'Logement' },
  { value: 'service',   label: 'Service' },
  { value: 'activite',  label: 'Activité' },
];

export function Hero() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [category, setCategory] = useState('tout');

  const today = new Date().toISOString().split('T')[0];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (category && category !== 'tout') params.set('category', category);
    if (checkIn) params.set('checkIn', checkIn);
    router.push('/recherche' + (params.toString() ? '?' + params.toString() : ''));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  return (
    <section id="home" className="relative min-h-screen w-full overflow-hidden">
      {/* Background image slider */}
      <div className="absolute inset-0 z-0">
        {HERO_SLIDES.map((slide, idx) => (
          <div
            key={slide.url}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0 pointer-events-none'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.url}
              alt={slide.alt}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
        <div className="absolute inset-0 hero-overlay z-20" />
      </div>

      {/* Content */}
      <div className="relative z-30 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 pt-28 pb-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          {/* Label */}
          <div className="reveal revealed mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-golden" />
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-white/90">
              Bienvenue à Kribi
            </span>
          </div>

          {/* Title */}
          <h1
            className="reveal revealed text-balance font-display text-4xl font-black leading-[1.1] text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] sm:text-5xl md:text-6xl lg:text-7xl"
            style={{ animationDelay: '100ms' }}
          >
            Votre séjour à Kribi{' '}
            <span className="text-golden drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">commence ici.</span>
          </h1>

          {/* Subtitle */}
          <p
            className="reveal revealed mt-6 max-w-2xl text-lg font-medium leading-relaxed text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] sm:text-xl md:text-2xl"
            style={{ animationDelay: '200ms' }}
          >
            Découvrez où dormir, quoi faire, où manger et comment profiter
            pleinement de Kribi — au même endroit.
          </p>

          {/* CTAs */}
          <div
            className="reveal revealed mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
            style={{ animationDelay: '300ms' }}
          >
            <a
              href="#decouvrir"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-sun px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-sun/30 transition-all hover:bg-sun/90 hover:shadow-sun/40 active:scale-95"
            >
              Explorer Kribi
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#experiences"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/15 active:scale-95"
            >
              Découvrir les expériences
            </a>
          </div>
        </div>

        {/* Search Bar */}
        <div
          className="reveal revealed mt-12 w-full max-w-5xl"
          style={{ animationDelay: '400ms' }}
        >
          <div className="glass rounded-2xl p-2 shadow-2xl shadow-navy/30 sm:rounded-full">
            <form
              className="flex flex-col gap-2 sm:flex-row sm:items-center"
              onSubmit={handleSearch}
            >
              {/* Où — Kribi verrouillé */}
              <div className="flex flex-1 items-center gap-3 rounded-xl px-4 py-3 bg-white/5 sm:rounded-full cursor-not-allowed select-none" title="La destination Kribi est fixe">
                <MapPin className="h-5 w-5 shrink-0 text-golden" />
                <div className="flex-1 text-left">
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-white/60">Où</span>
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-white">
                    Kribi
                    <Lock className="h-3 w-3 text-white/40" />
                  </span>
                </div>
              </div>

              <div className="hidden h-8 w-px bg-white/15 sm:block" />

              {/* Quand — Date picker */}
              <div className="flex flex-1 items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-white/5 sm:rounded-full">
                <Calendar className="h-5 w-5 shrink-0 text-golden" />
                <div className="flex-1 text-left">
                  <label htmlFor="hero-checkin" className="block text-[10px] font-semibold uppercase tracking-wider text-white/60">
                    Arrivée
                  </label>
                  <input
                    id="hero-checkin"
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={today}
                    className="w-full bg-transparent text-sm text-white placeholder-white/50 focus:outline-none [color-scheme:dark] cursor-pointer"
                  />
                </div>
              </div>

              <div className="hidden h-8 w-px bg-white/15 sm:block" />

              {/* Type — Select */}
              <div className="flex flex-1 items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-white/5 sm:rounded-full">
                <Sparkles className="h-5 w-5 shrink-0 text-golden" />
                <div className="flex-1 text-left">
                  <label htmlFor="hero-category" className="block text-[10px] font-semibold uppercase tracking-wider text-white/60">
                    Type
                  </label>
                  <select
                    id="hero-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-transparent text-sm text-white focus:outline-none cursor-pointer appearance-none [color-scheme:dark]"
                  >
                    {SEARCH_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-navy-900 text-white">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-xl bg-sun px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sun/30 transition-all hover:bg-sun/90 active:scale-95 sm:rounded-full"
              >
                <Search className="h-5 w-5" />
                <span className="sm:hidden lg:inline">Rechercher</span>
              </button>
            </form>
          </div>
          <p className="mt-3 text-center text-xs text-white/50">
            Que recherchez-vous à Kribi ?
          </p>
        </div>
      </div>

      {/* Slide Indicators & Controls */}
      <div className="absolute bottom-6 right-6 sm:bottom-8 sm:right-12 z-30 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-xl">
        <button
          type="button"
          onClick={prevSlide}
          className="p-1 text-white/70 hover:text-white transition-colors"
          aria-label="Slide précédent"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-2">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-500 ${
                idx === currentSlide ? 'w-6 bg-sun' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Aller au slide ${idx + 1}`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={nextSlide}
          className="p-1 text-white/70 hover:text-white transition-colors"
          aria-label="Slide suivant"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
}
