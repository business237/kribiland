'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import type { Database } from '@/types/database.types';

async function requireAdmin() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/connexion');

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') redirect('/dashboard');
    return supabase;
}

export async function toggleUserActiveAction(formData: FormData) {
    const supabase = await requireAdmin();
    const profileId = String(formData.get('profile_id') || '');
    const isActive = String(formData.get('is_active') || '') === 'true';
    const query = String(formData.get('query') || '').trim();
    const role = String(formData.get('role') || '').trim();

    if (!profileId) redirect(`/admin/utilisateurs?error=${encodeURIComponent('Compte invalide.')}`);

    const { error } = await supabase
        .from('profiles')
        .update({ is_active: !isActive })
        .eq('id', profileId);

    if (error) {
        redirect(`/admin/utilisateurs?${new URLSearchParams({ query, role, error: 'Erreur lors de la mise à jour du compte.' }).toString()}`);
    }

    revalidatePath('/admin/utilisateurs');
    redirect(`/admin/utilisateurs?${new URLSearchParams({ query, role, success: '1' }).toString()}`);
}

function parseCoordinates(formData: FormData) {
    const rawLatitude = String(formData.get('latitude') || '').trim();
    const rawLongitude = String(formData.get('longitude') || '').trim();
    const latitude = rawLatitude ? Number(rawLatitude) : null;
    const longitude = rawLongitude ? Number(rawLongitude) : null;

    if ((latitude !== null && !Number.isFinite(latitude)) || (longitude !== null && !Number.isFinite(longitude))) {
        return null;
    }
    return { latitude, longitude };
}

function getActivityFields(formData: FormData) {
    const coordinates = parseCoordinates(formData);
    if (!coordinates) return null;

    return {
        title: String(formData.get('title') || '').trim(),
        description: String(formData.get('description') || '').trim() || null,
        quartier: String(formData.get('quartier') || '').trim() || null,
        indicative_price: String(formData.get('indicative_price') || '').trim() || null,
        contact_phone: String(formData.get('contact_phone') || '').trim() || null,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
    };
}

export async function createActivityAdminAction(formData: FormData) {
    const supabase = await requireAdmin();
    const fields = getActivityFields(formData);
    if (!fields?.title) redirect('/admin/annonces?type=activities&action=create&error=Titre%20obligatoire');

    const { data, error } = await supabase
        .from('activities')
        .insert({ ...fields, status: 'pending' })
        .select('id')
        .single();

    if (error || !data) redirect('/admin/annonces?type=activities&action=create&error=Création%20impossible');

    const imageUrls = formData.getAll('image_urls').map(String).filter(Boolean);
    if (imageUrls.length > 0) {
        await supabase.from('activity_images').insert(
            imageUrls.map((url, position) => ({ activity_id: data.id, url, position }))
        );
    }

    revalidatePath('/admin/annonces');
    redirect('/admin/annonces?type=activities&status=pending&success=created');
}

export async function updateActivityAdminAction(formData: FormData) {
    const supabase = await requireAdmin();
    const activityId = String(formData.get('activity_id') || '');
    const fields = getActivityFields(formData);
    if (!activityId || !fields?.title) redirect('/admin/annonces?type=activities&error=Mise%20%C3%A0%20jour%20invalide');

    const { error } = await supabase.from('activities').update(fields).eq('id', activityId);
    if (error) redirect(`/admin/annonces?type=activities&edit=${activityId}&error=Mise%20%C3%A0%20jour%20impossible`);

    const imageUrls = formData.getAll('image_urls').map(String).filter(Boolean);
    if (imageUrls.length > 0) {
        const { data: lastImage } = await supabase
            .from('activity_images')
            .select('position')
            .eq('activity_id', activityId)
            .order('position', { ascending: false })
            .limit(1)
            .maybeSingle();
        const startPosition = (lastImage?.position ?? -1) + 1;
        await supabase.from('activity_images').insert(
            imageUrls.map((url, index) => ({ activity_id: activityId, url, position: startPosition + index }))
        );
    }

    revalidatePath('/admin/annonces');
    redirect(`/admin/annonces?type=activities&edit=${activityId}&success=updated`);
}

