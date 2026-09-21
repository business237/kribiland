'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// --- Réservations de logements (hôtes) ------------------------------------

export async function respondToBookingAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/connexion');

  const bookingId = String(formData.get('booking_id') || '');
  const decision = String(formData.get('decision') || ''); // 'accepted' | 'rejected'
  const rejectionReason = String(formData.get('rejection_reason') || '').trim();

  if (!bookingId || (decision !== 'accepted' && decision !== 'rejected')) {
    redirect(`/dashboard/reservations?error=${encodeURIComponent('Action invalide.')}`);
  }

  // .eq('status', 'pending') évite d'écraser une décision déjà prise (double-clic,
  // deux onglets ouverts) — si 0 ligne affectée, la transition n'était plus valide.
  const { data, error } = await supabase
    .from('bookings')
    .update({
      status: decision,
      rejection_reason: decision === 'rejected' ? (rejectionReason || 'Refusé par l\'hôte') : null,
    })
    .eq('id', bookingId)
    .eq('status', 'pending')
    .select('id')
    .single();

  if (error || !data) {
    redirect(`/dashboard/reservations?error=${encodeURIComponent('Cette demande a déjà été traitée.')}`);
  }

  revalidatePath('/dashboard/reservations');
  redirect(`/dashboard/reservations?success=1`);
}

/**
 * Crée une nouvelle demande de réservation depuis la fiche logement.
 * Appelé par le client via BookingForm.
 */
export async function createBookingAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/connexion');

  const propertyId = String(formData.get('property_id') || '');
  const checkIn = String(formData.get('check_in') || '');
  const checkOut = String(formData.get('check_out') || '');
  const guests = parseInt(String(formData.get('guests') || '1'), 10);
  const totalPrice = parseInt(String(formData.get('total_price') || '0'), 10);
  const bookingType = String(formData.get('booking_type') || 'nuitee');

  if (!propertyId || !checkIn || !checkOut || guests < 1 || totalPrice <= 0) {
    redirect(`/logements/${propertyId}?booking_error=${encodeURIComponent('Veuillez remplir tous les champs.')}`);
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (checkInDate < today) {
    redirect(`/logements/${propertyId}?booking_error=${encodeURIComponent('La date d\'arrivée ne peut pas être dans le passé.')}`);
  }
  if (checkOutDate <= checkInDate) {
    redirect(`/logements/${propertyId}?booking_error=${encodeURIComponent('La date de départ doit être après la date d\'arrivée.')}`);
  }

  const { data: bookingId, error } = await supabase.rpc('create_booking_if_available', {
    p_property_id: propertyId,
    p_client_id: user.id,
    p_check_in: checkIn,
    p_check_out: checkOut,
    p_guests: guests,
    p_total_price: totalPrice,
    p_booking_type: bookingType,
  });

  if (error || !bookingId) {
    const message = error?.message.includes('property_unavailable')
      ? 'Ces dates sont complètes pour ce logement. Choisissez une autre période.'
      : 'Erreur lors de l\'envoi. Veuillez réessayer.';
    redirect(`/logements/${propertyId}?booking_error=${encodeURIComponent(message)}`);
  }

  // Passer le statut à 'pending_payment' pour la réservation instantanée
  await supabase
    .from('bookings')
    .update({ status: 'pending_payment' })
    .eq('id', bookingId);

  revalidatePath('/mon-compte/reservations');
  redirect(`/mon-compte/reservations/${bookingId}/paiement`);
}

/**
 * Le client indique qu'il a effectué le virement Mobile Money.
 * Ne change PAS le statut — l'hôte doit encore confirmer la réception.
 */
export async function clientConfirmPaymentAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/connexion');

  const bookingId = String(formData.get('booking_id') || '');
  const payerPhoneNumber = String(formData.get('payer_phone_number') || '').trim();
  const payerNetwork = String(formData.get('payer_network') || '').trim();

  if (!bookingId) redirect('/mon-compte/reservations?error=invalid');

  // Sécurité : seul le client de la réservation peut poser ce flag
  const { data, error } = await supabase
    .from('bookings')
    .update({
      payment_confirmed_by_client: true,
      payer_phone_number: payerPhoneNumber || null,
      payer_network: payerNetwork || null,
      status: 'pending_payment',
    })
    .eq('id', bookingId)
    .eq('client_id', user.id)
    .select('id')
    .single();

  if (error || !data) {
    redirect(`/mon-compte/reservations?error=${encodeURIComponent('Action non autorisée ou réservation introuvable.')}`);
  }

  revalidatePath('/mon-compte/reservations');
  redirect('/mon-compte/reservations?payment_sent=1');
}

