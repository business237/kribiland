import { ArrowRight, Check } from 'lucide-react';
import { Reveal } from '@/components/shared/reveal';

const benefits = [
  'Visibilité auprès des voyageurs',
  'Gestion simplifiée de vos annonces',
  'Une plateforme dédiée à Kribi',
  'Accompagnement personnalisé',
];

export function Partners() {
  return (
    <section id="partenaire" className="bg-warm py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Left: Text */}
          <Reveal>
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-sun">
              Prestataires
            </span>
            <h2 className="mt-4 text-balance font-display text-3xl font-bold text-navy sm:text-4xl md:text-5xl">
              Vous proposez une expérience à Kribi ?
            </h2>
            <p className="mt-5 text-base leading-relaxed text-navy/70 sm:text-lg">
              Rejoignez KribiLand et présentez votre établissement, votre
              activité ou votre service aux voyageurs.
            </p>

            <ul className="mt-8 space-y-3">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sun/15">
                    <Check className="h-3.5 w-3.5 text-sun" strokeWidth={3} />
                  </span>
                  <span className="text-sm font-medium text-navy/80">
                    {benefit}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/devenir-hote"
                className="group inline-flex items-center gap-2 rounded-full bg-sun px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sun/30 transition-all hover:bg-sun/90 active:scale-95"
              >
                Devenir hôte
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="/devenir-prestataire"
                className="group inline-flex items-center gap-2 rounded-full border border-navy/20 bg-white px-7 py-3.5 text-sm font-semibold text-navy shadow-sm transition-all hover:border-navy/40 hover:bg-navy/5 active:scale-95"
              >
                Devenir prestataire
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </Reveal>

          {/* Right: Visual */}
          <Reveal delay={150}>
            <div className="relative overflow-hidden rounded-3xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.pexels.com/photos/28833717/pexels-photo-28833717.jpeg?auto=compress&cs=tinysrgb&w=1000&h=700&fit=crop"
                alt="Station balnéaire à Kribi"
                className="h-80 w-full object-cover transition-transform duration-700 hover:scale-105 sm:h-96"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="glass-dark rounded-2xl p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-display text-2xl font-bold text-white">
                        100+
                      </div>
                      <div className="text-xs text-white/70">
                        Partenaires à rejoindre
                      </div>
                    </div>
                    <div className="h-px w-12 bg-white/20" />
                    <div>
                      <div className="font-display text-2xl font-bold text-golden">
                        B2B
                      </div>
                      <div className="text-xs text-white/70">
                        Marketplace à venir
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
