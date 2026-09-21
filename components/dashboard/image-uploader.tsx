'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { deletePropertyImageAction, setCoverImageAction } from '@/app/actions/property-actions';
import { Star, Image as ImageIcon } from 'lucide-react';

type ImageRow = { id: string; url: string; position?: number };

export function ImageUploader({
  propertyId,
  images,
}: {
  propertyId: string;
  images: ImageRow[];
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Session expirée, veuillez vous reconnecter.');

      for (const file of Array.from(fileList)) {
        const ext = file.name.split('.').pop();
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('listings')
          .upload(path, file, { cacheControl: '3600', upsert: false });
        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage.from('listings').getPublicUrl(path);

        const { error: insertError } = await supabase.from('property_images').insert({
          property_id: propertyId,
          url: publicUrlData.publicUrl,
          position: images.length,
        });
        if (insertError) throw insertError;
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'envoi de l'image.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-semibold text-navy-800">Photos de l'annonce ({images.length})</label>
        <span className="text-xs text-navy-400">La première photo est la photo de couverture</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        {images.map((img, idx) => {
          const isCover = idx === 0;
          return (
            <div
              key={img.id}
              className={`relative group aspect-[4/3] rounded-xl overflow-hidden border-2 transition ${
                isCover ? 'border-amber-500 ring-2 ring-amber-400/50' : 'border-navy-100'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="w-full h-full object-cover" />

              {/* Badge Couverture */}
              {isCover ? (
                <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow flex items-center gap-1 z-10">
                  <Star className="w-3 h-3 fill-white" />
                  Couverture
                </span>
              ) : (
                <form action={setCoverImageAction} className="absolute top-2 left-2 z-10">
                  <input type="hidden" name="image_id" value={img.id} />
                  <input type="hidden" name="property_id" value={propertyId} />
                  <button
                    type="submit"
                    className="bg-black/60 hover:bg-amber-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow transition backdrop-blur-sm flex items-center gap-1 opacity-90 group-hover:opacity-100"
                  >
                    <ImageIcon className="w-3 h-3" />
                    Définir couverture
                  </button>
                </form>
              )}

              {/* Bouton Supprimer */}
              <form
                action={deletePropertyImageAction}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition z-10"
              >
                <input type="hidden" name="image_id" value={img.id} />
                <input type="hidden" name="property_id" value={propertyId} />
                <input type="hidden" name="url" value={img.url} />
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center shadow"
                  aria-label="Supprimer"
                >
                  ✕
                </button>
              </form>
            </div>
          );
        })}
      </div>

      <input
        type="file"
        accept="image/*"
        multiple
        disabled={uploading}
        onChange={(e) => handleFiles(e.target.files)}
        className="text-sm text-navy-700 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-sun-50 file:text-sun-700 hover:file:bg-sun-100 transition cursor-pointer"
      />
      {uploading && <p className="text-sm text-amber-600 font-medium mt-2">Envoi en cours...</p>}
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}
