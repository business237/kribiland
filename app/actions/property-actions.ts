'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import type { Database } from '@/types/database.types';

function parseHouseRules(raw: string): string[] {
  return raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

function parseOptionalNumber(formData: FormData, name: string): number | null {
  const value = formData.get(name);
  if (value === null || String(value).trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseTriState(formData: FormData, name: string): boolean | null {
  const value = String(formData.get(name) || '');
  if (value === 'true') return true;
  if (value === 'false') return false;
  return null;
}

const HOST_PROPERTY_TYPES = new Set(['chambre', 'appartement_studio', 'maison', 'villa', 'autre']);

export async function createPropertyAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/connexion');

  // Mise à jour automatique du rôle vers 'host' si ce n'est pas déjà le cas
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile && profile.role !== 'host' && profile.role !== 'admin') {
    await supabase
      .from('profiles')
      .update({ role: 'host' })
      .eq('id', user.id);
  }

  const title = String(formData.get('title') || '').trim();
  const type = String(formData.get('type') || '');
  const quartier = String(formData.get('quartier') || '').trim();
  const rentalMode = String(formData.get('rental_mode') || 'courte_duree') as Database['public']['Enums']['rental_mode'];
  const pricePerMonth = formData.get('price_per_month') ? Number(formData.get('price_per_month')) : null;
  const minMonths = formData.get('min_months') ? Number(formData.get('min_months')) : null;
  const pricePerNight = parseOptionalNumber(formData, 'price_per_night');
  const capacity = Number(formData.get('capacity'));
  const bedrooms = type === 'chambre' ? 1 : parseOptionalNumber(formData, 'bedrooms');
  const livingRooms = type === 'chambre' ? 0 : parseOptionalNumber(formData, 'living_rooms');
  const bathrooms = parseOptionalNumber(formData, 'bathrooms');
  const depositAmount = parseOptionalNumber(formData, 'deposit_amount');
  const advanceMonths = parseOptionalNumber(formData, 'advance_months');
  const privateBathroom = formData.get('private_bathroom') === 'private';
  const showerType = String(formData.get('shower_type') || 'interne');

  if (!title || !HOST_PROPERTY_TYPES.has(type) || !quartier || !capacity || (rentalMode !== 'longue_duree' && !pricePerNight) || ((rentalMode === 'longue_duree' || rentalMode === 'les_deux') && !pricePerMonth)) {
    redirect(`/dashboard/logements/nouvelle?error=${encodeURIComponent('Veuillez remplir tous les champs obligatoires.')}`);
  }

  const latitude = formData.get('latitude') ? Number(formData.get('latitude')) : null;
  const longitude = formData.get('longitude') ? Number(formData.get('longitude')) : null;

  const { data, error } = await supabase
    .from('properties')
    .insert({
      host_id: user.id,
      title,
      description: String(formData.get('description') || '').trim() || null,
      type: type as any,
      quartier,
      address: String(formData.get('address') || '').trim() || null,
      rental_mode: rentalMode,
      price_per_night: pricePerNight,
      price_per_month: pricePerMonth,
      min_months: minMonths,
      latitude: latitude && !isNaN(latitude) ? latitude : null,
      longitude: longitude && !isNaN(longitude) ? longitude : null,
      capacity,
      bedrooms: bedrooms || 1,
      living_rooms: livingRooms,
      bathrooms,
      deposit_amount: depositAmount,
      advance_months: advanceMonths,
      electricity_type: String(formData.get('electricity_type') || '').trim() || null,
      water_source: String(formData.get('water_source') || '').trim() || null,
      is_fenced: parseTriState(formData, 'is_fenced'),
      has_gate: parseTriState(formData, 'has_gate'),
      road_access: String(formData.get('road_access') || '').trim() || null,
      is_furnished: parseTriState(formData, 'is_furnished'),
      min_nights: Number(formData.get('min_nights')) || 1,
      max_nights: formData.get('max_nights') ? Number(formData.get('max_nights')) : null,
      house_rules: parseHouseRules(String(formData.get('house_rules') || '')),
      status: 'pending',
      private_bathroom: privateBathroom,
      shower_type: showerType,
    } as any)
    .select('id')
    .single();

  if (error || !data) {
    const errorMessage = error
      ? [
          error.message,
          error.details ? `Détails: ${error.details}` : '',
          error.hint ? `Indice: ${error.hint}` : '',
        ].filter(Boolean).join(' | ')
      : "La création de l'annonce n'a retourné aucune donnée.";

    console.error('[createPropertyAction] Échec de création de la propriété:', {
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
    });

    redirect(`/dashboard/logements/nouvelle?error=${encodeURIComponent(errorMessage)}`);
  }

  // Insertion des URLs d'images transmises (avec la photo de couverture en position 0)
  const imageUrls = formData.getAll('image_urls').map(String).filter(Boolean);
  if (imageUrls.length > 0) {
    await supabase.from('property_images').insert(
      imageUrls.map((url, position) => ({
        property_id: data.id,
        url,
        position,
      }))
    );
  }

  const amenityIds = formData.getAll('amenities').map(String);
  if (amenityIds.length > 0) {
    const { error: amenitiesError } = await supabase.from('property_amenities').insert(
      amenityIds.map((amenity_id) => ({ property_id: data.id, amenity_id }))
    );
    if (amenitiesError) console.error('Erreur sauvegarde équipements:', amenitiesError);
  }

  revalidatePath('/dashboard/logements');
  revalidatePath('/logements');
  revalidatePath('/');
  redirect('/dashboard/logements?created=1');
}

export async function setCoverImageAction(formData: FormData) {
  const supabase = createClient();
  const imageId = String(formData.get('image_id') || '');
  const propertyId = String(formData.get('property_id') || '');

  if (!imageId || !propertyId) return;

  const { data: images } = await supabase
    .from('property_images')
    .select('id, position')
    .eq('property_id', propertyId)
    .order('position');

  if (!images || images.length === 0) return;

  let pos = 1;
  for (const img of images) {
    if (img.id === imageId) {
      await supabase.from('property_images').update({ position: 0 }).eq('id', img.id);
    } else {
      await supabase.from('property_images').update({ position: pos }).eq('id', img.id);
      pos++;
    }
  }

  revalidatePath(`/dashboard/logements/${propertyId}`);
  revalidatePath(`/logements/${propertyId}`);
  revalidatePath('/logements');
}

export async function updatePropertyAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/connexion');

  const propertyId = String(formData.get('property_id') || '');
  const title = String(formData.get('title') || '').trim();
  const type = String(formData.get('type') || '');
  const quartier = String(formData.get('quartier') || '').trim();
  const rentalMode = String(formData.get('rental_mode') || 'courte_duree') as Database['public']['Enums']['rental_mode'];
  const pricePerMonth = formData.get('price_per_month') ? Number(formData.get('price_per_month')) : null;
  const minMonths = formData.get('min_months') ? Number(formData.get('min_months')) : null;
  const pricePerNight = parseOptionalNumber(formData, 'price_per_night');
  const capacity = Number(formData.get('capacity'));
  const bedrooms = type === 'chambre' ? 1 : parseOptionalNumber(formData, 'bedrooms');
  const livingRooms = type === 'chambre' ? 0 : parseOptionalNumber(formData, 'living_rooms');
  const bathrooms = parseOptionalNumber(formData, 'bathrooms');
  const depositAmount = parseOptionalNumber(formData, 'deposit_amount');
  const advanceMonths = parseOptionalNumber(formData, 'advance_months');
  const privateBathroom = formData.get('private_bathroom') === 'private';
  const showerType = String(formData.get('shower_type') || 'interne');

  if (!propertyId || !title || !HOST_PROPERTY_TYPES.has(type) || !quartier || !capacity || (rentalMode !== 'longue_duree' && !pricePerNight) || ((rentalMode === 'longue_duree' || rentalMode === 'les_deux') && !pricePerMonth)) {
    redirect(`/dashboard/logements/${propertyId}?error=${encodeURIComponent('Veuillez remplir tous les champs obligatoires.')}`);
  }

  const latitude = formData.get('latitude') ? Number(formData.get('latitude')) : null;
  const longitude = formData.get('longitude') ? Number(formData.get('longitude')) : null;

  // RLS garantit que seul le host_id propriétaire (ou l'admin) peut modifier cette ligne.
  const { error } = await supabase
    .from('properties')
    .update({
      title,
      description: String(formData.get('description') || '').trim() || null,
      type: type as any,
      quartier,
      address: String(formData.get('address') || '').trim() || null,
      rental_mode: rentalMode,
      price_per_night: pricePerNight,
      price_per_month: pricePerMonth,
      min_months: minMonths,
      latitude: latitude && !isNaN(latitude) ? latitude : null,
      longitude: longitude && !isNaN(longitude) ? longitude : null,
      capacity,
      bedrooms: bedrooms || 1,
      living_rooms: livingRooms,
      bathrooms,
      deposit_amount: depositAmount,
      advance_months: advanceMonths,
      electricity_type: String(formData.get('electricity_type') || '').trim() || null,
      water_source: String(formData.get('water_source') || '').trim() || null,
      is_fenced: parseTriState(formData, 'is_fenced'),
      has_gate: parseTriState(formData, 'has_gate'),
      road_access: String(formData.get('road_access') || '').trim() || null,
      is_furnished: parseTriState(formData, 'is_furnished'),
      min_nights: Number(formData.get('min_nights')) || 1,
      max_nights: formData.get('max_nights') ? Number(formData.get('max_nights')) : null,
      house_rules: parseHouseRules(String(formData.get('house_rules') || '')),
      status: 'pending',
      private_bathroom: privateBathroom,
      shower_type: showerType,
    } as any)
    .eq('id', propertyId);

  if (error) {
    redirect(`/dashboard/logements/${propertyId}?error=${encodeURIComponent('Erreur lors de la mise à jour.')}`);
  }

  const amenityIds = formData.getAll('amenities').map(String);
  await supabase.from('property_amenities').delete().eq('property_id', propertyId);
  if (amenityIds.length > 0) {
    const { error: amenitiesError } = await supabase.from('property_amenities').insert(
      amenityIds.map((amenity_id) => ({ property_id: propertyId, amenity_id }))
    );
    if (amenitiesError) console.error('Erreur sauvegarde équipements:', amenitiesError);
  }

  const imageUrls = formData.getAll('image_urls').map(String).filter(Boolean);
  if (imageUrls.length > 0) {
    const { data: existingImages } = await supabase
      .from('property_images')
      .select('position')
      .eq('property_id', propertyId)
      .order('position', { ascending: false })
      .limit(1);
    const nextPosition = (existingImages?.[0]?.position ?? -1) + 1;
    await supabase.from('property_images').insert(
      imageUrls.map((url, index) => ({ property_id: propertyId, url, position: nextPosition + index }))
    );
  }

  revalidatePath(`/dashboard/logements/${propertyId}`);
  redirect(`/dashboard/logements/${propertyId}?updated=1`);
}

