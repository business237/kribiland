import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth/get-current-profile';
import { createPropertyAction } from '@/app/actions/property-actions';
import { createServiceAction } from '@/app/actions/service-actions';
import { PROPERTY_TYPE_OPTIONS } from '@/lib/listing-constants';
import { ServiceLocationFields } from '@/components/dashboard/service-location-fields';
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

export default async function NouvelleAnnoncePage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const supabase = createClient();
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const isHost = profile.role === 'host';

  const errorBanner = searchParams.error && (
    <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 font-medium">
      ⚠️ {searchParams.error}
    </div>
  );

  if (isHost) {
    const { data: amenities } = await supabase.from('amenities').select('id, label, slug, icon, category').order('label');

    return (
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl text-navy-800 mb-6">Nouveau logement</h1>
        {errorBanner}

        <form action={createPropertyAction} className="bg-white rounded-2xl border border-navy-100 p-6 space-y-5">
          <Field label="Titre de l'annonce *" name="title" required placeholder="Villa Les Cocotiers" />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Type de logement *</label>
              <select name="type" required className="w-full rounded-lg border border-navy-100 px-4 py-2.5 bg-white">
                {PROPERTY_TYPE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <Field label="Quartier *" name="quartier" required placeholder="Ngoyé" />
          </div>

          <Field label="Adresse (optionnel)" name="address" />

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">Description</label>
            <textarea name="description" rows={4} className="w-full rounded-lg border border-navy-100 px-4 py-2.5" />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            <Field label="Prix / nuit (FCFA) *" name="price_per_night" type="number" required />
            <Field label="Capacité (personnes) *" name="capacity" type="number" required />
            <Field label="Chambres" name="bedrooms" type="number" defaultValue="1" />
            <Field label="Salons" name="living_rooms" type="number" defaultValue="0" />
            <Field label="Salles de bain" name="bathrooms" type="number" defaultValue="1" />
          </div>

          <SelectField label="Mode de location" name="rental_mode" defaultValue="courte_duree" options={[
            { value: 'courte_duree', label: 'Courte durée' },
            { value: 'longue_duree', label: 'Longue durée' },
            { value: 'les_deux', label: 'Les deux' },
          ]} />
          <LongTermFields />

          <div className="grid grid-cols-2 gap-4">
            <Field label="Nuits minimum" name="min_nights" type="number" defaultValue="1" />
            <Field label="Nuits maximum (optionnel)" name="max_nights" type="number" />
          </div>

          {amenities && amenities.length > 0 && (
            <AmenityGroups amenities={amenities} />
          )}

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">
              Règles de la maison <span className="text-navy-300 font-normal">(une par ligne)</span>
            </label>
            <textarea name="house_rules" rows={3} placeholder={'Non-fumeur\nPas d\'animaux\nPas de fête'} className="w-full rounded-lg border border-navy-100 px-4 py-2.5" />
          </div>

          <SubmitBar />
        </form>
      </div>
    );
  }

  // --- Prestataire de service ---
  // On charge les catégories depuis la BD. Si la table est vide, on affiche
  // les catégories statiques avec leur slug (défini comme enum PostgreSQL).
  const supabase2 = createClient();
  const { data: dbCats } = await supabase2.from('service_categories').select('id, label, slug').order('label');

  const STATIC_CATS = [
    { id: 'transport',         slug: 'transport',         label: 'Transport & VTC' },
    { id: 'restauration',      slug: 'restauration',      label: 'Restauration & Traiteur' },
    { id: 'location_vehicule', slug: 'location_vehicule', label: 'Location de véhicule' },
    { id: 'guide',             slug: 'guide',             label: 'Guide & Excursions' },
  ];

  // Si la table a des vraies lignes on les utilise, sinon les statiques (slug comme valeur)
  const categoriesList = (dbCats && dbCats.length > 0)
    ? dbCats
    : STATIC_CATS;

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl text-navy-800 mb-6">Nouveau service</h1>
      {errorBanner}

      <form action={createServiceAction} className="bg-white rounded-2xl border border-navy-100 p-6 space-y-5">
        <Field label="Titre de l'annonce *" name="title" required placeholder="Transport moto-taxi Kribi centre" />

        <div>
          <label className="block text-sm font-medium text-navy-700 mb-1">Catégorie *</label>
          <select name="category_id" required className="w-full rounded-lg border border-navy-100 px-4 py-2.5 bg-white">
            {categoriesList.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>

        <Field label="Quartier / zone d'intervention" name="quartier" placeholder="Ex: Kribi et alentours" />

        <div>
          <label className="block text-sm font-medium text-navy-700 mb-1">Emplacement sur la carte</label>
          <ServiceLocationFields />
        </div>

        <div>
          <label className="block text-sm font-medium text-navy-700 mb-1">Description</label>
          <textarea name="description" rows={4} className="w-full rounded-lg border border-navy-100 px-4 py-2.5" placeholder="Décrivez votre prestation et vos compétences..." />
        </div>

        <Field label="Tarif indicatif" name="price" placeholder="Ex: À partir de 1000 FCFA" />
        <Field label="Prix indicatif (FCFA)" name="price_amount" type="number" placeholder="Ex: 15000" />
        <Field label="Téléphone de contact *" name="contact_phone" required defaultValue={profile.phone || ''} placeholder="+237 6XX XXX XXX" />

        <SubmitBar />
      </form>
    </div>
  );
}

