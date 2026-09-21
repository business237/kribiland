import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth/get-current-profile';
import { updateServiceAction } from '@/app/actions/service-actions';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { ServiceLocationFields } from '@/components/dashboard/service-location-fields';
import { notFound, redirect } from 'next/navigation';

export default async function EditServicePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string; created?: string; updated?: string };
}) {
  const supabase = createClient();
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect('/connexion');
  }

  if (profile.role !== 'provider') {
    redirect('/dashboard');
  }

  const { data: service } = await supabase
    .from('services')
    .select('*, service_categories(id, label)')
    .eq('id', params.id)
    .single();

  if (!service || service.provider_id !== profile.id) {
    notFound();
  }

  const { data: dbCategories } = await supabase
    .from('service_categories')
    .select('id, label')
    .order('label');

  const categoriesList =
    dbCategories && dbCategories.length > 0
      ? dbCategories
      : [
          {
            id: service.category_id,
            label: service.service_categories?.label || 'Catégorie principale',
          },
          { id: 'transport', label: 'Transport & VTC' },
          { id: 'restauration', label: 'Restauration & Traiteur' },
          { id: 'location_vehicule', label: 'Location de véhicule' },
          { id: 'guide', label: 'Guide & Excursions' },
          { id: 'autre', label: 'Autre service' },
        ].filter((c, index, self) => index === self.findIndex((t) => t.id === c.id));

  const banner = (
    <>
      {searchParams.error && (
        <div className="mb-4 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3 font-medium">
          ⚠️ {searchParams.error}
        </div>
      )}
      {searchParams.created && (
        <div className="mb-4 rounded-lg bg-turquoise-50 text-turquoise-800 text-sm px-4 py-3 font-medium">
          ✅ Service créé avec succès.
        </div>
      )}
      {searchParams.updated && (
        <div className="mb-4 rounded-lg bg-turquoise-50 text-turquoise-800 text-sm px-4 py-3 font-medium">
          ✅ Modifications enregistrées.
        </div>
      )}
    </>
  );

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="font-display text-3xl text-navy-800">Modifier le service</h1>
        <StatusBadge status={service.status} />
      </div>

      {banner}

      {service.status === 'rejected' && service.rejection_reason && (
        <div className="mb-4 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3 font-medium">
          Motif du refus : {service.rejection_reason}
        </div>
      )}

      <form action={updateServiceAction} className="bg-white rounded-2xl border border-navy-100 p-6 space-y-5 shadow-sm">
        <input type="hidden" name="service_id" value={service.id} />

        <Field label="Titre de l'annonce *" name="title" required defaultValue={service.title} />

        <div>
          <label className="block text-sm font-medium text-navy-700 mb-1">Catégorie *</label>
          <select
            name="category_id"
            required
            defaultValue={service.category_id}
            className="w-full rounded-lg border border-navy-100 px-4 py-2.5 bg-white text-navy-800 focus:outline-none focus:ring-2 focus:ring-sun-400"
          >
            {categoriesList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
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
          <textarea
            name="description"
            rows={4}
            defaultValue={service.description || ''}
            className="w-full rounded-lg border border-navy-100 px-4 py-2.5 text-navy-800 focus:outline-none focus:ring-2 focus:ring-sun-400"
          />
        </div>

        <Field label="Tarif indicatif" name="price" defaultValue={service.price || ''} />
        <Field label="Prix indicatif (FCFA)" name="price_amount" type="number" defaultValue={service.price_amount == null ? '' : String(service.price_amount)} />
        <Field
          label="Téléphone de contact *"
          name="contact_phone"
          required
          defaultValue={service.contact_phone || ''}
        />

        <div className="pt-2">
          <button
            type="submit"
            className="bg-sun-500 hover:bg-sun-600 text-white font-semibold rounded-full px-6 py-3 transition shadow-md"
          >
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required = false,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-navy-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        required={required}
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-navy-100 px-4 py-2.5 text-navy-800 focus:outline-none focus:ring-2 focus:ring-sun-400"
      />
    </div>
  );
}
