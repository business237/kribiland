import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth/get-current-profile';
import { redirect, notFound } from 'next/navigation';
import { clientConfirmPaymentAction } from '@/app/actions/order-actions';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import {
  CalendarDays,
  MapPin,
  Users,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export const revalidate = 0;

interface PaymentPageProps {
  params: { id: string };
  searchParams: { error?: string };
}

export default async function BookingPaymentPage({ params, searchParams }: PaymentPageProps) {
  const supabase = createClient();
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect(`/connexion?redirect=/mon-compte/reservations/${params.id}/paiement`);
  }

  // 1. Charger la réservation et les infos du logement & hôte
  const { data: booking } = await supabase
    .from('bookings')
    .select(`
      id, check_in, check_out, guests, total_price, status, payment_confirmed_by_client, client_id, created_at,
      properties!inner (
        id, title, quartier, type, price_per_night,
        property_images ( url, position ),
        profiles!properties_host_id_fkey ( full_name, phone, mobile_money_number )
      )
    `)
    .eq('id', params.id)
    .single();

  if (!booking) {
    notFound();
  }

  // Vérifier les autorisations et le statut
  if (booking.client_id !== profile.id) {
    redirect('/mon-compte/reservations');
  }

  // Si le paiement est déjà soumis par le client ou la réservation terminée
  if (booking.payment_confirmed_by_client || booking.status === 'completed') {
    redirect('/mon-compte/reservations?payment_sent=1');
  }

  const property = booking.properties as any;
  const host = property?.profiles;
  const images = (property?.property_images || []).sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0));
  const mainImage = images[0]?.url || '/images/default-property.jpg';

  let checkInFormatted = booking.check_in;
  let checkOutFormatted = booking.check_out;
  try {
    checkInFormatted = format(parseISO(booking.check_in), 'dd MMMM yyyy', { locale: fr });
    checkOutFormatted = format(parseISO(booking.check_out), 'dd MMMM yyyy', { locale: fr });
  } catch {}

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-warm/30 pt-24 pb-16 sm:pt-28 sm:pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          
          <div className="mb-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sun/10 text-sun-800 px-3.5 py-1 text-xs font-bold uppercase tracking-wider mb-2">
              ⚡ Réservation Instantanée
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-navy">
              Paiement & Confirmation
            </h1>
            <p className="text-navy/60 text-sm mt-1">
              Finalisez votre réservation en effectuant le virement Mobile Money.
            </p>
          </div>

          {searchParams.error && (
            <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4 text-red-700 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <span>{searchParams.error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">

            {/* 1. Carte Récapitulatif du logement */}
            <div className="rounded-3xl border border-navy/10 bg-white p-6 shadow-sm flex flex-col sm:flex-row gap-5 items-start sm:items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mainImage}
                alt={property.title}
                className="h-28 w-full sm:w-36 rounded-2xl object-cover ring-1 ring-navy/10 shrink-0"
              />
              <div className="flex-1 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-sun">
                  {property.type || 'Logement'}
                </span>
                <h2 className="font-display text-xl font-bold text-navy">
                  {property.title}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-navy/70">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-sun" />
                    {property.quartier || 'Kribi'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-sun" />
                    {booking.guests} voyageur{booking.guests > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="text-xs font-medium text-navy/80 bg-warm/60 px-3 py-1.5 rounded-xl inline-block">
                  📅 {checkInFormatted} → {checkOutFormatted}
                </div>
              </div>
            </div>

            {/* 2. Détail du montant & Formulaire de Paiement */}
            <div className="rounded-3xl border border-navy/10 bg-white p-6 sm:p-8 shadow-md space-y-6">
              
              <div className="flex items-center justify-between border-b border-navy/10 pb-4">
                <span className="text-sm font-semibold text-navy/70">Montant total à régler</span>
                <span className="font-display text-3xl font-extrabold text-navy">
                  {booking.total_price?.toLocaleString('fr-FR')} <span className="text-sm font-bold text-sun">FCFA</span>
                </span>
              </div>

              {/* Formulaire de soumission du paiement */}
              <form action={clientConfirmPaymentAction} className="space-y-5">
                <input type="hidden" name="booking_id" value={booking.id} />

                {/* Sélecteur de réseau */}
                <div>
                  <label className="block text-xs font-bold text-navy/70 uppercase tracking-wider mb-2">
                    Choisissez votre réseau Mobile Money *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="relative flex items-center justify-between rounded-2xl border border-navy/10 p-4 cursor-pointer hover:bg-orange-50/50 has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50/80 transition">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payer_network"
                          value="orange_money"
                          defaultChecked
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                        />
                        <span className="font-bold text-sm text-navy">Orange Money</span>
                      </div>
                      <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-md">OM</span>
                    </label>

                    <label className="relative flex items-center justify-between rounded-2xl border border-navy/10 p-4 cursor-pointer hover:bg-yellow-50/50 has-[:checked]:border-yellow-500 has-[:checked]:bg-yellow-50/80 transition">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payer_network"
                          value="mtn_momo"
                          className="h-4 w-4 text-yellow-600 focus:ring-yellow-500"
                        />
                        <span className="font-bold text-sm text-navy">MTN MoMo</span>
                      </div>
                      <span className="text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-md">MOMO</span>
                    </label>
                  </div>
                </div>

                {/* Numéro de téléphone de l'émetteur */}
                <div>
                  <label className="block text-xs font-bold text-navy/70 uppercase tracking-wider mb-1.5">
                    Numéro de téléphone émetteur *
                  </label>
                  <div className="relative">
                    <Smartphone className="absolute left-3.5 top-3 h-5 w-5 text-navy/40" />
                    <input
                      type="tel"
                      name="payer_phone_number"
                      required
                      defaultValue={profile.phone || ''}
                      placeholder="Ex: 6XX XXX XXX"
                      className="w-full rounded-xl border border-navy/10 bg-gray-50 pl-11 pr-4 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-sun/50"
                    />
                  </div>
                  <p className="text-xs text-navy/50 mt-1">
                    Le numéro utilisé pour passer le paiement Mobile Money.
                  </p>
                </div>

                {/* Bouton de confirmation */}
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-sun px-6 py-4 font-bold text-white shadow-lg shadow-sun/30 hover:bg-sun/90 active:scale-[0.99] transition text-base"
                >
                  <span>Confirmer le paiement</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </form>

              {/* Notice informative obligatoire */}
              <div className="rounded-2xl bg-amber-50/80 border border-amber-200/80 p-4 text-xs text-amber-900 leading-relaxed flex items-start gap-3">
                <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Mode de règlement transitoire :</strong> Le prélèvement automatique arrive bientôt. En attendant, envoyez le montant au numéro Mobile Money de l'hôte (affiché ci-dessous une fois confirmé), l'équipe Kribiland reste disponible en cas de souci.
                </div>
              </div>

              {/* Coordonnées de l'hôte */}
              {host && (
                <div className="rounded-2xl border border-navy/10 bg-gray-50 p-4 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-navy/50 block">
                    Coordonnées de paiement de l'hôte
                  </span>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-navy">{host.full_name || 'Hôte'}</span>
                    <span className="font-mono font-bold text-navy bg-white px-3 py-1 rounded-lg border border-navy/10">
                      {host.mobile_money_number || host.phone || 'Non renseigné par l\'hôte'}
                    </span>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