function AmenityGroups({ amenities }: { amenities: Array<{ id: string; label: string; icon: string | null; category: string | null }> }) {
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
                      <input type="checkbox" name="amenities" value={amenity.id} />
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

function LongTermFields() {
  return (
    <fieldset className="long-term-fields rounded-xl border border-navy-100 bg-warm/40 p-4">
      <legend className="px-1 font-display text-lg font-bold text-navy-800">Informations longue durée</legend>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Prix / mois (FCFA)" name="price_per_month" type="number" />
        <Field label="Caution (FCFA)" name="deposit_amount" type="number" />
        <Field label="Nombre de mois d'avance demandés" name="advance_months" type="number" />
        <SelectField label="Type d'électricité" name="electricity_type" options={['Compteur individuel', 'Compteur partagé', 'Groupe électrogène', 'Aucun'].map((value) => ({ value, label: value }))} />
        <SelectField label="Source d'eau" name="water_source" options={['Robinet CDE', 'Forage', 'Puits', 'Citerne', 'Aucun'].map((value) => ({ value, label: value }))} />
        <SelectField label="Accès à la route" name="road_access" options={['Bord de route bitumée', 'À moins de 100m', 'Accès non bitumé', 'Éloigné de la route'].map((value) => ({ value, label: value }))} />
        <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
          <CheckboxField label="Clôturé" name="is_fenced" />
          <CheckboxField label="Portail" name="has_gate" />
          <CheckboxField label="Meublé" name="is_furnished" />
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

function Field({
  label, name, type = 'text', required = false, placeholder, defaultValue,
}: {
  label: string; name: string; type?: string; required?: boolean; placeholder?: string; defaultValue?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-navy-700 mb-1">{label}</label>
      <input
        type={type} name={name} required={required} placeholder={placeholder} defaultValue={defaultValue}
        className="w-full rounded-lg border border-navy-100 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sun-400"
      />
    </div>
  );
}

function SubmitBar() {
  return (
    <div className="pt-2">
      <button type="submit" className="bg-sun-500 hover:bg-sun-600 text-white font-semibold rounded-full px-6 py-3 transition shadow-md">
        Créer l'annonce
      </button>
      <p className="text-xs text-navy-400 mt-2 font-medium flex items-center gap-1">
        📸 <span>L'ajout de vos photos s'effectuera à l'étape suivante, dès la validation de ce formulaire.</span>
      </p>
    </div>
  );
}