/**
 * L'hôte confirme avoir reçu le paiement Mobile Money.
 * Passe le booking à 'completed'.
 */
export async function hostConfirmReceiptAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/connexion');

  const bookingId = String(formData.get('booking_id') || '');
  if (!bookingId) redirect('/dashboard/reservations?error=invalid');

  // Sécurité : récupérer la réservation et vérifier que le logement appartient bien à l'utilisateur connecté
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('id, status, payment_confirmed_by_client, properties(host_id)')
    .eq('id', bookingId)
    .single();

  const hostId = Array.isArray(booking?.properties)
    ? booking?.properties[0]?.host_id
    : (booking?.properties as { host_id: string } | null)?.host_id;

  const validStatus = ['pending_payment', 'pending', 'accepted'].includes(booking?.status || '');

  if (fetchError || !booking || hostId !== user.id || !validStatus || !booking.payment_confirmed_by_client) {
    redirect(`/dashboard/reservations?error=${encodeURIComponent('Action non autorisée ou paiement client non confirmé.')}`);
  }

  const { error: updateError } = await supabase
    .from('bookings')
    .update({ status: 'completed' })
    .eq('id', bookingId);

  if (updateError) {
    redirect(`/dashboard/reservations?error=${encodeURIComponent('Erreur lors de la mise à jour.')}`);
  }

  revalidatePath('/dashboard/reservations');
  redirect('/dashboard/reservations?receipt_confirmed=1');
}

/**
 * Permet à un hôte de renseigner ou modifier son numéro Mobile Money.
 */
export async function updateMobileMoneyAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/connexion');

  const mobileMoneyNumber = String(formData.get('mobile_money_number') || '').trim();

  const { error } = await supabase
    .from('profiles')
    .update({ mobile_money_number: mobileMoneyNumber || null })
    .eq('id', user.id);

  if (error) {
    redirect(`/dashboard/reservations?error=${encodeURIComponent('Erreur lors de la mise à jour du numéro.')}`);
  }

  revalidatePath('/dashboard/reservations');
  redirect('/dashboard/reservations?momo_updated=1');
}

// --- Commandes de service (prestataires) ----------------------------------

export async function respondToServiceOrderAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/connexion');

  const orderId = String(formData.get('order_id') || '');
  const decision = String(formData.get('decision') || ''); // 'accepted' | 'rejected'
  const price = Number(formData.get('price') || 0);
  const rejectionReason = String(formData.get('rejection_reason') || '').trim();

  if (!orderId || (decision !== 'accepted' && decision !== 'rejected')) {
    redirect(`/dashboard/reservations?error=${encodeURIComponent('Action invalide.')}`);
  }
  if (decision === 'accepted' && (!price || price <= 0)) {
    redirect(`/dashboard/reservations?error=${encodeURIComponent('Veuillez indiquer un prix pour accepter la commande.')}`);
  }

  const updatePayload: any = {
    status: decision,
  };
  if (decision === 'accepted') updatePayload.price = price;
  if (decision === 'rejected') updatePayload.rejection_reason = rejectionReason || 'Refusé par le prestataire';

  // Le trigger protect_service_order_price() valide déjà côté base que seul un
  // rôle non-client peut modifier le prix — cette vérification applicative est
  // une commodité UX, pas la garantie de sécurité (qui vit dans le trigger).
  const { data, error } = await supabase
    .from('service_orders')
    .update(updatePayload)
    .eq('id', orderId)
    .eq('status', 'pending')
    .select('id')
    .single();

  if (error || !data) {
    redirect(`/dashboard/reservations?error=${encodeURIComponent('Cette commande a déjà été traitée.')}`);
  }

  revalidatePath('/dashboard/reservations');
  redirect(`/dashboard/reservations?success=1`);
}