export async function deleteActivityAdminAction(formData: FormData) {
    const supabase = await requireAdmin();
    const activityId = String(formData.get('activity_id') || '');
    if (!activityId) redirect('/admin/annonces?type=activities&error=ID%20invalide');

    const { data: images } = await supabase
        .from('activity_images')
        .select('url')
        .eq('activity_id', activityId);
    await supabase.from('activities').delete().eq('id', activityId);

    const paths = (images || []).map((image) => {
        const marker = '/object/public/listings/';
        const index = image.url.indexOf(marker);
        return index >= 0 ? image.url.slice(index + marker.length) : null;
    }).filter(Boolean) as string[];
    if (paths.length > 0) await supabase.storage.from('listings').remove(paths);

    revalidatePath('/admin/annonces');
    redirect('/admin/annonces?type=activities&success=deleted');
}

export async function deleteActivityImageAdminAction(formData: FormData) {
    const supabase = await requireAdmin();
    const imageId = String(formData.get('image_id') || '');
    const activityId = String(formData.get('activity_id') || '');
    const url = String(formData.get('url') || '');
    if (!imageId || !activityId) return;

    await supabase.from('activity_images').delete().eq('id', imageId).eq('activity_id', activityId);
    const marker = '/object/public/listings/';
    const index = url.indexOf(marker);
    if (index >= 0) await supabase.storage.from('listings').remove([url.slice(index + marker.length)]);

    revalidatePath('/admin/annonces');
}

// --- Modération des annonces (logements, services et activités) ------------

export async function moderateListingAction(formData: FormData) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/connexion');

    const listingType = String(formData.get('listing_type') || ''); // 'property' | 'service' | 'activity'
    const listingId = String(formData.get('listing_id') || '');
    const decision = String(formData.get('decision') || ''); // 'published' | 'rejected' | 'suspended'
    const reason = String(formData.get('reason') || '').trim();
    const redirectStatus = String(formData.get('current_filter') || 'pending');

    if (!listingId || !['property', 'service', 'activity'].includes(listingType)) {
        redirect(`/admin/annonces?error=${encodeURIComponent('Action invalide.')}`);
    }
    if (decision !== 'published' && decision !== 'rejected' && decision !== 'suspended') {
        redirect(`/admin/annonces?error=${encodeURIComponent('Décision invalide.')}`);
    }

    const statusValue = decision as Database['public']['Enums']['listing_status'];

    // RLS (properties_update_own_or_admin / services_update_own_or_admin) autorise
    // cette écriture pour is_admin() quel que soit le propriétaire.
    const { error } = listingType === 'activity'
        ? await supabase
            .from('activities')
            .update({ status: statusValue })
            .eq('id', listingId)
        : await supabase
            .from(listingType === 'property' ? 'properties' : 'services')
            .update({
                status: statusValue,
                rejection_reason: decision === 'rejected' || decision === 'suspended' ? (reason || null) : null,
            })
            .eq('id', listingId);

    if (error) {
        redirect(`/admin/annonces?error=${encodeURIComponent('Erreur lors de la mise à jour.')}`);
    }

    revalidatePath('/admin/annonces');
    redirect(`/admin/annonces?type=${listingType === 'property' ? 'properties' : listingType === 'service' ? 'services' : 'activities'}&status=${redirectStatus}&success=1`);
}

// --- Validation des retraits / payouts partenaires -------------------------

export async function markPayoutAsProcessedAction(formData: FormData) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/connexion');

    const payoutId = String(formData.get('payout_id') || '');
    const ref = String(formData.get('transaction_ref') || '').trim();

    if (!payoutId) {
        redirect(`/admin/retraits?error=${encodeURIComponent('ID de versement invalide.')}`);
    }

    const adminSupabase = createAdminClient();
    const { error } = await adminSupabase
        .from('payouts')
        .update({
            status: 'processed',
            processed_at: new Date().toISOString(),
            provider_transaction_ref: ref || null,
        })
        .eq('id', payoutId);

    if (error) {
        redirect(`/admin/retraits?error=${encodeURIComponent('Erreur lors de la validation du versement.')}`);
    }

    revalidatePath('/admin/retraits');
    redirect('/admin/retraits?success=1');
}

