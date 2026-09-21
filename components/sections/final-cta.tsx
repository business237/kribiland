import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/shared/reveal';

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.pexels.com/photos/20231862/pexels-photo-20231862.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop"
          alt="Coucher de soleil sur l'océan à Kribi"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/75 to-slate-950/95" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-28 text-center sm:px-6 sm:py-36 lg:px-8 lg:py-44">
        <Reveal>
          <h2 className="text-balance font-display text-3xl font-black leading-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] sm:text-4xl md:text-5xl lg:text-6xl">
            Votre prochaine escapade{' '}
            <span className="text-golden drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">commence à Kribi.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg font-medium leading-relaxed text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] sm:text-xl md:text-2xl">
            Découvrez Kribi, trouvez votre séjour et vivez la destination
            autrement.
          </p>
          <a
            href="#home"
            className="group mt-10 inline-flex items-center gap-2 rounded-full bg-sun px-8 py-4 text-sm font-semibold text-white shadow-xl shadow-sun/30 transition-all hover:bg-sun/90 hover:shadow-sun/40 active:scale-95"
          >
            Explorer Kribi
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
