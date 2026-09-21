import { Reveal } from '@/components/shared/reveal';
import { PropertyCard } from '@/components/properties/property-card';
import { getPublishedProperties } from '@/lib/listings';
import Link from 'next/link';

export async function Properties() {
  const properties = await getPublishedProperties({ limit: 8 });

  return (
    <section id="sejours" className="bg-warm py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-sun">
              Séjours
            </span>
            <h2 className="mt-4 text-balance font-display text-3xl font-bold text-navy sm:text-4xl md:text-5xl">
              Où allez-vous séjourner ?
            </h2>
          </div>
          <Link
            href="/logements"
            className="shrink-0 text-sm font-semibold text-ocean transition-colors hover:text-sun"
          >
            Voir tous les logements →
          </Link>
        </Reveal>

        {properties.length === 0 ? (
          <div className="mt-10 rounded-2xl bg-white p-10 text-center text-navy/50 ring-1 ring-navy/5">
            De nouveaux logements arrivent bientôt à Kribi. Revenez vite !
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {properties.map((property, i) => (
              <Reveal key={property.id} delay={i * 100}>
                <Link href={`/logements/${property.id}`}>
                  <PropertyCard property={property} />
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}