function getHotelFields(formData: FormData) {
    const latitude = String(formData.get('latitude') || '').trim();
    const longitude = String(formData.get('longitude') || '').trim();
    const parsedLatitude = latitude ? Number(latitude) : null;
    const parsedLongitude = longitude ? Number(longitude) : null;
    const roomUnits = Number(formData.get('room_units_count'));
    if ((parsedLatitude !== null && !Number.isFinite(parsedLatitude)) || (parsedLongitude !== null && !Number.isFinite(parsedLongitude))) return null;
    return {
        title: String(formData.get('title') || '').trim(),
        description: String(formData.get('description') || '').trim() || null,
        type: 'hotel' as const,
        hotel_name: String(formData.get('hotel_name') || '').trim(),
        room_type_label: String(formData.get('room_type_label') || '').trim(),
        room_units_count: Number.isInteger(roomUnits) && roomUnits > 0 ? roomUnits : 0,
        quartier: String(formData.get('quartier') || '').trim(),
        address: String(formData.get('address') || '').trim() || null,
        latitude: parsedLatitude,
        longitude: parsedLongitude,
        price_per_night: Number(formData.get('price_per_night')),
        capacity: Number(formData.get('capacity')),
        bedrooms: Number(formData.get('bedrooms')) || 1,
        bathrooms: Number(formData.get('bathrooms')) || 1,
    };
}

export async function createHotelAdminAction(formData: FormData) {
    const supabase = await requireAdmin();
    const fields = getHotelFields(formData);
    if (!fields?.title || !fields.hotel_name || !fields.room_type_label || !fields.quartier || fields.price_per_night <= 0 || fields.capacity <= 0 || fields.room_units_count <= 0) {
        redirect('/admin/annonces?type=properties&action=create&error=Champs%20h%C3%B4tel%20invalides');
    }
    const { data, error } = await supabase.from('properties').insert({ ...fields, host_id: (await supabase.auth.getUser()).data.user!.id, status: 'pending', rental_mode: 'courte_duree', min_nights: 1 }).select('id').single();
    if (error || !data) redirect('/admin/annonces?type=properties&action=create&error=Cr%C3%A9ation%20impossible');
    const imageUrls = formData.getAll('image_urls').map(String).filter(Boolean);
    if (imageUrls.length) await supabase.from('property_images').insert(imageUrls.map((url, position) => ({ property_id: data.id, url, position })));
    const amenityIds = formData.getAll('amenities').map(String);
    if (amenityIds.length) await supabase.from('property_amenities').insert(amenityIds.map((amenity_id) => ({ property_id: data.id, amenity_id })));
    revalidatePath('/admin/annonces');
    redirect('/admin/annonces?type=properties&status=pending&success=created');
}

export async function updateHotelAdminAction(formData: FormData) {
    const supabase = await requireAdmin();
    const propertyId = String(formData.get('property_id') || '');
    const fields = getHotelFields(formData);
    if (!propertyId || !fields?.title || !fields.hotel_name || !fields.room_type_label || !fields.quartier || fields.price_per_night <= 0 || fields.capacity <= 0 || fields.room_units_count <= 0) {
        redirect(`/admin/annonces?type=properties&edit=${propertyId}&error=Champs%20h%C3%B4tel%20invalides`);
    }
    const { error } = await supabase.from('properties').update(fields).eq('id', propertyId);
    if (error) redirect(`/admin/annonces?type=properties&edit=${propertyId}&error=Mise%20%C3%A0%20jour%20impossible`);
    await supabase.from('property_amenities').delete().eq('property_id', propertyId);
    const amenityIds = formData.getAll('amenities').map(String);
    if (amenityIds.length) await supabase.from('property_amenities').insert(amenityIds.map((amenity_id) => ({ property_id: propertyId, amenity_id })));
    const imageUrls = formData.getAll('image_urls').map(String).filter(Boolean);
    if (imageUrls.length) await supabase.from('property_images').insert(imageUrls.map((url, position) => ({ property_id: propertyId, url, position })));
    revalidatePath('/admin/annonces');
    redirect(`/admin/annonces?type=properties&edit=${propertyId}&success=updated`);
}

export async function deletePropertyImageAdminAction(formData: FormData) {
    const supabase = await requireAdmin();
    const imageId = String(formData.get('image_id') || '');
    const propertyId = String(formData.get('property_id') || '');
    const url = String(formData.get('url') || '');
    if (!imageId || !propertyId) return;
    await supabase.from('property_images').delete().eq('id', imageId).eq('property_id', propertyId);
    const marker = '/object/public/listings/';
    const index = url.indexOf(marker);
    if (index >= 0) await supabase.storage.from('listings').remove([url.slice(index + marker.length)]);
    revalidatePath('/admin/annonces');
}