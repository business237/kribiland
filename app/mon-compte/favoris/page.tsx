import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth/get-current-profile';
import { FavoriteButton } from '@/components/shared/favorite-button';
import { FALLBACK_PROPERTY_IMAGE, PROPERTY_TYPE_LABELS } from '@/lib/listing-constants';
import { Star, MapPin, Heart, Building2, Wrench, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export default async function AccountFavoritesPage() {
  const supabase = createClient();
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const { data: favorites } = await supabase
    .from('favorites')
    .select(`
      id, created_at, property_id, service_id, activity_id,
      properties (
        id, title, quartier, type, price_per_night, capacity, bedrooms, average_rating, review_count,
        property_images ( url, position )
      ),
      services (
        id, title, quartier, price, description,
        service_categories ( label )
      ),
      activities (
        id, title, quartier, indicative_price, description,
        activity_images ( url, position )
      )
    `)
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false });

  const favList = favorites || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-navy">Mes favoris</h2>
        <span className="text-xs font-semibold text-navy/50 bg-navy/5 px-3 py-1 rounded-full">
          {favList.length} enregistré(s)
        </span>
      </div>

      {favList.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center shadow-sm border border-navy/5 space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto text-red-500">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="font-display text-lg font-bold text-navy">Aucun favori enregistre</h3>
          <p className="text-navy/60 text-sm max-w-md mx-auto">
            Cliquez sur le cœur d'une annonce de logement ou de service pour la retrouver rapidement ici.
          </p>
          <Link
            href="/#sejours"
            className="inline-flex items-center justify-center bg-sun text-white font-semibold rounded-full px-6 py-3 hover:bg-sun/90 transition text-sm shadow-md shadow-sun/30"
          >
            Explorer les annonces
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favList.map((fav: any) => {
            const prop = fav.properties;
            const serv = fav.services;
            const act = fav.activities;

            // Cas d'un logement
            if (prop) {
              const images = [...(prop.property_images || [])].sort((a: any, b: any) => a.position - b.position);
              const thumb = images[0]?.url || FALLBACK_PROPERTY_IMAGE;

              return (
                <article
                  key={fav.id}
                  className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-navy/5 transition-all duration-300 hover:shadow-xl hover:ring-navy/10"
                >
                  <div className="relative overflow-hidden h-52">
                    <div className="absolute top-3 right-3 z-20">
                      <FavoriteButton propertyId={prop.id} initialIsFavorite={true} />
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumb}
                      alt={prop.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-navy/80 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                      {PROPERTY_TYPE_LABELS[prop.type] || prop.type}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/${prop.id}`} className="font-display text-lg font-bold text-navy hover:text-sun transition line-clamp-1">
                        {prop.title}
                      </Link>
                    </div>

                    <div className="mt-2 flex items-center gap-1.5 text-xs text-navy/60">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{prop.quartier}</span>
                    </div>

                    {prop.price_per_night != null && <div className="mt-auto flex items-end justify-between pt-5 border-t border-navy/5">
                      <div>
                        <span className="font-display text-lg font-bold text-navy">
                          {prop.price_per_night?.toLocaleString('fr-FR')}
                        </span>
                        <span className="text-xs text-navy/60"> FCFA / nuit</span>
                      </div>
                      <Link
                        href={`/${prop.id}`}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-navy/5 text-navy group-hover:bg-sun group-hover:text-white transition-all"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </div>}
                  </div>
                </article>
              );
            }

            // Cas d'un service
            if (serv) {
              return (
                <article
                  key={fav.id}
                  className="flex flex-col justify-between rounded-3xl bg-white p-5 shadow-sm ring-1 ring-navy/5 space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-turquoise/10 flex items-center justify-center text-turquoise shrink-0">
                        <Wrench className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-turquoise bg-turquoise/10 px-2 py-0.5 rounded-md">
                          {serv.service_categories?.label || 'Service'}
                        </span>
                        <h3 className="font-display font-bold text-base text-navy mt-1 line-clamp-1">{serv.title}</h3>
                      </div>
                    </div>
                    <FavoriteButton serviceId={serv.id} initialIsFavorite={true} />
                  </div>

                  {serv.quartier && (
                    <p className="text-xs text-navy/60 flex items-center gap-1"><MapPin className="w-3 h-3" />{serv.quartier}</p>
                  )}

                  {serv.price && (
                    <div className="pt-3 border-t border-navy/5">
                      <span className="text-xs text-navy/50 block">Tarif</span>
                      <span className="font-bold text-navy text-sm">{serv.price}</span>
                    </div>
                  )}
                </article>
              );
            }

            return null;
          })}
        </div>
      )}
    </div>
  );
}
