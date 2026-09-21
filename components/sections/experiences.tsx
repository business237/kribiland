import { Star, Clock, MapPin, ArrowUpRight } from 'lucide-react';
import { Reveal } from '@/components/shared/reveal';
import { mockExperiences } from '@/data/mock-experiences';

export function Experiences() {
  return (
    <section id="experiences" className="bg-navy py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-golden">
              Expériences
            </span>
            <h2 className="mt-4 text-balance font-display text-3xl font-bold text-white sm:text-4xl md:text-5xl">
              Que voulez-vous vivre à Kribi ?
            </h2>
          </div>
          <a
            href="#"
            className="shrink-0 text-sm font-semibold text-golden transition-colors hover:text-sun"
          >
            Voir toutes les expériences →
          </a>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mockExperiences.map((exp, i) => (
            <Reveal key={exp.id} delay={i * 80}>
              <article className="group relative h-full overflow-hidden rounded-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={exp.image}
                  alt={exp.title}
                  className="h-72 w-full object-cover transition-transform duration-700 group-hover:scale-110 sm:h-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/95 via-navy/40 to-transparent" />

                {/* Top badges */}
                <div className="absolute left-4 top-4 flex items-center gap-2">
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    {exp.category}
                  </span>
                </div>
                <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-navy/70 px-2.5 py-1 backdrop-blur-sm">
                  <Star className="h-3.5 w-3.5 fill-golden text-golden" />
                  <span className="text-xs font-semibold text-white">
                    {exp.rating}
                  </span>
                </div>

                {/* Bottom content */}
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="font-display text-xl font-bold text-white">
                    {exp.title}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-sm text-white/75">
                    {exp.description}
                  </p>
                  <div className="mt-3 flex items-center gap-4 text-xs text-white/60">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {exp.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {exp.duration}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <span className="font-display text-lg font-bold text-golden">
                        {exp.price.toLocaleString('fr-FR')} {exp.currency}
                      </span>
                    </div>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-300 group-hover:bg-sun group-hover:scale-110">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
