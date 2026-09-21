import { createClient } from '@/lib/supabase/server';
import {
    createActivityAdminAction,
    deleteActivityAdminAction,
    deleteActivityImageAdminAction,
    moderateListingAction,
    updateActivityAdminAction,
    createHotelAdminAction,
    updateHotelAdminAction,
    deletePropertyImageAdminAction,
} from '@/app/actions/admin-actions';
import { ActivityForm } from '@/components/admin/activity-form';
import { PropertyForm } from '@/components/admin/property-form';
import Link from 'next/link';

const TYPE_TABS = [
    { value: 'properties', label: '🏠 Logements' },
    { value: 'services', label: '🔧 Services' },
    { value: 'activities', label: '🌴 Activités' },
];

const STATUS_TABS = [
    { value: 'pending', label: 'En attente', color: 'bg-amber-500' },
    { value: 'published', label: 'Publiés', color: 'bg-emerald-500' },
    { value: 'rejected', label: 'Refusés', color: 'bg-red-500' },
    { value: 'suspended', label: 'Suspendus', color: 'bg-gray-500' },
];

export default async function AnnoncesPage({
    searchParams,
}: {
    searchParams: { type?: string; status?: string; error?: string; success?: string; action?: string; edit?: string };
}) {
    const supabase = createClient();
    const type = searchParams.type || 'properties';
    const status = searchParams.status || 'pending';
    const isProperty = type === 'properties';
    const isService = type === 'services';
    const isActivity = type === 'activities';

    // Comptages par statut pour badges
    const [
        { count: countPendingProp },
        { count: countPendingSrv },
        { count: countPublishedProp },
        { count: countPublishedSrv },
        { count: countRejectedProp },
        { count: countRejectedSrv },
        { count: countPendingActivity },
        { count: countPublishedActivity },
        { count: countRejectedActivity },
    ] = await Promise.all([
        supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('services').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('services').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'rejected'),
        supabase.from('services').select('id', { count: 'exact', head: true }).eq('status', 'rejected'),
        supabase.from('activities').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('activities').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('activities').select('id', { count: 'exact', head: true }).eq('status', 'rejected'),
    ]);

    // Listing selon type et statut sélectionnés
    const propertiesResult = isProperty
        ? await supabase
            .from('properties')
            .select('id, title, type, hotel_name, room_type_label, room_units_count, quartier, status, rejection_reason, created_at, profiles!properties_host_id_fkey(full_name, phone, email)')
            .eq('status', status as any)
            .order('hotel_name', { ascending: true, nullsFirst: false })
            .order('room_type_label', { ascending: true, nullsFirst: false })
            .order('created_at', { ascending: status === 'pending' })
        : { data: [] };

    const servicesResult = isService
        ? await supabase
            .from('services')
            .select('id, title, quartier, status, rejection_reason, created_at, profiles!services_provider_id_fkey(full_name, phone, email)')
            .eq('status', status as any)
            .order('created_at', { ascending: status === 'pending' })
        : { data: [] };

    const activitiesResult = isActivity
        ? await supabase
            .from('activities')
            .select('id, title, description, quartier, indicative_price, contact_phone, latitude, longitude, status, rejection_reason, created_at')
            .eq('status', status as any)
            .order('created_at', { ascending: status === 'pending' })
        : { data: [] };

    const listings = (isProperty ? propertiesResult.data : isService ? servicesResult.data : activitiesResult.data) || [];

    const pendingCount = isProperty ? (countPendingProp ?? 0) : isService ? (countPendingSrv ?? 0) : (countPendingActivity ?? 0);
    const publishedCount = isProperty ? (countPublishedProp ?? 0) : isService ? (countPublishedSrv ?? 0) : (countPublishedActivity ?? 0);
    const rejectedCount = isProperty ? (countRejectedProp ?? 0) : isService ? (countRejectedSrv ?? 0) : (countRejectedActivity ?? 0);

    const activityToEdit = isActivity && searchParams.edit
        ? (await supabase.from('activities').select('*').eq('id', searchParams.edit).single()).data
        : null;
    const activityImages = activityToEdit
        ? ((await supabase.from('activity_images').select('id, url, position').eq('activity_id', activityToEdit.id).order('position')).data || [])
        : [];
    const propertyToEdit = isProperty && searchParams.edit
        ? (await supabase.from('properties').select('*').eq('id', searchParams.edit).single()).data
        : null;
    const propertyImages = propertyToEdit
        ? ((await supabase.from('property_images').select('id, url, position').eq('property_id', propertyToEdit.id).order('position')).data || [])
        : [];
    const { data: amenities } = isProperty ? await supabase.from('amenities').select('id, label').order('label') : { data: [] };
    const { data: selectedAmenities } = propertyToEdit ? await supabase.from('property_amenities').select('amenity_id').eq('property_id', propertyToEdit.id) : { data: [] };

    function countForStatus(s: string) {
        if (s === 'pending') return pendingCount;
        if (s === 'published') return publishedCount;
        if (s === 'rejected') return rejectedCount;
        return 0;
    }

    return (
        <div>
            <h1 className="font-display text-3xl text-navy-800 mb-1">Annonces</h1>
            <p className="text-navy-400 mb-6">Gestion et modération des logements, services et activités.</p>

            {/* Alertes */}
            {searchParams.error && (
                <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
                    ❌ {searchParams.error}
                </div>
            )}
            {searchParams.success && (
                <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3">
                    ✅ Annonce mise à jour avec succès.
                </div>
            )}

            {/* Onglets Type */}
            <div className="flex gap-2 mb-5">
                {TYPE_TABS.map((tab) => {
                    const badgeCount = tab.value === 'properties'
                        ? (countPendingProp ?? 0)
                        : tab.value === 'services'
                        ? (countPendingSrv ?? 0)
                        : (countPendingActivity ?? 0);
                    return (
                        <Link
                            key={tab.value}
                            href={`/admin/annonces?type=${tab.value}&status=${status}`}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition ${
                                type === tab.value
                                    ? 'bg-navy-800 text-white shadow-sm'
                                    : 'bg-white border border-navy-100 text-navy-600 hover:bg-navy-50'
                            }`}
                        >
                            {tab.label}
                            {badgeCount > 0 && (
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-400 text-white text-[10px] font-bold">
                                    {badgeCount}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </div>

            {isActivity && !searchParams.action && !searchParams.edit && (
                <div className="mb-5">
                    <Link href="/admin/annonces?type=activities&action=create" className="inline-flex rounded-full bg-sun-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm">
                        + Créer une activité
                    </Link>
                </div>
            )}

            {isActivity && (searchParams.action === 'create' || activityToEdit) && (
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-display text-2xl text-navy-800">{activityToEdit ? 'Modifier l’activité' : 'Nouvelle activité'}</h2>
                        <Link href="/admin/annonces?type=activities" className="text-sm text-navy-500 hover:text-navy-800">Retour à la liste</Link>
                    </div>
                    <ActivityForm
                        action={activityToEdit ? updateActivityAdminAction : createActivityAdminAction}
                        deleteImageAction={deleteActivityImageAdminAction}
                        activity={activityToEdit || undefined}
                        images={activityImages}
                    />
                </div>
            )}

            {isProperty && !searchParams.action && propertyToEdit && (
                <div className="mb-8">
                    <div className="mb-4 flex items-center justify-between"><h2 className="font-display text-2xl text-navy-800">Modifier la fiche hôtel</h2><Link href="/admin/annonces?type=properties" className="text-sm text-navy-500">Retour à la liste</Link></div>
                    <PropertyForm action={updateHotelAdminAction} deleteImageAction={deletePropertyImageAdminAction} property={propertyToEdit} images={propertyImages} amenities={amenities || []} selectedAmenityIds={(selectedAmenities || []).map((item) => item.amenity_id)} />
                </div>
            )}
            {isProperty && searchParams.action === 'create' && (
                <div className="mb-8"><div className="mb-4 flex items-center justify-between"><h2 className="font-display text-2xl text-navy-800">Nouvelle fiche hôtel</h2><Link href="/admin/annonces?type=properties" className="text-sm text-navy-500">Retour à la liste</Link></div><PropertyForm action={createHotelAdminAction} deleteImageAction={deletePropertyImageAdminAction} amenities={amenities || []} /></div>
            )}

            {/* Onglets Statut */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {STATUS_TABS.map((tab) => {
                    const count = countForStatus(tab.value);
                    return (
                        <Link
                            key={tab.value}
                            href={`/admin/annonces?type=${type}&status=${tab.value}`}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
                                status === tab.value
                                    ? `${tab.color} text-white shadow-sm`
                                    : 'bg-white border border-navy-100 text-navy-500 hover:bg-navy-50'
                            }`}
                        >
                            {tab.label}
                            {count > 0 && (
                                <span className={`text-xs font-bold ${status === tab.value ? 'opacity-80' : 'text-navy-400'}`}>
                                    ({count})
                                </span>
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* Liste des annonces */}
            {isProperty && !searchParams.action && !searchParams.edit && <div className="mb-5"><Link href="/admin/annonces?type=properties&action=create" className="inline-flex rounded-full bg-sun-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm">+ Créer une fiche hôtel</Link></div>}
            {listings.length === 0 ? (
                <div className="bg-white rounded-2xl border border-navy-100 p-12 text-center text-navy-400">
                    <p className="text-4xl mb-3">{status === 'pending' ? '🎉' : '📭'}</p>
                    <p className="font-medium">Aucune annonce dans cette catégorie.</p>
                    {status === 'pending' && (
                        <p className="text-sm mt-1">Toutes les annonces ont été traitées !</p>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {(listings as any[]).map((listing, index) => {
                        const owner = Array.isArray(listing.profiles) ? listing.profiles[0] : listing.profiles;
                        const previous = (listings as any[])[index - 1];
                        const hotelHeader = isProperty && listing.type === 'hotel' && listing.hotel_name && listing.hotel_name !== previous?.hotel_name;
                        return (
                            <div key={listing.id}>{hotelHeader && <div className="mb-2 mt-6 border-b border-navy-200 pb-2 text-lg font-bold text-navy-800">Hôtel {listing.hotel_name}</div>}<div className="bg-white rounded-2xl border border-navy-100 p-5 shadow-sm">
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-navy-800 text-base truncate">{isProperty && listing.type === 'hotel' ? listing.room_type_label || listing.title : listing.title}</p>
                                        <p className="text-sm text-navy-400 mt-0.5">
                                            📍 {listing.quartier || 'Quartier non précisé'} ·{' '}
                                            {isProperty ? '🏠 Logement' : isService ? '🔧 Service' : '🌴 Activité'} ·{' '}
                                            {new Date(listing.created_at).toLocaleDateString('fr-FR', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </p>
                                        {isActivity && listing.contact_phone && (
                                            <p className="text-sm text-navy-500 mt-1">📞 {listing.contact_phone}</p>
                                        )}
                                        {owner && (
                                            <p className="text-sm text-navy-500 mt-1">
                                                👤 <strong>{owner.full_name}</strong>
                                                {owner.phone && <span> · 📞 {owner.phone}</span>}
                                                {owner.email && <span className="text-navy-400"> · {owner.email}</span>}
                                            </p>
                                        )}
                                        {listing.rejection_reason && (
                                            <p className="text-xs text-red-600 mt-2 bg-red-50 rounded-lg px-3 py-2">
                                                ⚠️ Motif de refus : {listing.rejection_reason}
                                            </p>
                                        )}
                                    </div>
                                    <span
                                        className={`shrink-0 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                                            listing.status === 'published'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : listing.status === 'pending'
                                                ? 'bg-amber-100 text-amber-700'
                                                : listing.status === 'rejected'
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-gray-100 text-gray-600'
                                        }`}
                                    >
                                        {listing.status === 'published'
                                            ? '✅ Publié'
                                            : listing.status === 'pending'
                                            ? '⏳ En attente'
                                            : listing.status === 'rejected'
                                            ? '❌ Refusé'
                                            : '🚫 Suspendu'}
                                    </span>
                                </div>

                                {/* Actions de modération */}
                                <form action={moderateListingAction} className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-navy-50">
                                    <input type="hidden" name="listing_type" value={isProperty ? 'property' : isService ? 'service' : 'activity'} />
                                    <input type="hidden" name="listing_id" value={listing.id} />
                                    <input type="hidden" name="current_filter" value={status} />
                                    <input
                                        type="text"
                                        name="reason"
                                        placeholder="Motif (obligatoire si refus ou suspension)"
                                        className="flex-1 min-w-[220px] rounded-lg border border-navy-100 px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-navy-200"
                                    />
                                    {listing.status !== 'published' && (
                                        <button
                                            type="submit"
                                            name="decision"
                                            value="published"
                                            className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-full px-4 py-2 transition shadow-sm"
                                        >
                                            ✅ Publier
                                        </button>
                                    )}
                                    {listing.status !== 'rejected' && (
                                        <button
                                            type="submit"
                                            name="decision"
                                            value="rejected"
                                            className="bg-white border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold rounded-full px-4 py-2 transition"
                                        >
                                            ❌ Refuser
                                        </button>
                                    )}
                                    {listing.status === 'published' && (
                                        <button
                                            type="submit"
                                            name="decision"
                                            value="suspended"
                                            className="bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-semibold rounded-full px-4 py-2 transition"
                                        >
                                            🚫 Suspendre
                                        </button>
                                    )}
                                </form>
                                {isProperty && listing.type === 'hotel' && <div className="mt-3"><Link href={`/admin/annonces?type=properties&edit=${listing.id}`} className="text-sm font-semibold text-navy-700 hover:text-sun-600">Modifier la fiche</Link><span className="ml-4 text-sm text-navy-500">{listing.room_units_count} unité(s)</span></div>}
                                {isActivity && (
                                    <div className="flex items-center gap-3 mt-3">
                                        <Link href={`/admin/annonces?type=activities&edit=${listing.id}`} className="text-sm font-semibold text-navy-700 hover:text-sun-600">Modifier</Link>
                                        <form action={deleteActivityAdminAction}>
                                            <input type="hidden" name="activity_id" value={listing.id} />
                                            <button type="submit" className="text-sm font-semibold text-red-600 hover:text-red-700">Supprimer</button>
                                        </form>
                                    </div>
                                )}
                            </div></div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
