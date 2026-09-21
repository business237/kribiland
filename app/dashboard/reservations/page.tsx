import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth/get-current-profile';
import { respondToBookingAction, respondToServiceOrderAction, hostConfirmReceiptAction, updateMobileMoneyAction } from '@/app/actions/order-actions';
import { StatusBadge } from '@/components/dashboard/status-badge';

export default async function ReservationsPage({
  searchParams,
}: {
  searchParams: { error?: string; success?: string; receipt_confirmed?: string; momo_updated?: string };
}) {
  const supabase = createClient();
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const isHost = profile.role === 'host';

  const banner = (
    <>
      {searchParams.error && (
        <div className="mb-4 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3">{searchParams.error}</div>
      )}
      {searchParams.success && (
        <div className="mb-4 rounded-lg bg-turquoise-50 text-turquoise-800 text-sm px-4 py-3">Réponse enregistrée.</div>
      )}
      {searchParams.receipt_confirmed && (
        <div className="mb-4 rounded-lg bg-emerald-50 text-emerald-800 text-sm px-4 py-3">Réception du paiement confirmée ! Réservation finalisée.</div>
      )}
      {searchParams.momo_updated && (
        <div className="mb-4 rounded-lg bg-emerald-50 text-emerald-800 text-sm px-4 py-3">Numéro Mobile Money mis à jour.</div>
      )}
    </>
  );

  if (isHost) {
    const { data: bookings } = await supabase
      .from('bookings')
      .select('id, check_in, check_out, guests, total_price, status, payment_confirmed_by_client, payer_phone_number, payer_network, created_at, properties!inner(title, host_id), profiles!bookings_client_id_fkey(full_name, phone)')
      .eq('properties.host_id', profile.id)
      .order('created_at', { ascending: false });

    return (
      <div>
        <h1 className="font-display text-3xl text-navy-800 mb-6">Réservations</h1>
        {banner}

        {/* Configuration du numéro Mobile Money de l'hôte */}
        <div className="mb-6 bg-white rounded-2xl border border-navy-100 p-5 shadow-sm">
          <h2 className="font-semibold text-navy-800 text-base mb-1">Votre numéro Mobile Money (Orange Money / MTN MoMo)</h2>
          <p className="text-xs text-navy-400 mb-4">
            Ce numéro sera communiqué automatiquement au client lors de sa réservation instantanée pour qu'il effectue le paiement.
          </p>
          <form action={updateMobileMoneyAction} className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              name="mobile_money_number"
              defaultValue={profile.mobile_money_number || ''}
              placeholder="Ex: +237 6XX XXX XXX"
              className="rounded-xl border border-navy-200 px-4 py-2.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-sun/50"
            />
            <button
              type="submit"
              className="bg-navy-800 hover:bg-navy-900 text-white text-sm font-medium rounded-full px-5 py-2.5 transition"
            >
              Enregistrer le numéro
            </button>
          </form>
        </div>

        {(!bookings || bookings.length === 0) ? (
          <EmptyState label="Aucune réservation pour le moment." />
        ) : (
          <div className="space-y-4">
            {bookings.map((b: any) => {
              const isCompleted = b.status === 'completed';
              const isPaymentReported = b.payment_confirmed_by_client && !isCompleted;

              return (
                <div key={b.id} className="bg-white rounded-2xl border border-navy-100 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-navy-800">{b.properties?.title}</p>
                      <p className="text-sm text-navy-400">
                        {b.profiles?.full_name} · {b.profiles?.phone || 'Téléphone non renseigné'}
                      </p>
                    </div>
                    {isCompleted ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-800 px-3 py-1 text-xs font-bold border border-emerald-200">
                        ✓ Terminé
                      </span>
                    ) : isPaymentReported ? (
                      <span className="inline-flex items-center rounded-full bg-amber-50 text-amber-800 px-3 py-1 text-xs font-bold border border-amber-200 animate-pulse">
                        ⏳ Paiement signalé, à confirmer
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-800 px-3 py-1 text-xs font-bold border border-blue-200">
                        💬 En attente de paiement client
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-navy-600 mb-3">
                    Du {formatDate(b.check_in)} au {formatDate(b.check_out)} · {b.guests} personne(s) ·{' '}
                    <strong className="text-navy-800">{b.total_price?.toLocaleString('fr-FR')} FCFA</strong>
                  </p>

                  {/* Actions & statut de paiement */}
                  {isPaymentReported && (
                    <div className="mt-3 pt-3 border-t border-navy-100">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-emerald-50/80 rounded-xl p-3.5 border border-emerald-200">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                            Paiement signalé par le client
                          </p>
                          <p className="text-xs text-emerald-700">
                            {b.payer_network ? `Réseau : ${b.payer_network === 'orange_money' ? 'Orange Money' : 'MTN MoMo'}` : 'Mobile Money'}
                            {b.payer_phone_number && ` · N° Émetteur : ${b.payer_phone_number}`}
                          </p>
                        </div>
                        <form action={hostConfirmReceiptAction}>
                          <input type="hidden" name="booking_id" value={b.id} />
                          <button
                            type="submit"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-full px-4 py-2.5 transition shadow-sm"
                          >
                            Confirmer la réception du paiement
                          </button>
                        </form>
                      </div>
                    </div>
                  )}

                  {!isCompleted && !isPaymentReported && (
                    <div className="mt-3 pt-3 border-t border-navy-100">
                      <p className="text-xs text-navy-500 bg-gray-50 rounded-xl p-3 border border-navy-100">
                        Le client n'a pas encore confirmé l'envoi de son paiement Mobile Money.
                      </p>
                    </div>
                  )}

                  {isCompleted && (
                    <div className="mt-3 pt-3 border-t border-navy-100">
                      <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        ✅ Paiement reçu & séjour confirmé
                      </span>
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

  // --- Prestataire ---
  const { data: orders } = await supabase
    .from('service_orders')
    .select('id, requested_at, details, price, status, created_at, services!inner(title, provider_id), profiles!service_orders_client_id_fkey(full_name, phone)')
    .eq('services.provider_id', profile.id)
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="font-display text-3xl text-navy-800 mb-6">Commandes</h1>
      {banner}

      {(!orders || orders.length === 0) ? (
        <EmptyState label="Aucune commande pour le moment." />
      ) : (
        <div className="space-y-4">
          {orders.map((o: any) => (
            <div key={o.id} className="bg-white rounded-2xl border border-navy-100 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-medium text-navy-800">{o.services?.title}</p>
                  <p className="text-sm text-navy-400">
                    {o.profiles?.full_name} · {o.profiles?.phone || 'Téléphone non renseigné'}
                  </p>
                </div>
                <StatusBadge status={o.status} />
              </div>
              <p className="text-sm text-navy-600 mb-1">Souhaité pour le {formatDateTime(o.requested_at)}</p>
              {o.details && <p className="text-sm text-navy-500 mb-3">« {o.details} »</p>}

              {o.status === 'pending' && (
                <form action={respondToServiceOrderAction} className="flex flex-wrap items-center gap-3">
                  <input type="hidden" name="order_id" value={o.id} />
                  <input
                    type="number"
                    name="price"
                    placeholder="Prix (FCFA)"
                    className="w-32 rounded-lg border border-navy-100 px-3 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    name="decision"
                    value="accepted"
                    className="bg-turquoise-500 hover:bg-turquoise-600 text-white text-sm font-medium rounded-full px-4 py-2 transition"
                  >
                    Accepter avec ce prix
                  </button>
                  <button
                    type="submit"
                    name="decision"
                    value="rejected"
                    className="bg-white border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium rounded-full px-4 py-2 transition"
                  >
                    Refuser
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="bg-white rounded-2xl border border-navy-100 p-10 text-center text-navy-400">
      {label}
    </div>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
}
