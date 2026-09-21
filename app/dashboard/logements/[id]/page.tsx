import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth/get-current-profile';
import { LogementWizard } from '@/components/dashboard/logement-wizard';
import { ImageUploader } from '@/components/dashboard/image-uploader';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { notFound, redirect } from 'next/navigation';

export default async function EditLogementPage({ params, searchParams }: { params: { id: string }; searchParams: { error?: string; created?: string; updated?: string } }) {
  const supabase = createClient();
  const profile = await getCurrentProfile();
  if (!profile) redirect('/connexion');
  if (profile.role !== 'host') redirect('/dashboard');

  const [{ data: property }, { data: images }, { data: amenities }, { data: selectedAmenities }] = await Promise.all([
    supabase.from('properties').select('*').eq('id', params.id).single(),
    supabase.from('property_images').select('id, url').eq('property_id', params.id).order('position'),
    supabase.from('amenities').select('id, label, icon, category').order('label'),
    supabase.from('property_amenities').select('amenity_id').eq('property_id', params.id),
  ]);
  if (!property || property.host_id !== profile.id) notFound();

  const initialProperty = { ...property, selectedAmenityIds: (selectedAmenities || []).map((item) => item.amenity_id) };
  return <div className="mx-auto max-w-3xl px-4 py-6">
    <div className="mb-6 flex items-center gap-3"><h1 className="font-display text-3xl text-navy-800">Modifier le logement</h1><StatusBadge status={property.status} /></div>
    {searchParams.error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{searchParams.error}</div>}
    {searchParams.updated && <div className="mb-4 rounded-lg bg-turquoise-50 px-4 py-3 text-sm text-turquoise-800">Modifications enregistrées.</div>}
    <div className="mb-6 rounded-2xl border border-navy-100 bg-white p-6 shadow-sm"><ImageUploader propertyId={property.id} images={images || []} /></div>
    <LogementWizard profile={profile} amenities={amenities || []} initialProperty={initialProperty} existingPhotoCount={(images || []).length} />
  </div>;
}