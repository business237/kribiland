'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function toggleFavoriteAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/connexion');
  }

  const propertyId = String(formData.get('property_id') || '');
  const serviceId = String(formData.get('service_id') || '');
  const activityId = String(formData.get('activity_id') || '');

  if (!propertyId && !serviceId && !activityId) {
    return { error: 'Élément invalide' };
  }

  let query = supabase.from('favorites').select('id').eq('user_id', user.id);
  if (propertyId) query = query.eq('property_id', propertyId);
  else if (serviceId) query = query.eq('service_id', serviceId);
  else if (activityId) query = query.eq('activity_id', activityId);

  const { data: existing } = await query.maybeSingle();

  if (existing) {
    await supabase.from('favorites').delete().eq('id', existing.id);
  } else {
    const insertPayload: Record<string, any> = { user_id: user.id };
    if (propertyId) insertPayload.property_id = propertyId;
    if (serviceId) insertPayload.service_id = serviceId;
    if (activityId) insertPayload.activity_id = activityId;

    await supabase.from('favorites').insert(insertPayload);
  }

  revalidatePath('/mon-compte/favoris');
  if (propertyId) revalidatePath(`/${propertyId}`);
  return { isFavorite: !existing };
}
