import { Home, Waves, UtensilsCrossed, Bike, Sparkles } from 'lucide-react';
import { Reveal } from '@/components/shared/reveal';

const categories = [
  {
    title: 'Séjours',
    description: 'Trouver votre logement idéal.',
    icon: Home,
    image:
      'https://images.pexels.com/photos/2476632/pexels-photo-2476632.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    href: '/logements',
  },
  {
    title: 'Expériences',
    description: 'Explorer les activités incontournables.',
    icon: Waves,
    image:
      'https://images.pexels.com/photos/1189479/pexels-photo-1189479.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    href: '#experiences',
  },
  {
    title: 'Restaurants',
    description: 'Découvrir les meilleures adresses.',
    icon: UtensilsCrossed,
    image:
      'https://images.pexels.com/photos/34104580/pexels-photo-34104580.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    href: '#services',
  },
  {
    title: 'Mobilité',
    description: 'Se déplacer facilement à Kribi.',
    icon: Bike,
    image:
      'https://images.pexels.com/photos/27667777/pexels-photo-27667777.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    href: '#services',
  },
  {
    title: 'Services',
    description: 'Profiter de services pensés pour votre séjour.',
    icon: Sparkles,
    image:
      'https://images.pexels.com/photos/28833717/pexels-photo-28833717.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    href: '#services',
  },
];

export function Categories() {
  return (
    <section id="categories" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-sun">
            Catégories
          </span>
          <h2 className="mt-4 text-balance font-display text-3xl font-bold text-navy sm:text-4xl md:text-5xl">
            Tout Kribi, au même endroit.
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            const isWide = i === 0 || i === 4;
            return (
              <Reveal
                key={cat.title}
                delay={i * 80}
                className={isWide ? 'sm:col-span-2 lg:col-span-1' : ''}
              >
                <a
                  href={cat.href}
                  className="group relative block h-full overflow-hidden rounded-2xl"
                >
                  {/* Image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="h-64 w-full object-cover transition-transform duration-700 group-hover:scale-110 sm:h-72"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/30 to-transparent" />
                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-sun/95 shadow-lg shadow-sun/30 transition-transform duration-300 group-hover:scale-110">
                      <Icon className="h-5 w-5 text-white" strokeWidth={2} />
                    </div>
                    <h3 className="font-display text-xl font-bold text-white sm:text-2xl">
                      {cat.title}
                    </h3>
                    <p className="mt-1 text-sm text-white/80">
                      {cat.description}
                    </p>
                  </div>
                  {/* Hover accent */}
                  <div className="absolute bottom-0 left-0 h-1 w-0 bg-golden transition-all duration-500 group-hover:w-full" />
                </a>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