export async function deletePropertyImageAction(formData: FormData) {
  const supabase = createClient();
  const imageId = String(formData.get('image_id') || '');
  const propertyId = String(formData.get('property_id') || '');
  const url = String(formData.get('url') || '');

  // Extrait le chemin de stockage depuis l'URL publique Supabase
  // (format: https://xxx.supabase.co/storage/v1/object/public/listings/<path>)
  const marker = '/object/public/listings/';
  const idx = url.indexOf(marker);
  const path = idx !== -1 ? url.slice(idx + marker.length) : null;

  // RLS (property_images_write) vérifie déjà que l'utilisateur possède le logement parent.
  await supabase.from('property_images').delete().eq('id', imageId);
  if (path) {
    await supabase.storage.from('listings').remove([path]);
  }

  revalidatePath(`/dashboard/logements/${propertyId}`);
}

export async function deletePropertyAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/connexion');

  const propertyId = String(formData.get('property_id') || '');
  if (!propertyId) redirect('/dashboard/logements');

  // RLS garantit que seul le propriétaire peut supprimer son logement
  await supabase.from('property_amenities').delete().eq('property_id', propertyId);
  await supabase.from('property_images').delete().eq('property_id', propertyId);
  await supabase.from('properties').delete().eq('id', propertyId).eq('host_id', user.id);

  revalidatePath('/dashboard/logements');
  redirect('/dashboard/logements?deleted=1');
}
