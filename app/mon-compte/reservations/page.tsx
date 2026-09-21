import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth/get-current-profile';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { PaymentCard } from '@/components/property/payment-card';
import { ReviewForm } from '@/components/property/review-form';
import { CalendarDays, MapPin, Users, Wrench, Building2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export default async function AccountReservationsPage() {
  const supabase = createClient();
  const profile = await getCurrentProfile();
  if (!profile) return null;

  // 1. Réservations de logements
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      id, check_in, check_out, guests, total_price, status, payment_confirmed_by_client, created_at, rejection_reason,
      properties!inner (
        id, title, quartier, type, price_per_night,
        property_images ( url, position ),
        profiles!properties_host_id_fkey ( full_name, phone, mobile_money_number )
      )
    `)
    .eq('client_id', profile.id)
    .order('created_at', { ascending: false });

  // 2. Commandes de services
  const { data: serviceOrders } = await supabase
    .from('service_orders')
    .select(`
      id, requested_at, details, price, status, created_at, rejection_reason, service_id,
      services!inner (
        id, title, quartier, price,
        service_categories ( label )
      )
    `)
    .eq('client_id', profile.id)
    .order('created_at', { ascending: false });

  // 3. Avis existants de l'utilisateur
  const { data: userReviews } = await supabase
    .from('reviews')
    .select('booking_id, service_order_id')
    .eq('author_id', profile.id);

  const reviewedBookingIds = new Set((userReviews || []).map((r) => r.booking_id).filter(Boolean));
  const reviewedServiceOrderIds = new Set((userReviews || []).map((r) => r.service_order_id).filter(Boolean));

  // Normalisation et fusion des deux types de réservations
  const bookingItems = (bookings || []).map((b: any) => ({
    kind: 'booking' as const,
    id: b.id,
    title: b.properties?.title || 'Logement',
    location: b.properties?.quartier,
    createdAt: b.created_at,
    status: b.status,
    totalPrice: b.total_price,
    guests: b.guests,
    checkIn: b.check_in,
    checkOut: b.check_out,
    propertyId: b.properties?.id,
    image: b.properties?.property_images?.[0]?.url || '/placeholder.jpg',
    host: b.properties?.profiles,
    paymentConfirmedByClient: b.payment_confirmed_by_client,
    rejectionReason: b.rejection_reason,
    hasReview: reviewedBookingIds.has(b.id),
  }));

  const serviceItems = (serviceOrders || []).map((s: any) => ({
    kind: 'service' as const,
    id: s.id,
    serviceId: s.service_id || s.services?.id,
    title: s.services?.title || 'Service',
    location: s.services?.quartier,
    category: s.services?.service_categories?.label,
    createdAt: s.created_at,
    status: s.status,
    totalPrice: s.price,
    requestedAt: s.requested_at,
    details: s.details,
    rejectionReason: s.rejection_reason,
    hasReview: reviewedServiceOrderIds.has(s.id),
  }));

  const allItems = [...bookingItems, ...serviceItems].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-navy">
          Toutes mes réservations et demandes
        </h2>
        <span className="text-xs font-semibold text-navy/50 bg-navy/5 px-3 py-1 rounded-full">
          {allItems.length} au total
        </span>
      </div>

      {allItems.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center shadow-sm border border-navy/5 space-y-4">
          <div className="w-16 h-16 rounded-full bg-sun/10 flex items-center justify-center mx-auto text-sun">
            <Building2 className="w-8 h-8" />
          </div>
          <h3 className="font-display text-lg font-bold text-navy">Aucune demande enregistrée</h3>
          <p className="text-navy/60 text-sm max-w-md mx-auto">
            Vous n'avez pas encore envoyé de réservation de logement ou de demande de service à Kribi.
          </p>
          <Link
            href="/#sejours"
            className="inline-flex items-center justify-center bg-sun text-white font-semibold rounded-full px-6 py-3 hover:bg-sun/90 transition text-sm shadow-md shadow-sun/30"
          >
            Découvrir les hébergements
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {allItems.map((item) => {
            if (item.kind === 'booking') {
              return (
                <div
                  key={`b-${item.id}`}
                  className="rounded-3xl bg-white border border-navy/10 p-6 shadow-sm hover:shadow-md transition space-y-5"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-navy/5">
                    <div className="flex items-center gap-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-16 h-16 rounded-2xl object-cover shrink-0 bg-navy/5"
                      />
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-sun bg-sun/10 px-2 py-0.5 rounded-md inline-block mb-1">
                          Logement
                        </span>
                        <Link
                          href={`/${item.propertyId}`}
                          className="font-display font-bold text-lg text-navy hover:text-sun transition block line-clamp-1"
                        >
                          {item.title}
                        </Link>
                        <div className="flex items-center gap-3 text-xs text-navy/60 mt-0.5">
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{item.location}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{item.guests} pers.</span>
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm bg-navy/5 p-4 rounded-2xl">
                    <div>
                      <span className="text-xs text-navy/50 block font-medium uppercase tracking-wider">Arrivée</span>
                      <span className="font-semibold text-navy flex items-center gap-1.5 mt-0.5">
                        <CalendarDays className="w-4 h-4 text-sun" />
                        {formatDate(item.checkIn)}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-navy/50 block font-medium uppercase tracking-wider">Départ</span>
                      <span className="font-semibold text-navy flex items-center gap-1.5 mt-0.5">
                        <CalendarDays className="w-4 h-4 text-sun" />
                        {formatDate(item.checkOut)}
                      </span>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-xs text-navy/50 block font-medium uppercase tracking-wider">Total</span>
                      <span className="font-display font-bold text-navy text-base mt-0.5 block">
                        {item.totalPrice?.toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                  </div>

                  {(item.status === 'accepted' || item.status === 'completed') && (
                    <PaymentCard
                      bookingId={item.id}
                      totalPrice={item.totalPrice}
                      mobileMoneyNumber={item.host?.mobile_money_number}
                      hostName={item.host?.full_name}
                      paymentConfirmedByClient={item.paymentConfirmedByClient}
                      isCompleted={item.status === 'completed'}
                    />
                  )}

                  {item.status === 'completed' && (
                    <div className="pt-3 border-t border-navy/5">
                      {item.hasReview ? (
                        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Avis déposé</span>
                        </div>
                      ) : (
                        <ReviewForm
                          bookingId={item.id}
                          propertyId={item.propertyId}
                          targetType="property"
                          title={item.title}
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            }

            // Cas d'une commande de service
            return (
              <div
                key={`s-${item.id}`}
                className="rounded-3xl bg-white border border-navy/10 p-6 shadow-sm hover:shadow-md transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-navy/5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-turquoise/10 flex items-center justify-center text-turquoise shrink-0">
                      <Wrench className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-turquoise bg-turquoise/10 px-2 py-0.5 rounded-md inline-block mb-1">
                        Service {item.category ? `· ${item.category}` : ''}
                      </span>
                      <h3 className="font-display font-bold text-lg text-navy">{item.title}</h3>
                      {item.location && <p className="text-xs text-navy/60 mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" />{item.location}</p>}
                    </div>
                  </div>
                  <StatusBadge status={item.status} />
                </div>

                <div className="bg-navy/5 p-4 rounded-2xl text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-navy/80">
                  <div>
                    <span className="text-xs text-navy/50 block font-medium uppercase tracking-wider">Date souhaitée</span>
                    <span className="font-semibold text-navy mt-0.5 block">{formatDateTime(item.requestedAt)}</span>
                  </div>
                  {item.totalPrice && (
                    <div>
                      <span className="text-xs text-navy/50 block font-medium uppercase tracking-wider">Tarif indiqué</span>
                      <span className="font-bold text-navy">{item.totalPrice.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  )}
                </div>

                {item.details && (
                  <p className="text-xs text-navy/60 italic bg-gray-50 p-3 rounded-xl border border-navy/5">
                    « {item.details} »
                  </p>
                )}

                {item.status === 'completed' && (
                  <div className="pt-3 border-t border-navy/5">
                    {item.hasReview ? (
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Avis déposé</span>
                      </div>
                    ) : (
                      <ReviewForm
                        serviceOrderId={item.id}
                        serviceId={item.serviceId}
                        targetType="service"
                        title={item.title}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatDate(d: string) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateTime(d: string) {
  if (!d) return '-';
  return new Date(d).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}
