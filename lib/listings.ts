import { createClient } from '@/lib/supabase/server';
import type { Property } from '@/types';
import { FALLBACK_PROPERTY_IMAGE, PROPERTY_TYPE_LABELS } from '@/lib/listing-constants';

export interface PropertyFilters {
    quartier?: string;
    type?: string;
    priceMin?: number;
    priceMax?: number;
    guests?: number;
    checkIn?: string;   // YYYY-MM-DD
    checkOut?: string;  // YYYY-MM-DD
    limit?: number;
}

/**
 * Retourne les quartiers distincts des logements publiés.
 * Utilisé pour alimenter le select de filtres côté serveur.
 */
export async function getDistinctQuartiers(): Promise<string[]> {
    const supabase = createClient();
    const { data } = await supabase
        .from('properties')
        .select('quartier')
        .eq('status', 'published')
        .not('quartier', 'is', null)
        .order('quartier', { ascending: true });

    if (!data) return [];

    const seen = new Set<string>();
    const quartiers: string[] = [];
    for (const row of data) {
        const q = (row.quartier as string | null)?.trim();
        if (q && !seen.has(q)) {
            seen.add(q);
            quartiers.push(q);
        }
    }
    return quartiers;
}

/**
 * Renvoie les IDs de logements ayant une réservation qui chevauche
 * l'intervalle [checkIn, checkOut) avec status accepted ou completed.
 * Chevauchement : booking.check_in < checkOut AND booking.check_out > checkIn
 */
async function getBookedPropertyIds(checkIn: string, checkOut: string): Promise<string[]> {
    const supabase = createClient();
    const { data } = await supabase
        .from('bookings')
        .select('property_id')
        .in('status', ['accepted', 'completed'])
        .lt('check_in', checkOut)
        .gt('check_out', checkIn);

    if (!data) return [];
    return Array.from(new Set(data.map((b: any) => b.property_id as string)));
}

export async function getPublishedProperties(filters: PropertyFilters = {}): Promise<Property[]> {
    const supabase = createClient();

    // Pré-filtre dates : collecter les IDs de logements non disponibles
    let excludedIds: string[] = [];
    if (filters.checkIn && filters.checkOut && filters.checkIn < filters.checkOut) {
        excludedIds = await getBookedPropertyIds(filters.checkIn, filters.checkOut);
    }

    let query = supabase
        .from('properties')
        .select(`
    id, title, type, hotel_name, room_type_label, quartier, price_per_night, capacity, average_rating, review_count, created_at,
      rental_mode, price_per_month, min_months, latitude, longitude,
      property_images ( url, position ),
      property_amenities ( amenities ( label ) )
    `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

    if (filters.quartier) {
        query = query.ilike('quartier', `%${filters.quartier}%`);
    }
    if (filters.type) {
        query = query.eq('type', filters.type as any);
    }
    if (filters.priceMin !== undefined && filters.priceMin > 0) {
        query = query.gte('price_per_night', filters.priceMin);
    }
    if (filters.priceMax !== undefined && filters.priceMax > 0) {
        query = query.lte('price_per_night', filters.priceMax);
    }
    if (filters.guests !== undefined && filters.guests > 0) {
        query = query.gte('capacity', filters.guests);
    }
    if (excludedIds.length > 0) {
        // Supabase .not() avec 'in' attend la syntaxe PostgreSQL array littéral
        query = query.not('id', 'in', `(${excludedIds.join(',')})`);
    }

    if (filters.limit) query = query.limit(filters.limit);

    const { data } = await query;
    if (!data) return [];

    return data.map((p: any) => {
        const sortedImages = [...(p.property_images || [])].sort((a, b) => a.position - b.position);
        const isNew = Date.now() - new Date(p.created_at).getTime() < 14 * 24 * 60 * 60 * 1000;
        const isLongTerm = p.rental_mode === 'longue_duree' || p.rental_mode === 'les_deux';

        return {
            id: p.id,
            name: p.title,
            image: sortedImages[0]?.url || FALLBACK_PROPERTY_IMAGE,
            badge: isNew ? 'Nouveau' : undefined,
            rating: p.average_rating || 0,
            type: PROPERTY_TYPE_LABELS[p.type] || p.type,
            location: p.quartier,
            features: (p.property_amenities || [])
                .map((pa: any) => pa.amenities?.label)
                .filter(Boolean)
                .slice(0, 3),
            pricePerNight: p.price_per_night,
            currency: 'FCFA',
            reviewCount: p.review_count || 0,
            rentalMode: p.rental_mode || 'courte_duree',
            pricePerMonth: p.price_per_month,
            minMonths: p.min_months,
            isLongTermAvailable: isLongTerm,
            latitude: p.latitude,
            longitude: p.longitude,
            hotel_name: p.hotel_name,
            room_type_label: p.room_type_label,
        };
    });
}