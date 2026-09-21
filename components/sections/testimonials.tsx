import { Star, Quote } from 'lucide-react';
import { Reveal } from '@/components/shared/reveal';
import { mockTestimonials } from '@/data/mock-testimonials';

export function Testimonials() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-sun">
            Témoignages
          </span>
          <h2 className="mt-4 text-balance font-display text-3xl font-bold text-navy sm:text-4xl md:text-5xl">
            Ce que disent les voyageurs.
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {mockTestimonials.map((t, i) => (
            <Reveal key={t.id} delay={i * 120}>
              <figure className="relative flex h-full flex-col rounded-2xl border border-navy/8 bg-warm p-7 transition-all duration-300 hover:shadow-lg">
                <Quote className="h-8 w-8 text-sun/20" />
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-navy/75">
                  {t.text}
                </blockquote>
                <div className="mt-5 flex items-center gap-1">
                  {Array.from({ length: t.rating }).map((_, idx) => (
                    <Star
                      key={idx}
                      className="h-4 w-4 fill-golden text-golden"
                    />
                  ))}
                </div>
                <figcaption className="mt-5 flex items-center gap-3 border-t border-navy/8 pt-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="h-11 w-11 rounded-full object-cover ring-2 ring-sun/20"
                  />
                  <div>
                    <div className="font-semibold text-navy">{t.name}</div>
                    <div className="text-xs text-navy/50">
                      {t.role} — {t.location}
                    </div>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-navy/40">
          Témoignages de démonstration — facilement remplaçables par de vrais
          avis clients
        </p>
      </div>
    </section>
  );
}
