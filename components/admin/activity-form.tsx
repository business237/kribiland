'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LocationPicker } from '@/components/shared/location-picker';

interface ActivityImage {
  id: string;
  url: string;
  position: number;
}

interface ActivityFormProps {
  action: (formData: FormData) => Promise<void>;
  deleteImageAction: (formData: FormData) => Promise<void>;
  activity?: {
    id: string;
    title: string;
    description: string | null;
    quartier: string | null;
    indicative_price: string | null;
    contact_phone: string | null;
    latitude: number | null;
    longitude: number | null;
  };
  images?: ActivityImage[];
}

export function ActivityForm({ action, deleteImageAction, activity, images = [] }: ActivityFormProps) {
  const router = useRouter();
  const [latitude, setLatitude] = useState<number | null>(activity?.latitude ?? null);
  const [longitude, setLongitude] = useState<number | null>(activity?.longitude ?? null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Session expirée, veuillez vous reconnecter.');

      const imageUrls: string[] = [];
      for (const file of files) {
        const ext = file.name.split('.').pop() || 'jpg';
        const path = `activities/${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('listings')
          .upload(path, file, { cacheControl: '3600', upsert: false });
        if (uploadError) throw uploadError;
        imageUrls.push(supabase.storage.from('listings').getPublicUrl(path).data.publicUrl);
      }

      const formData = new FormData(event.currentTarget);
      formData.set('latitude', latitude == null ? '' : String(latitude));
      formData.set('longitude', longitude == null ? '' : String(longitude));
      imageUrls.forEach((url) => formData.append('image_urls', url));
      await action(formData);
    } catch (err: any) {
      setError(err?.message || 'Impossible d’enregistrer l’activité.');
      setSubmitting(false);
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files || []);
    setFiles((current) => [...current, ...selected]);
    setPreviews((current) => [...current, ...selected.map((file) => URL.createObjectURL(file))]);
    event.target.value = '';
  }

  async function handleDeleteImage(image: ActivityImage) {
    const formData = new FormData();
    formData.set('image_id', image.id);
    formData.set('activity_id', activity?.id || '');
    formData.set('url', image.url);
    await deleteImageAction(formData);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-navy-100 p-6 space-y-5">
      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <input type="hidden" name="activity_id" value={activity?.id || ''} />
      <div>
        <label className="block text-sm font-medium text-navy-700 mb-1">Titre *</label>
        <input name="title" required defaultValue={activity?.title || ''} className="w-full rounded-lg border border-navy-100 px-4 py-2.5" />
      </div>

      <div>
        <label className="block text-sm font-medium text-navy-700 mb-1">Description</label>
        <textarea name="description" rows={4} defaultValue={activity?.description || ''} className="w-full rounded-lg border border-navy-100 px-4 py-2.5" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-1">Quartier</label>
          <input name="quartier" defaultValue={activity?.quartier || ''} className="w-full rounded-lg border border-navy-100 px-4 py-2.5" />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-1">Prix indicatif</label>
          <input name="indicative_price" defaultValue={activity?.indicative_price || ''} placeholder="Ex: 5 000 FCFA" className="w-full rounded-lg border border-navy-100 px-4 py-2.5" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-navy-700 mb-1">Téléphone de contact</label>
        <input name="contact_phone" defaultValue={activity?.contact_phone || ''} className="w-full rounded-lg border border-navy-100 px-4 py-2.5" />
      </div>

      <div>
        <label className="block text-sm font-medium text-navy-700 mb-1">Localisation</label>
        <LocationPicker
          initialLat={latitude}
          initialLng={longitude}
          onChange={({ lat, lng }) => {
            setLatitude(lat);
            setLongitude(lng);
          }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-navy-700 mb-2">Photos</label>
        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            {images.map((image) => (
              <div key={image.id} className="relative aspect-[4/3] rounded-lg overflow-hidden border border-navy-100">
                <img src={image.url} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => handleDeleteImage(image)} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white text-xs">×</button>
              </div>
            ))}
          </div>
        )}
        <input type="file" accept="image/*" multiple onChange={handleFileChange} className="text-sm" />
        {previews.length > 0 && <p className="text-xs text-navy-400 mt-2">{previews.length} nouvelle(s) photo(s) prête(s) à envoyer.</p>}
      </div>

      <button type="submit" disabled={submitting} className="rounded-full bg-sun-500 px-6 py-3 font-semibold text-white disabled:opacity-60">
        {submitting ? 'Enregistrement...' : activity ? 'Enregistrer les modifications' : 'Créer l’activité'}
      </button>
    </form>
  );
}