'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * Retourne toutes les dates indisponibles pour un logement donné.
 * Inclut les réservations avec status 'accepted' ou 'completed'.
 * Chaque date est au format 'YYYY-MM-DD'.
 */
export async function getUnavailableDates(propertyId: string): Promise<string[]> {
    const supabase = createClient();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const { data, error } = await supabase
        .from('bookings')
        .select('check_in, check_out')
        .eq('property_id', propertyId)
        .in('status', ['accepted', 'completed'])
        .gte('check_out', todayStr);

    if (error || !data) return [];

    const unavailable: string[] = [];

    for (const booking of data) {
        const start = new Date(booking.check_in);
        const end = new Date(booking.check_out);

        // Inclure toutes les dates du check_in au check_out (exclu)
        const cur = new Date(start);
        while (cur < end) {
            unavailable.push(cur.toISOString().split('T')[0]);
            cur.setDate(cur.getDate() + 1);
        }
    }

    return unavailable;
}
