import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth/get-current-profile';
import { updatePropertyAction } from '@/app/actions/property-actions';
import { updateServiceAction } from '@/app/actions/service-actions';
import { ImageUploader } from '@/components/dashboard/image-uploader';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { ServiceLocationFields } from '@/components/dashboard/service-location-fields';
import { PROPERTY_TYPE_OPTIONS } from '@/lib/listing-constants';
import { notFound } from 'next/navigation';
import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const AMENITY_CATEGORIES = [
    { key: 'general', label: 'Général' },
    { key: 'extérieur', label: 'Extérieur' },
    { key: 'cuisine', label: 'Cuisine' },
    { key: 'sécurité', label: 'Sécurité' },
];

function getAmenityIcon(iconName?: string | null): LucideIcon {
    if (!iconName) return LucideIcons.Sparkles;
    const normalized = iconName.replace(/(^|[-_\s])([a-z])/g, (_, prefix, letter) => `${prefix}${letter.toUpperCase()}`);
    return (LucideIcons as unknown as Record<string, LucideIcon>)[normalized]
        || (LucideIcons as unknown as Record<string, LucideIcon>)[iconName]
        || LucideIcons.Sparkles;
}

export default async function EditAnnoncePage({
    params,
    searchParams,
}: {
    params: { id: string };
    searchParams: { type?: string; error?: string; created?: string; updated?: string };
}) {
    const supabase = createClient();
    const profile = await getCurrentProfile();
    if (!profile) return null;

    const isService = searchParams.type === 'service' || profile.role === 'provider';

    const banner = (
        <>
            {searchParams.error && (
                <div className="mb-4 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3">{searchParams.error}</div>
            )}
            {searchParams.created && (
                <div className="mb-4 rounded-lg bg-turquoise-50 text-turquoise-800 text-sm px-4 py-3">
                    Annonce créée avec succès. Ajoutez des photos ci-dessous pour compléter votre fiche.
                </div>
            )}
            {searchParams.updated && (
                <div className="mb-4 rounded-lg bg-turquoise-50 text-turquoise-800 text-sm px-4 py-3">
                    Modifications enregistrées.
                </div>
            )}
        </>
    );

    if (isService) {
        const { data: service } = await supabase
            .from('services')
            .select('*, service_categories(id, label)')
            .eq('id', params.id)
            .single();
        if (!service) notFound();

        const { data: dbCategories } = await supabase.from('service_categories').select('id, label').order('label');
        const categoriesList = (dbCategories && dbCategories.length > 0) ? dbCategories : [
            { id: service.category_id, label: service.service_categories?.label || 'Catégorie principale' },
            { id: 'transport', label: 'Transport & VTC' },
            { id: 'restauration', label: 'Restauration & Traiteur' },
            { id: 'location_vehicule', label: 'Location de véhicule' },
            { id: 'guide', label: 'Guide & Excursions' },
            { id: 'autre', label: 'Autre service' },
        ].filter((c, index, self) => index === self.findIndex((t) => t.id === c.id));

        return (
            <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <h1 className="font-display text-3xl text-navy-800">Modifier le service</h1>
                    <StatusBadge status={service.status} />
                </div>
                {banner}
                {service.status === 'rejected' && service.rejection_reason && (
                    <div className="mb-4 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3">
                        Motif du refus : {service.rejection_reason}
                    </div>
                )}

                <form action={updateServiceAction} className="bg-white rounded-2xl border border-navy-100 p-6 space-y-5">
                    <input type="hidden" name="service_id" value={service.id} />

                    <Field label="Titre" name="title" required defaultValue={service.title} />

                    <div>
                        <label className="block text-sm font-medium text-navy-700 mb-1">Catégorie</label>
                        <select name="category_id" required defaultValue={service.category_id} className="w-full rounded-lg border border-navy-100 px-4 py-2.5 bg-white">
                            {categoriesList.map((c) => (
                                <option key={c.id} value={c.id}>{c.label}</option>
                            ))}
                        </select>
                    </div>

                    <Field label="Quartier / zone" name="quartier" defaultValue={service.quartier || ''} />

                    <div>
                        <label className="block text-sm font-medium text-navy-700 mb-1">Emplacement sur la carte</label>
                        <ServiceLocationFields initialLat={service.latitude} initialLng={service.longitude} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-navy-700 mb-1">Description</label>
                        <textarea name="description" rows={4} defaultValue={service.description || ''} className="w-full rounded-lg border border-navy-100 px-4 py-2.5" />
                    </div>

                    <Field label="Tarif indicatif" name="price" defaultValue={service.price || ''} />
                    <Field label="Prix indicatif (FCFA)" name="price_amount" type="number" defaultValue={service.price_amount == null ? '' : String(service.price_amount)} />
                    <Field label="Téléphone de contact" name="contact_phone" required defaultValue={service.contact_phone || ''} />

                    <SubmitBar />
                </form>
            </div>
        );
    }

    // --- Logement ---
    const [{ data: property }, { data: images }, { data: allAmenities }, { data: selectedAmenities }] = await Promise.all([
        supabase.from('properties').select('*').eq('id', params.id).single(),
        supabase.from('property_images').select('id, url').eq('property_id', params.id).order('position'),
        supabase.from('amenities').select('id, label, icon, category'),
        supabase.from('property_amenities').select('amenity_id').eq('property_id', params.id),
    ]);

    if (!property) notFound();
    const selectedIds = new Set((selectedAmenities || []).map((a) => a.amenity_id));

    return (
        <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
                <h1 className="font-display text-3xl text-navy-800">Modifier le logement</h1>
                <StatusBadge status={property.status} />
            </div>
            {banner}
            {property.status === 'rejected' && property.rejection_reason && (
                <div className="mb-4 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3">
                    Motif du refus : {property.rejection_reason}
                </div>
            )}

            <div className="bg-white rounded-2xl border border-navy-100 p-6 mb-6">
                <ImageUploader propertyId={property.id} images={images || []} />
            </div>

            <form action={updatePropertyAction} className="bg-white rounded-2xl border border-navy-100 p-6 space-y-5">
                <input type="hidden" name="property_id" value={property.id} />

                <Field label="Titre de l'annonce" name="title" required defaultValue={property.title} />

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-navy-700 mb-1">Type de logement</label>
                        <select name="type" required defaultValue={property.type} className="w-full rounded-lg border border-navy-100 px-4 py-2.5">
                            {PROPERTY_TYPE_OPTIONS.map((t) => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>
                    <Field label="Quartier" name="quartier" required defaultValue={property.quartier} />
                </div>

                <Field label="Adresse" name="address" defaultValue={property.address || ''} />

                <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">Description</label>
                    <textarea name="description" rows={4} defaultValue={property.description || ''} className="w-full rounded-lg border border-navy-100 px-4 py-2.5" />
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                    <Field label="Prix / nuit (FCFA)" name="price_per_night" type="number" required defaultValue={String(property.price_per_night)} />
                    <Field label="Capacité" name="capacity" type="number" required defaultValue={String(property.capacity)} />
                    <Field label="Chambres" name="bedrooms" type="number" defaultValue={String(property.bedrooms ?? 1)} />
                    <Field label="Salons" name="living_rooms" type="number" defaultValue={String(property.living_rooms ?? 0)} />
                    <Field label="Salles de bain" name="bathrooms" type="number" defaultValue={String(property.bathrooms ?? 1)} />
                </div>

                <SelectField label="Mode de location" name="rental_mode" defaultValue={property.rental_mode || 'courte_duree'} options={[
                    { value: 'courte_duree', label: 'Courte durée' },
                    { value: 'longue_duree', label: 'Longue durée' },
                    { value: 'les_deux', label: 'Les deux' },
                ]} />
                <LongTermFields property={property} />

                <div className="grid grid-cols-2 gap-4">
                    <Field label="Nuits minimum" name="min_nights" type="number" defaultValue={String(property.min_nights ?? 1)} />
                    <Field label="Nuits maximum" name="max_nights" type="number" defaultValue={property.max_nights ? String(property.max_nights) : ''} />
                </div>

                {allAmenities && allAmenities.length > 0 && (
                    <AmenityGroups amenities={allAmenities} selectedIds={selectedIds} />
                )}

                <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">Règles de la maison (une par ligne)</label>
                    <textarea name="house_rules" rows={3} defaultValue={(property.house_rules || []).join('\n')} className="w-full rounded-lg border border-navy-100 px-4 py-2.5" />
                </div>

                <SubmitBar />
            </form>
        </div>
    );
}

function Field({
    label, name, type = 'text', required = false, defaultValue,
}: {
    label: string; name: string; type?: string; required?: boolean; defaultValue?: string;
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">{label}</label>
            <input
                type={type} name={name} required={required} defaultValue={defaultValue}
                className="w-full rounded-lg border border-navy-100 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sun-400"
            />
        </div>
    );
}

function AmenityGroups({ amenities, selectedIds }: { amenities: Array<{ id: string; label: string; icon: string | null; category: string | null }>; selectedIds: Set<string> }) {
    return (
        <div>
            <span className="block text-sm font-medium text-navy-700 mb-3">Équipements</span>
            <div className="space-y-4">
                {AMENITY_CATEGORIES.map((category) => {
                    const items = amenities.filter((amenity) => (amenity.category || 'general') === category.key);
                    if (items.length === 0) return null;
                    return (
                        <div key={category.key}>
                            <h3 className="mb-2 text-sm font-semibold capitalize text-navy-800">{category.label}</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {items.map((amenity) => {
                                    const Icon = getAmenityIcon(amenity.icon);
                                    return (
                                        <label key={amenity.id} className="flex items-center gap-2 text-sm text-navy-700">
                                            <input type="checkbox" name="amenities" value={amenity.id} defaultChecked={selectedIds.has(amenity.id)} />
                                            <Icon className="h-4 w-4 text-sun-500" />
                                            {amenity.label}
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function LongTermFields({ property }: { property: any }) {
    return (
        <fieldset className="long-term-fields rounded-xl border border-navy-100 bg-warm/40 p-4">
            <legend className="px-1 font-display text-lg font-bold text-navy-800">Informations longue durée</legend>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Prix / mois (FCFA)" name="price_per_month" type="number" defaultValue={property.price_per_month == null ? '' : String(property.price_per_month)} />
                <Field label="Caution (FCFA)" name="deposit_amount" type="number" defaultValue={property.deposit_amount == null ? '' : String(property.deposit_amount)} />
                <Field label="Nombre de mois d'avance demandés" name="advance_months" type="number" defaultValue={property.advance_months == null ? '' : String(property.advance_months)} />
                <SelectField label="Type d'électricité" name="electricity_type" defaultValue={property.electricity_type || ''} options={['Compteur individuel', 'Compteur partagé', 'Groupe électrogène', 'Aucun'].map((value) => ({ value, label: value }))} />
                <SelectField label="Source d'eau" name="water_source" defaultValue={property.water_source || ''} options={['Robinet CDE', 'Forage', 'Puits', 'Citerne', 'Aucun'].map((value) => ({ value, label: value }))} />
                <SelectField label="Accès à la route" name="road_access" defaultValue={property.road_access || ''} options={['Bord de route bitumée', 'À moins de 100m', 'Accès non bitumé', 'Éloigné de la route'].map((value) => ({ value, label: value }))} />
                <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
                    <CheckboxField label="Clôturé" name="is_fenced" defaultChecked={!!property.is_fenced} />
                    <CheckboxField label="Portail" name="has_gate" defaultChecked={!!property.has_gate} />
                    <CheckboxField label="Meublé" name="is_furnished" defaultChecked={!!property.is_furnished} />
                </div>
            </div>
            <style jsx>{`form:has(select[name="rental_mode"] option[value="longue_duree"]:checked) .long-term-fields, form:has(select[name="rental_mode"] option[value="les_deux"]:checked) .long-term-fields { display: block; } .long-term-fields { display: none; }`}</style>
        </fieldset>
    );
}

function SelectField({ label, name, options, defaultValue }: { label: string; name: string; options: Array<{ value: string; label: string }>; defaultValue?: string }) {
    return <div><label className="block text-sm font-medium text-navy-700 mb-1">{label}</label><select name={name} defaultValue={defaultValue} className="w-full rounded-lg border border-navy-100 px-4 py-2.5 bg-white"><option value="">Sélectionner</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>;
}

function CheckboxField({ label, name, defaultChecked = false }: { label: string; name: string; defaultChecked?: boolean }) {
    return <label className="flex items-center gap-2 text-sm text-navy-700"><input type="checkbox" name={name} defaultChecked={defaultChecked} />{label}</label>;
}

function SubmitBar() {
    return (
        <div className="pt-2">
            <button type="submit" className="bg-sun-400 hover:bg-sun-500 text-white font-semibold rounded-full px-6 py-3 transition">
                Enregistrer
            </button>
        </div>
    );
}