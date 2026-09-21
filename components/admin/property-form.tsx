'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LocationPicker } from '@/components/shared/location-picker';

interface PropertyImage { id: string; url: string; position: number }
interface Amenity { id: string; label: string }
interface PropertyFormProps {
  action: (formData: FormData) => Promise<void>;
  deleteImageAction: (formData: FormData) => Promise<void>;
  property?: any;
  images?: PropertyImage[];
  amenities?: Amenity[];
  selectedAmenityIds?: string[];
}

export function PropertyForm({ action, deleteImageAction, property, images = [], amenities = [], selectedAmenityIds = [] }: PropertyFormProps) {
  const router = useRouter();
  const [latitude, setLatitude] = useState<number | null>(property?.latitude ?? null);
  const [longitude, setLongitude] = useState<number | null>(property?.longitude ?? null);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Session expirée, veuillez vous reconnecter.');
      const formData = new FormData(event.currentTarget);
      formData.set('latitude', latitude == null ? '' : String(latitude));
      formData.set('longitude', longitude == null ? '' : String(longitude));
      for (const file of files) {
        const ext = file.name.split('.').pop() || 'jpg';
        const path = `properties/${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('listings').upload(path, file, { cacheControl: '3600', upsert: false });
        if (uploadError) throw uploadError;
        formData.append('image_urls', supabase.storage.from('listings').getPublicUrl(path).data.publicUrl);
      }
      await action(formData);
    } catch (err: any) {
      setError(err?.message || 'Impossible d’enregistrer le logement.');
      setSubmitting(false);
    }
  }

  async function handleDeleteImage(image: PropertyImage) {
    const formData = new FormData();
    formData.set('image_id', image.id);
    formData.set('property_id', property?.id || '');
    formData.set('url', image.url);
    await deleteImageAction(formData);
    router.refresh();
  }

  return <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-navy-100 bg-white p-6">
    {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    <input type="hidden" name="property_id" value={property?.id || ''} />
    <input type="hidden" name="type" value="hotel" />
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <label className="block text-sm font-medium text-navy-700">Nom de l’hôtel *<input name="hotel_name" required defaultValue={property?.hotel_name || ''} className="mt-1 w-full rounded-lg border border-navy-100 px-4 py-2.5" /></label>
      <label className="block text-sm font-medium text-navy-700">Type de chambre *<input name="room_type_label" required defaultValue={property?.room_type_label || ''} placeholder="Ex: Chambre deluxe" className="mt-1 w-full rounded-lg border border-navy-100 px-4 py-2.5" /></label>
      <label className="block text-sm font-medium text-navy-700">Titre de la fiche *<input name="title" required defaultValue={property?.title || ''} className="mt-1 w-full rounded-lg border border-navy-100 px-4 py-2.5" /></label>
      <label className="block text-sm font-medium text-navy-700">Unités disponibles *<input name="room_units_count" type="number" min="1" required defaultValue={property?.room_units_count || 1} className="mt-1 w-full rounded-lg border border-navy-100 px-4 py-2.5" /></label>
      <label className="block text-sm font-medium text-navy-700">Prix / nuit (FCFA) *<input name="price_per_night" type="number" min="1" required defaultValue={property?.price_per_night || ''} className="mt-1 w-full rounded-lg border border-navy-100 px-4 py-2.5" /></label>
      <label className="block text-sm font-medium text-navy-700">Capacité *<input name="capacity" type="number" min="1" required defaultValue={property?.capacity || 1} className="mt-1 w-full rounded-lg border border-navy-100 px-4 py-2.5" /></label>
      <label className="block text-sm font-medium text-navy-700">Chambres<input name="bedrooms" type="number" min="0" defaultValue={property?.bedrooms || 1} className="mt-1 w-full rounded-lg border border-navy-100 px-4 py-2.5" /></label>
      <label className="block text-sm font-medium text-navy-700">Salles de bain<input name="bathrooms" type="number" min="0" defaultValue={property?.bathrooms || 1} className="mt-1 w-full rounded-lg border border-navy-100 px-4 py-2.5" /></label>
    </div>
    <label className="block text-sm font-medium text-navy-700">Description<textarea name="description" rows={4} defaultValue={property?.description || ''} className="mt-1 w-full rounded-lg border border-navy-100 px-4 py-2.5" /></label>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <label className="block text-sm font-medium text-navy-700">Quartier *<input name="quartier" required defaultValue={property?.quartier || ''} className="mt-1 w-full rounded-lg border border-navy-100 px-4 py-2.5" /></label>
      <label className="block text-sm font-medium text-navy-700">Adresse<input name="address" defaultValue={property?.address || ''} className="mt-1 w-full rounded-lg border border-navy-100 px-4 py-2.5" /></label>
    </div>
    <LocationPicker initialLat={latitude} initialLng={longitude} onChange={({ lat, lng }) => { setLatitude(lat); setLongitude(lng); }} />
    {amenities.length > 0 && <div><p className="mb-2 text-sm font-medium text-navy-700">Équipements</p><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{amenities.map((amenity) => <label key={amenity.id} className="flex items-center gap-2 text-sm"><input type="checkbox" name="amenities" value={amenity.id} defaultChecked={selectedAmenityIds.includes(amenity.id)} />{amenity.label}</label>)}</div></div>}
    <div><p className="mb-2 text-sm font-medium text-navy-700">Photos</p>{images.length > 0 && <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">{images.map((image) => <div key={image.id} className="relative aspect-[4/3] overflow-hidden rounded-lg border border-navy-100"><img src={image.url} alt="" className="h-full w-full object-cover" /><button type="button" onClick={() => handleDeleteImage(image)} className="absolute right-1 top-1 h-6 w-6 rounded-full bg-red-600 text-xs text-white">×</button></div>)}</div>}<input type="file" accept="image/*" multiple onChange={(event) => { setFiles((current) => [...current, ...Array.from(event.target.files || [])]); event.target.value = ''; }} className="text-sm" /></div>
    <button type="submit" disabled={submitting} className="rounded-full bg-sun-500 px-6 py-3 font-semibold text-white disabled:opacity-60">{submitting ? 'Enregistrement...' : property ? 'Enregistrer les modifications' : 'Créer la fiche hôtel'}</button>
  </form>;
}
