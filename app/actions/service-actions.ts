'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

// Catégories statiques en secours : on résout l'UUID depuis la BD par slug
const SLUG_FALLBACK_LABELS: Record<string, string> = {
  transport: 'Transport & VTC',
  restauration: 'Restauration & Traiteur',
  location_vehicule: 'Location de véhicule',
  guide: 'Guide & Excursions',
};

async function resolveCategoryId(supabase: ReturnType<typeof createClient>, rawId: string): Promise<string | null> {
  // Si rawId ressemble à un UUID, on l'utilise directement
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidPattern.test(rawId)) {
    return rawId;
  }

  // Sinon c'est un slug : on cherche l'UUID en base ou on insère la catégorie
  const { data: existing } = await supabase
    .from('service_categories')
    .select('id')
    .eq('slug', rawId as any)
    .single();

  if (existing?.id) return existing.id;

  // Insérer la catégorie manquante si elle n'existe pas encore
  const label = SLUG_FALLBACK_LABELS[rawId] || rawId;
  const { data: inserted } = await supabase
    .from('service_categories')
    .insert({ slug: rawId as any, label, icon: null })
    .select('id')
    .single();

  return inserted?.id ?? null;
}

export async function createServiceAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/connexion');

  // Mise à jour automatique du rôle vers 'provider' si ce n'est pas déjà le cas
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile && profile.role !== 'provider' && profile.role !== 'admin') {
    await supabase
      .from('profiles')
      .update({ role: 'provider' })
      .eq('id', user.id);
  }

  const title = String(formData.get('title') || '').trim();
  const rawCategoryId = String(formData.get('category_id') || '');
  const quartier = String(formData.get('quartier') || '').trim();
  const contactPhone = String(formData.get('contact_phone') || '').trim();
  const rawPriceAmount = String(formData.get('price_amount') || '').trim();
  const priceAmount = rawPriceAmount ? Number(rawPriceAmount) : null;
  const latitude = formData.get('latitude') ? Number(formData.get('latitude')) : null;
  const longitude = formData.get('longitude') ? Number(formData.get('longitude')) : null;

  if (!title || !rawCategoryId || !contactPhone) {
    redirect(`/dashboard/services/nouvelle?error=${encodeURIComponent('Veuillez remplir tous les champs obligatoires.')}`);
  }
  if (priceAmount !== null && (!Number.isFinite(priceAmount) || priceAmount < 0)) {
    redirect(`/dashboard/services/nouvelle?error=${encodeURIComponent('Le prix indicatif doit être un nombre positif.')}`);
  }
  if ((latitude !== null && !Number.isFinite(latitude)) || (longitude !== null && !Number.isFinite(longitude))) {
    redirect(`/dashboard/services/nouvelle?error=${encodeURIComponent('Les coordonnées de localisation sont invalides.')}`);
  }

  // Résoudre l'UUID réel (que ce soit déjà un UUID ou un slug)
  const categoryId = await resolveCategoryId(supabase, rawCategoryId);
  if (!categoryId) {
    redirect(`/dashboard/services/nouvelle?error=${encodeURIComponent('Catégorie invalide. Veuillez en choisir une dans la liste.')}`);
  }

  const { data, error } = await supabase
    .from('services')
    .insert({
      provider_id: user.id,
      category_id: categoryId,
      title,
      description: String(formData.get('description') || '').trim() || null,
      quartier: quartier || null,
      price: String(formData.get('price') || '').trim() || null,
      price_amount: priceAmount,
      latitude,
      longitude,
      contact_phone: contactPhone,
      status: 'pending',
    })
    .select('id')
    .single();

  if (error || !data) {
    console.error('Erreur createServiceAction:', error);
    const msg = error?.message || "Erreur lors de la création de l'annonce.";
    redirect(`/dashboard/services/nouvelle?error=${encodeURIComponent(msg)}`);
  }

  revalidatePath('/dashboard/services');
  redirect('/dashboard/services?created=1');
}

export async function updateServiceAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/connexion');

  const serviceId = String(formData.get('service_id') || '');
  const title = String(formData.get('title') || '').trim();
  const rawCategoryId = String(formData.get('category_id') || '');
  const contactPhone = String(formData.get('contact_phone') || '').trim();
  const rawPriceAmount = String(formData.get('price_amount') || '').trim();
  const priceAmount = rawPriceAmount ? Number(rawPriceAmount) : null;
  const latitude = formData.get('latitude') ? Number(formData.get('latitude')) : null;
  const longitude = formData.get('longitude') ? Number(formData.get('longitude')) : null;

  if (!serviceId || !title || !rawCategoryId || !contactPhone) {
    redirect(`/dashboard/services/${serviceId}?error=${encodeURIComponent('Veuillez remplir tous les champs obligatoires.')}`);
  }
  if (priceAmount !== null && (!Number.isFinite(priceAmount) || priceAmount < 0)) {
    redirect(`/dashboard/services/${serviceId}?error=${encodeURIComponent('Le prix indicatif doit être un nombre positif.')}`);
  }
  if ((latitude !== null && !Number.isFinite(latitude)) || (longitude !== null && !Number.isFinite(longitude))) {
    redirect(`/dashboard/services/${serviceId}?error=${encodeURIComponent('Les coordonnées de localisation sont invalides.')}`);
  }

  const categoryId = await resolveCategoryId(supabase, rawCategoryId);
  if (!categoryId) {
    redirect(`/dashboard/services/${serviceId}?error=${encodeURIComponent('Catégorie invalide.')}`);
  }

  const { error } = await supabase
    .from('services')
    .update({
      title,
      category_id: categoryId,
      description: String(formData.get('description') || '').trim() || null,
      quartier: String(formData.get('quartier') || '').trim() || null,
      price: String(formData.get('price') || '').trim() || null,
      price_amount: priceAmount,
      latitude,
      longitude,
      contact_phone: contactPhone,
    })
    .eq('id', serviceId);

  if (error) {
    console.error('Erreur updateServiceAction:', error);
    const msg = error?.message || "Erreur lors de la mise à jour.";
    redirect(`/dashboard/services/${serviceId}?error=${encodeURIComponent(msg)}`);
  }

  revalidatePath(`/dashboard/services/${serviceId}`);
  redirect(`/dashboard/services/${serviceId}?updated=1`);
}

export async function deleteServiceAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/connexion');

  const serviceId = String(formData.get('service_id') || '');
  if (!serviceId) redirect('/dashboard/services');

  await supabase.from('services').delete().eq('id', serviceId).eq('provider_id', user.id);

  revalidatePath('/dashboard/services');
  redirect('/dashboard/services?deleted=1');
}
