'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createPropertyReviewAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/connexion');

  const bookingId = String(formData.get('booking_id') || '');
  const propertyId = String(formData.get('property_id') || '');
  const ratingNum = Number(formData.get('rating') || 5);
  const comment = String(formData.get('comment') || '').trim();

  if (!bookingId || !propertyId || ratingNum < 1 || ratingNum > 5) {
    redirect(`/mon-compte/reservations?error=${encodeURIComponent('Avis invalide (note entre 1 et 5 requise).')}`);
  }

  // Vérifier que la réservation existe, appartient à l'utilisateur et est terminée
  const { data: booking } = await supabase
    .from('bookings')
    .select('id, status, client_id, property_id')
    .eq('id', bookingId)
    .eq('client_id', user.id)
    .eq('status', 'completed')
    .single();

  if (!booking) {
    redirect(`/mon-compte/reservations?error=${encodeURIComponent('Seules les réservations terminées peuvent faire l\'objet d\'un avis.')}`);
  }

  // Insérer l'avis
  const { error: insertErr } = await supabase
    .from('reviews')
    .insert({
      author_id: user.id,
      booking_id: bookingId,
      property_id: propertyId,
      target_type: 'property',
      rating: ratingNum,
      comment: comment || null,
    });

  if (insertErr) {
    redirect(`/mon-compte/reservations?error=${encodeURIComponent('Vous avez déjà déposé un avis pour ce séjour.')}`);
  }

  // Recalculer la note moyenne et le nombre d'avis sur le logement
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('property_id', propertyId);

  if (reviews && reviews.length > 0) {
    const count = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = Math.round((sum / count) * 10) / 10;

    await supabase
      .from('properties')
      .update({
        average_rating: avg,
        review_count: count,
      })
      .eq('id', propertyId);
  }

  revalidatePath(`/logements/${propertyId}`);
  revalidatePath(`/mon-compte/reservations`);
  revalidatePath(`/mes-reservations`);
  revalidatePath('/logements');
  revalidatePath('/');

  redirect('/mon-compte/reservations?review_sent=1');
}

export async function createServiceReviewAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/connexion');

  const serviceOrderId = String(formData.get('service_order_id') || '');
  const serviceId = String(formData.get('service_id') || '');
  const ratingNum = Number(formData.get('rating') || 5);
  const comment = String(formData.get('comment') || '').trim();

  if (!serviceOrderId || ratingNum < 1 || ratingNum > 5) {
    redirect(`/mon-compte/reservations?error=${encodeURIComponent('Avis invalide (note entre 1 et 5 requise).')}`);
  }

  // Vérifier que la commande existe, appartient à l'utilisateur et est terminée
  const { data: order } = await supabase
    .from('service_orders')
    .select('id, status, client_id, service_id')
    .eq('id', serviceOrderId)
    .eq('client_id', user.id)
    .eq('status', 'completed')
    .single();

  if (!order) {
    redirect(`/mon-compte/reservations?error=${encodeURIComponent('Seules les prestations terminées peuvent faire l\'objet d\'un avis.')}`);
  }

  const targetServiceId = serviceId || order.service_id;

  const { error: insertErr } = await supabase
    .from('reviews')
    .insert({
      author_id: user.id,
      service_order_id: serviceOrderId,
      service_id: targetServiceId || null,
      target_type: 'service',
      rating: ratingNum,
      comment: comment || null,
    });

  if (insertErr) {
    redirect(`/mon-compte/reservations?error=${encodeURIComponent('Vous avez déjà déposé un avis pour cette prestation.')}`);
  }

  revalidatePath('/mon-compte/reservations');
  revalidatePath('/mes-reservations');

  redirect('/mon-compte/reservations?review_sent=1');
}
