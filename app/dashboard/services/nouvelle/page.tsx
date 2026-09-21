import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth/get-current-profile';
import { redirect } from 'next/navigation';
import { ServiceWizard } from '@/components/dashboard/service-wizard';

const STATIC_CATEGORIES = [
  { id: 'transport',         slug: 'transport',         label: 'Transport & VTC' },
  { id: 'restauration',      slug: 'restauration',      label: 'Restauration & Traiteur' },
  { id: 'location_vehicule', slug: 'location_vehicule', label: 'Location de véhicule' },
  { id: 'guide',             slug: 'guide',             label: 'Guide & Excursions' },
];

export default async function NouvelleAnnonceServicePage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect('/connexion?redirect=/dashboard/services/nouvelle');
  }

  const supabase = createClient();
  const { data: dbCategories } = await supabase
    .from('service_categories')
    .select('id, label, slug')
    .order('label');

  const categories = (dbCategories && dbCategories.length > 0)
    ? dbCategories
    : STATIC_CATEGORIES;

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <h1 className="font-display text-3xl text-navy-800 mb-6">
        Ajouter un nouveau service
      </h1>
      <ServiceWizard profile={profile} categories={categories} />
    </div>
  );
}
