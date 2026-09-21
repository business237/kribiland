import { Star, MapPin, ArrowUpRight } from 'lucide-react';
import type { Property } from '@/types';

export function PropertyCard({ property }: { property: Property }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-navy/5 transition-all duration-300 hover:shadow-xl hover:ring-navy/10">
      {/* Image */}
      <div className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={property.image}
          alt={property.name}
          className="h-56 w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1 items-start">
          {property.badge && (
            <span className="rounded-full bg-sun px-3 py-1 text-xs font-semibold text-white shadow-md">
              {property.badge}
            </span>
          )}
          {property.isLongTermAvailable && (
            <span className="rounded-full bg-navy/90 text-white px-3 py-1 text-xs font-semibold shadow-md backdrop-blur-sm">
              Longue durée dispo
            </span>
          )}
          {property.type === 'hotel' && (
            <span className="rounded-full bg-navy/90 text-white px-3 py-1 text-xs font-semibold shadow-md backdrop-blur-sm">
              Hôtel
            </span>
          )}
        </div>
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-navy/80 px-2.5 py-1 backdrop-blur-sm">
          <Star className="h-3.5 w-3.5 fill-golden text-golden" />
          <span className="text-xs font-semibold text-white">
            {property.rating}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-sun">
              {property.type}
            </span>
            <h3 className="mt-1 font-display text-lg font-bold text-navy">
              {property.type === 'hotel'
                ? `${property.hotel_name || 'Hôtel'}${property.room_type_label ? ` — ${property.room_type_label}` : ''}`
                : property.name}
            </h3>
          </div>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warm text-navy transition-all duration-300 group-hover:bg-sun group-hover:text-white">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>

        <div className="mt-2 flex items-center gap-1.5 text-sm text-navy/60">
          <MapPin className="h-3.5 w-3.5" />
          <span>{property.location}</span>
        </div>

        {/* Features */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {property.features.slice(0, 3).map((feature) => (
            <span
              key={feature}
              className="rounded-full bg-warm px-2.5 py-1 text-xs text-navy/70"
            >
              {feature}
            </span>
          ))}
        </div>

        {/* Price */}
        <div className="mt-auto flex items-end justify-between pt-5">
          <div>
            {property.pricePerNight != null ? (
              <><span className="font-display text-xl font-bold text-navy">{property.pricePerNight.toLocaleString('fr-FR')}</span><span className="text-sm text-navy/60"> {property.currency}</span><span className="text-xs text-navy/50"> / nuit</span></>
            ) : property.pricePerMonth != null ? (
              <><span className="font-display text-xl font-bold text-navy">{property.pricePerMonth.toLocaleString('fr-FR')}</span><span className="text-sm text-navy/60"> {property.currency}</span><span className="text-xs text-navy/50"> / mois</span></>
            ) : null}
          </div>
          <span className="text-xs text-navy/50">
            {property.reviewCount} avis
          </span>
        </div>
      </div>
    </article>
  );
}
