import { getCurrentProfile } from '@/lib/auth/get-current-profile';
import { redirect } from 'next/navigation';
import { LogementWizard } from '@/components/dashboard/logement-wizard';
import { createClient } from '@/lib/supabase/server';

export default async function NouvelleAnnonceLogementPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect('/connexion?redirect=/dashboard/logements/nouvelle');
  }

  const supabase = createClient();
  const { data: amenities } = await supabase
    .from('amenities')
    .select('id, label, icon, category')
    .order('label');

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <h1 className="font-display text-3xl text-navy-800 mb-6">
        Ajouter un nouveau logement
      </h1>
      <LogementWizard profile={profile} amenities={amenities || []} />
    </div>
  );
}
