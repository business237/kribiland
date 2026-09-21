import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth/get-current-profile';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { PropertyGallery } from '@/components/property/property-gallery';
import { AmenitiesSection } from '@/components/property/amenities-section';
import { BookingForm } from '@/components/property/booking-form';
import { PropertyMap } from '@/components/shared/property-map';
import { UserAvatar } from '@/components/shared/user-avatar';
import {
  PROPERTY_TYPE_LABELS,
  FALLBACK_PROPERTY_IMAGE,
  ELECTRICITY_LABELS,
  WATER_SOURCE_LABELS,
  ROAD_ACCESS_LABELS,
} from '@/lib/listing-constants';
import { notFound } from 'next/navigation';
import {
  MapPin,
  Star,
  Users,
  Bed,
  Bath,
  Home,
  ShieldCheck,
  Zap,
  Droplets,
  Navigation,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export const revalidate = 0;

interface PropertyPageProps {
  params: { id: string };
  searchParams: { error?: string; booking_error?: string; success?: string };
}

export default async function PropertyDetailPage({ params, searchParams }: PropertyPageProps) {
  const supabase = createClient();
  const profile = await getCurrentProfile();

  // 1. Récupérer le logement
  const { data: property } = await supabase
    .from('properties')
    .select(`
      *,
      property_images ( id, url, position ),
      property_amenities ( amenities ( id, label, icon, category ) ),
      profiles:host_id ( id, full_name, avatar_url, created_at, phone, verification_status )
    `)
    .eq('id', params.id)
    .single();

  if (!property) {
    notFound();
  }

  // Si le logement n'est pas publié et que l'utilisateur n'est ni l'hôte ni un admin
  if (property.status !== 'published') {
    const isOwnerOrAdmin = profile && (profile.id === property.host_id || profile.role === 'admin');
    if (!isOwnerOrAdmin) {
      notFound();
    }
  }

  // 2. Vérifier si l'utilisateur l'a en favori
  let isFavorite = false;
  if (profile) {
    const { data: fav } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', profile.id)
      .eq('property_id', property.id)
      .single();
    isFavorite = !!fav;
  }

  // 3. Charger les avis
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      id, rating, comment, created_at,
      profiles:user_id ( full_name, avatar_url )
    `)
    .eq('property_id', property.id)
    .order('created_at', { ascending: false });

  // Préparation des images
  const rawImages = (property.property_images || []).sort(
    (a: any, b: any) => (a.position ?? 0) - (b.position ?? 0)
  );
  const images = rawImages.map((img: any) => ({ id: img.id, url: img.url }));
  const mainImage = images[0]?.url || FALLBACK_PROPERTY_IMAGE;

  // Préparation des équipements
  const amenities = (property.property_amenities || [])
    .map((pa: any) => pa.amenities)
    .filter(Boolean);

  const host = property.profiles;
  const propertyTypeLabel = PROPERTY_TYPE_LABELS[property.type] || property.type;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-warm/30 pt-24 pb-8 sm:pt-28 sm:pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Banner de statut si l'hôte prévisualise une annonce non publiée */}
          {property.status !== 'published' && (
            <div className="mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 text-amber-900 flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-amber-600 shrink-0" />
              <p className="text-sm font-medium">
                Vous prévisualisez ce logement (Statut : <strong className="capitalize">{property.status}</strong>).
                {property.status === 'pending' && ' En attente de validation par l\'équipe administrative KribiLand.'}
              </p>
            </div>
          )}

          {/* Galerie Photos (Style Airbnb) */}
          <PropertyGallery
            propertyId={property.id}
            title={property.title}
            mainImage={mainImage}
            images={images}
            initialIsFavorite={isFavorite}
          />

          {/* Main Layout Grid */}
          <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-3">
            
            {/* Colonne Gauche : Détails, Hôte, Équipements, Règles, Carte */}
            <div className="lg:col-span-2 space-y-10">

              {/* En-tête Logement & Caractéristiques */}
              <div className="border-b border-navy/10 pb-8">
                <div className="flex flex-wrap items-center gap-3 text-sm text-navy/70">
                  <span className="font-semibold text-navy uppercase tracking-wider">{propertyTypeLabel}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-sun" />
                    {property.quartier || 'Kribi'}
                  </span>
                  {property.hotel_name && (
                    <>
                      <span>•</span>
                      <span className="font-medium text-navy/90">{property.hotel_name}</span>
                    </>
                  )}
                </div>

                {/* Synthèse des capacités */}
                <div className="mt-4 flex flex-wrap items-center gap-6 rounded-2xl bg-white p-4 ring-1 ring-navy/10 shadow-sm text-sm font-medium text-navy">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-sun" />
                    <span>{property.capacity} voyageur{property.capacity > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bed className="h-5 w-5 text-sun" />
                    <span>{property.bedrooms || 1} chambre{property.bedrooms > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="h-5 w-5 text-sun" />
                    <span>{property.bathrooms || 1} salle{property.bathrooms > 1 ? 's' : ''} de bain</span>
                  </div>
                  {property.living_rooms != null && property.living_rooms > 0 && (
                    <div className="flex items-center gap-2">
                      <Home className="h-5 w-5 text-sun" />
                      <span>{property.living_rooms} salon{property.living_rooms > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Hôte */}
              {host && (
                <div className="flex items-center justify-between border-b border-navy/10 pb-8">
                  <div className="flex items-center gap-4">
                    <UserAvatar fullName={host.full_name} size="lg" className="ring-2 ring-sun/30" />
                    <div>
                      <h2 className="font-display text-lg font-bold text-navy">
                        Hébergé par {host.full_name || 'Hôte KribiLand'}
                      </h2>
                      <p className="text-xs text-navy/60">
                        {host.verification_status === 'verified'
                          ? '✓ Hôte vérifié par KribiLand'
                          : 'Membre KribiLand'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              {property.description && (
                <div className="border-b border-navy/10 pb-8">
                  <h2 className="font-display text-xl font-bold text-navy mb-3">À propos de ce logement</h2>
                  <p className="text-navy/80 leading-relaxed whitespace-pre-line text-base">
                    {property.description}
                  </p>
                </div>
              )}

              {/* Section Spécifique Longue Durée (Si applicable) */}
              {(property.rental_mode === 'longue_duree' || property.rental_mode === 'les_deux' || property.price_per_month) && (
                <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm space-y-4">
                  <h2 className="font-display text-xl font-bold text-navy flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-sun" />
                    Conditions Longue Durée
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    {property.price_per_month && (
                      <div className="rounded-xl bg-warm/50 p-3">
                        <span className="block text-xs font-semibold text-navy/60">Loyer Mensuel</span>
                        <span className="text-lg font-bold text-navy">{property.price_per_month.toLocaleString('fr-FR')} FCFA / mois</span>
                      </div>
                    )}
                    {property.deposit_amount && (
                      <div className="rounded-xl bg-warm/50 p-3">
                        <span className="block text-xs font-semibold text-navy/60">Caution demandée</span>
                        <span className="text-lg font-bold text-navy">{property.deposit_amount.toLocaleString('fr-FR')} FCFA</span>
                      </div>
                    )}
                    {property.electricity_type && (
                      <div className="flex items-center gap-2 text-navy/80">
                        <Zap className="h-4 w-4 text-sun" />
                        <span>Électricité : <strong>{ELECTRICITY_LABELS[property.electricity_type] || property.electricity_type}</strong></span>
                      </div>
                    )}
                    {property.water_source && (
                      <div className="flex items-center gap-2 text-navy/80">
                        <Droplets className="h-4 w-4 text-sun" />
                        <span>Eau : <strong>{WATER_SOURCE_LABELS[property.water_source] || property.water_source}</strong></span>
                      </div>
                    )}
                    {property.road_access && (
                      <div className="flex items-center gap-2 text-navy/80">
                        <Navigation className="h-4 w-4 text-sun" />
                        <span>Accès : <strong>{ROAD_ACCESS_LABELS[property.road_access] || property.road_access}</strong></span>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-3 sm:col-span-2 pt-2">
                      {property.is_fenced && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold"><CheckCircle2 className="h-3.5 w-3.5" /> Clôturé</span>}
                      {property.has_gate && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold"><CheckCircle2 className="h-3.5 w-3.5" /> Portail</span>}
                      {property.is_furnished && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold"><CheckCircle2 className="h-3.5 w-3.5" /> Meublé</span>}
                    </div>
                  </div>
                </div>
              )}

              {/* Équipements */}
              <AmenitiesSection amenities={amenities} />

              {/* Règles de la maison */}
              {property.house_rules && property.house_rules.length > 0 && (
                <div className="border-b border-navy/10 pb-8">
                  <h2 className="font-display text-xl font-bold text-navy mb-4">Règles de la maison</h2>
                  <ul className="space-y-2 text-navy/80 text-sm">
                    {property.house_rules.map((rule: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-sun" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Localisation sur la carte */}
              {property.latitude != null && property.longitude != null && (
                <div className="border-b border-navy/10 pb-8">
                  <h2 className="font-display text-xl font-bold text-navy mb-4">Où se situe le logement</h2>
                  <p className="text-sm text-navy/60 mb-4 flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-sun" />
                    {property.quartier || 'Kribi'}, Cameroun
                  </p>
                  <div className="h-[350px] w-full overflow-hidden rounded-2xl ring-1 ring-navy/10">
                    <PropertyMap
                      latitude={property.latitude}
                      longitude={property.longitude}
                      title={property.title}
                    />
                  </div>
                </div>
              )}

              {/* Avis & Commentaires */}
              <div className="pt-4">
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="font-display text-2xl font-bold text-navy">Avis des voyageurs</h2>
                  {property.average_rating > 0 && (
                    <div className="flex items-center gap-1 bg-sun/10 text-sun-700 px-3 py-1 rounded-full text-sm font-bold">
                      <Star className="h-4 w-4 fill-sun text-sun" />
                      <span>{property.average_rating.toFixed(1)}</span>
                      <span className="text-navy/60 font-normal">({reviews?.length || 0})</span>
                    </div>
                  )}
                </div>

                {reviews && reviews.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    {reviews.map((rev: any) => (
                      <div key={rev.id} className="rounded-2xl bg-white p-4 ring-1 ring-navy/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <UserAvatar fullName={rev.profiles?.full_name} size="sm" />
                            <span className="font-semibold text-sm text-navy">{rev.profiles?.full_name || 'Voyageur'}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            {rev.rating}
                          </div>
                        </div>
                        <p className="text-xs text-navy/70 line-clamp-3">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-navy/60 mb-6">Aucun avis pour le moment sur ce logement.</p>
                )}

                {/* Message pour laisser un avis si connecté */}
                {profile && (
                  <div className="rounded-2xl bg-white border border-navy/10 p-4 text-center text-sm text-navy/70 shadow-sm">
                    Vous avez séjourné ici ?{' '}
                    <a href="/mon-compte/reservations" className="font-semibold text-sun hover:underline">
                      Laissez votre avis depuis Mes réservations
                    </a>
                    .
                  </div>
                )}
              </div>

            </div>

            {/* Colonne Droite : Formulaire de Réservation Sticky */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 rounded-3xl border border-navy/10 bg-white p-6 shadow-xl space-y-6">
                
                {/* En-tête Prix */}
                <div className="flex items-baseline justify-between border-b border-navy/10 pb-4">
                  <div>
                    <span className="font-display text-3xl font-extrabold text-navy">
                      {property.price_per_night?.toLocaleString('fr-FR')}
                    </span>
                    <span className="text-xs font-bold text-navy/60 uppercase ml-1">FCFA / nuit</span>
                  </div>
                  {property.average_rating > 0 && (
                    <div className="flex items-center gap-1 text-sm font-semibold text-navy">
                      <Star className="h-4 w-4 fill-sun text-sun" />
                      <span>{property.average_rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {/* Formulaire de réservation */}
                <BookingForm
                  propertyId={property.id}
                  pricePerNight={property.price_per_night}
                  minNights={property.min_nights || 1}
                  maxNights={property.max_nights}
                  capacity={property.capacity}
                  isLoggedIn={!!profile}
                  initialError={searchParams.booking_error || searchParams.error}
                  rentalMode={property.rental_mode}
                  pricePerMonth={property.price_per_month}
                  minMonths={property.min_months}
                  depositAmount={property.deposit_amount}
                />

              </div>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}