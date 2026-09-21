import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth/get-current-profile';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { deletePropertyAction } from '@/app/actions/property-actions';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Plus, Building2, Edit, MapPin, Eye, Trash2, CheckCircle2 } from 'lucide-react';

export default async function LogementsPage({
  searchParams,
}: {
  searchParams: { deleted?: string; created?: string };
}) {
  const supabase = createClient();
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect('/connexion');
  }

  if (profile.role !== 'host') {
    redirect('/dashboard');
  }

  const { data: properties } = await supabase
    .from('properties')
    .select('*, property_images(url)')
    .eq('host_id', profile.id)
    .order('created_at', { ascending: false });

  const propertyList = properties || [];

  return (
    <div className="space-y-6">
      {/* Header avec action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy-900">Mes logements</h1>
          <p className="text-navy-500 text-sm mt-1">
            Gérez vos hébergements publiés ou en attente de validation
          </p>
        </div>
        <Link
          href="/dashboard/logements/nouvelle"
          className="inline-flex items-center justify-center gap-2 bg-sun-500 hover:bg-sun-600 text-white font-semibold rounded-full px-5 py-3 shadow-md transition"
        >
          <Plus className="w-5 h-5" />
          <span>Ajouter un logement</span>
        </Link>
      </div>

      {/* Toast notification de création d'annonce */}
      {searchParams.created && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm p-4 font-medium flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Merci ! Votre annonce est en cours d'examen par notre équipe, elle sera bientôt visible sur KribiLand.</span>
        </div>
      )}

      {/* Bannière notification suppression */}
      {searchParams.deleted && (
        <div className="rounded-xl bg-turquoise-50 border border-turquoise-200 text-turquoise-800 text-sm px-4 py-3 font-medium">
          ✅ Le logement a été supprimé avec succès.
        </div>
      )}

      {/* Liste des logements */}
      {propertyList.length === 0 ? (
        <EmptyState
          icon={<Building2 className="w-12 h-12 text-navy-300" />}
          title="Aucun logement pour le moment"
          description="Vous n'avez pas encore d'annonce. Ajoutez votre premier logement pour recevoir des voyageurs à Kribi !"
          buttonText="Créer mon premier logement"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {propertyList.map((p) => {
            const mainImage = p.property_images?.[0]?.url;
            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-navy-100 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/9] bg-gray-100">
                    {mainImage ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={mainImage}
                        alt={p.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-navy-300 gap-1 bg-slate-50">
                        <Building2 className="w-8 h-8" />
                        <span className="text-xs text-navy-400 font-medium">
                          Pas encore de photo
                        </span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <StatusBadge status={p.status} />
                    </div>
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-navy-800 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {p.type}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-navy-900 text-lg line-clamp-1">
                      {p.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-navy-500 text-sm mt-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{p.quartier}</span>
                    </div>

                    {p.price_per_night != null && <div className="mt-3 text-lg font-extrabold text-navy-900">
                      {Number(p.price_per_night).toLocaleString('fr-FR')} FCFA
                      <span className="text-xs font-normal text-navy-400"> / nuit</span>
                    </div>}
                  </div>
                </div>

                {/* Barre d'actions : Modifier, Prévisualiser, Supprimer */}
                <div className="p-4 bg-gray-50/80 border-t border-navy-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/logements/${p.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-sun-700 bg-sun-100 hover:bg-sun-200 px-3 py-2 rounded-xl transition"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Modifier / Photos</span>
                    </Link>
                    <Link
                      href={`/logements/${p.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-700 bg-white border border-navy-200 hover:bg-navy-50 px-3 py-2 rounded-xl transition"
                    >
                      <Eye className="w-3.5 h-3.5 text-navy-500" />
                      <span>Prévisualiser</span>
                    </Link>
                  </div>

                  <form action={deletePropertyAction}>
                    <input type="hidden" name="property_id" value={p.id} />
                    <button
                      type="submit"
                      className="p-2 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 transition"
                      title="Supprimer cette annonce"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  buttonText,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
}) {
  return (
    <div className="bg-white rounded-3xl border border-navy-100 p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto my-8 space-y-4">
      <div className="p-4 bg-navy-50 rounded-2xl">{icon}</div>
      <h2 className="font-display text-xl font-bold text-navy-900">{title}</h2>
      <p className="text-navy-500 text-sm">{description}</p>
      <Link
        href="/dashboard/logements/nouvelle"
        className="inline-flex items-center gap-2 bg-sun-500 hover:bg-sun-600 text-white font-bold rounded-full px-6 py-3 shadow-md transition"
      >
        <Plus className="w-5 h-5" />
        <span>{buttonText}</span>
      </Link>
    </div>
  );
}
