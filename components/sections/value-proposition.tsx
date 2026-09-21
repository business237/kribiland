import { Search, GitCompare, CalendarCheck, Heart } from 'lucide-react';
import { Reveal } from '@/components/shared/reveal';

const steps = [
  {
    number: '01',
    title: 'Trouvez',
    description: 'Les meilleurs endroits et services de Kribi.',
    icon: Search,
  },
  {
    number: '02',
    title: 'Comparez',
    description: 'Découvrez les options adaptées à vos besoins.',
    icon: GitCompare,
  },
  {
    number: '03',
    title: 'Réservez',
    description: 'Organisez vos expériences simplement.',
    icon: CalendarCheck,
  },
  {
    number: '04',
    title: 'Profitez',
    description: 'Concentrez-vous sur votre séjour.',
    icon: Heart,
  },
];

export function ValueProposition() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-sun">
            Notre approche
          </span>
          <h2 className="mt-4 text-balance font-display text-3xl font-bold text-navy sm:text-4xl md:text-5xl">
            Vous profitez de Kribi. Nous nous occupons du reste.
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <Reveal key={step.number} delay={i * 100}>
                <div className="group relative h-full rounded-2xl border border-navy/8 bg-warm p-7 transition-all duration-300 hover:border-sun/30 hover:bg-white hover:shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-3xl font-bold text-navy/15 transition-colors group-hover:text-sun/30">
                      {step.number}
                    </span>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy text-white transition-all duration-300 group-hover:bg-sun">
                      <Icon className="h-5 w-5" strokeWidth={2} />
                    </div>
                  </div>
                  <h3 className="mt-5 font-display text-xl font-bold text-navy">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy/60">
                    {step.description}
                  </p>
                  {/* Bottom accent */}
                  <div className="absolute bottom-0 left-7 right-7 h-px origin-left scale-x-0 bg-sun transition-transform duration-500 group-hover:scale-x-100" />
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
