import { createClient, createAdminClient } from '@/lib/supabase/server';

export interface ServiceListing {
    id: string;
    title: string;
    description: string | null;
    price: string | null;
    priceAmount: number | null;
    quartier: string | null;
    contact_phone: string | null;
    average_rating: number | null;
    review_count: number | null;
    category: {
        label: string;
        slug: string;
        icon: string | null;
    };
    provider: {
        full_name: string;
        business_name: string | null;
    };
}

// Icônes et couleurs par catégorie de service (fallback quand la DB n'a pas d'icône)
export const SERVICE_CATEGORY_META: Record<string, { emoji: string; color: string; bg: string }> = {
    transport: { emoji: '🚗', color: '#2563eb', bg: '#dbeafe' },
    restauration: { emoji: '🍽️', color: '#16a34a', bg: '#dcfce7' },
    location_vehicule: { emoji: '🛵', color: '#d97706', bg: '#fef3c7' },
    guide: { emoji: '🧭', color: '#9333ea', bg: '#f3e8ff' },
};

export interface ServicePriceFilters {
    priceMin?: number;
    priceMax?: number;
}

export async function getPublishedServices(limit?: number, filters: ServicePriceFilters = {}): Promise<ServiceListing[]> {
    const supabase = createClient();

    let query = supabase
        .from('services')
        .select(`
            id, title, description, price, price_amount, quartier, contact_phone, average_rating, review_count,
            service_categories ( label, slug, icon ),
            profiles!services_provider_id_fkey ( full_name, business_name )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

    const hasPriceFilter = filters.priceMin !== undefined || filters.priceMax !== undefined;
    if (hasPriceFilter) {
        query = query.not('price_amount', 'is', null);
        if (filters.priceMin !== undefined) query = query.gte('price_amount', filters.priceMin);
        if (filters.priceMax !== undefined) query = query.lte('price_amount', filters.priceMax);
    }

    if (limit) query = query.limit(limit);

    const { data } = await query;
    if (!data) return [];

    return data.map((s: any) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        price: s.price,
        priceAmount: s.price_amount,
        quartier: s.quartier,
        contact_phone: s.contact_phone,
        average_rating: s.average_rating,
        review_count: s.review_count,
        category: {
            label: s.service_categories?.label || 'Service',
            slug: s.service_categories?.slug || 'transport',
            icon: s.service_categories?.icon || null,
        },
        provider: {
            full_name: s.profiles?.full_name || '',
            business_name: s.profiles?.business_name || null,
        },
    }));
}

export async function getServiceCategories() {
    const supabase = createClient();
    const { data } = await supabase
        .from('service_categories')
        .select('id, label, slug, icon')
        .order('label');

    if (data && data.length > 0) {
        return data;
    }

    // Si la table service_categories est vide en BD, on insère automatiquement les catégories par défaut
    try {
        const adminSupabase = createAdminClient();
        const defaultCats = [
            { slug: 'transport', label: 'Transport & VTC', icon: '🚗' },
            { slug: 'restauration', label: 'Restauration & Traiteur', icon: '🍽️' },
            { slug: 'location_vehicule', label: 'Location de véhicule', icon: '🛵' },
            { slug: 'guide', label: 'Guide & Excursions', icon: '🧭' },
            { slug: 'autre', label: 'Autre service', icon: '⚡' },
        ];

        const { data: seeded } = await adminSupabase
            .from('service_categories')
            .upsert(defaultCats as any, { onConflict: 'slug' })
            .select('id, label, slug, icon');

        if (seeded && seeded.length > 0) {
            return seeded;
        }
    } catch (e) {
        console.error('Erreur auto-seeding service_categories:', e);
    }

    return data || [];
}
