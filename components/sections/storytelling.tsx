import { Reveal } from '@/components/shared/reveal';

export function Storytelling() {
  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.pexels.com/photos/723534/pexels-photo-723534.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&fit=crop"
          alt="Plage de Kribi au coucher du soleil"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 section-overlay" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 py-28 sm:px-6 sm:py-36 lg:px-8 lg:py-44">
        <Reveal className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-golden">
            Destination
          </p>
          <h2 className="mt-6 text-balance font-display text-3xl font-black leading-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] sm:text-4xl md:text-5xl lg:text-6xl">
            Un séjour. Une ville.
            <br />
            <span className="text-golden drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">Une infinité d'expériences.</span>
          </h2>
          <p className="mx-auto mt-8 max-w-2xl text-lg font-medium leading-relaxed text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] sm:text-xl">
            L'océan qui murmure sur le sable, le soleil qui caresse la côte, la
            nature qui s'éveille dans la forêt, la culture qui vibre dans chaque
            rue, la gastronomie qui raconte le Cameroun, et l'hospitalité qui
            vous accueille comme chez vous.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-white/70">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-sky" />
              Océan
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-golden" />
              Soleil
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-turquoise" />
              Nature
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-sun" />
              Culture
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-sky" />
              Gastronomie
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-golden" />
              Hospitalité
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
