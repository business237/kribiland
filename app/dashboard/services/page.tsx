import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth/get-current-profile';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { deleteServiceAction } from '@/app/actions/service-actions';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Plus, Zap, Edit, MapPin, Trash2, CheckCircle2 } from 'lucide-react';

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: { deleted?: string; created?: string };
}) {
  const supabase = createClient();
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect('/connexion');
  }

  if (profile.role !== 'provider') {
    redirect('/dashboard');
  }

  const { data: services } = await supabase
    .from('services')
    .select('*, service_categories(label)')
    .eq('provider_id', profile.id)
    .order('created_at', { ascending: false });

  const serviceList = services || [];

  return (
    <div className="space-y-6">
      {/* Header avec action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy-900">Mes services</h1>
          <p className="text-navy-500 text-sm mt-1">
            Gérez vos offres de services à Kribi
          </p>
        </div>
        <Link
          href="/dashboard/services/nouvelle"
          className="inline-flex items-center justify-center gap-2 bg-sun-500 hover:bg-sun-600 text-white font-semibold rounded-full px-5 py-3 shadow-md transition"
        >
          <Plus className="w-5 h-5" />
          <span>Ajouter un service</span>
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
          ✅ Le service a été supprimé avec succès.
        </div>
      )}

      {/* Liste des services */}
      {serviceList.length === 0 ? (
        <EmptyState
          icon={<Zap className="w-12 h-12 text-navy-300" />}
          title="Aucun service proposé"
          description="Vous n'avez pas encore d'annonce. Proposez vos prestations aux visiteurs de Kribi !"
          buttonText="Créer mon premier service"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {serviceList.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-2xl border border-navy-100 shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {s.service_categories?.label || 'Service'}
                  </span>
                  <StatusBadge status={s.status} />
                </div>
                <h3 className="font-bold text-navy-900 text-lg line-clamp-1">
                  {s.title}
                </h3>
                {s.quartier && (
                  <div className="flex items-center gap-1.5 text-navy-500 text-sm mt-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{s.quartier}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-navy-100 flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-navy-700">
                  {s.price || 'Sur devis'}
                </span>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/services/${s.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-sun-700 bg-sun-100 hover:bg-sun-200 px-3 py-2 rounded-xl transition"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Modifier</span>
                  </Link>
                  <form action={deleteServiceAction}>
                    <input type="hidden" name="service_id" value={s.id} />
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
            </div>
          ))}
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
        href="/dashboard/services/nouvelle"
        className="inline-flex items-center gap-2 bg-sun-500 hover:bg-sun-600 text-white font-bold rounded-full px-6 py-3 shadow-md transition"
      >
        <Plus className="w-5 h-5" />
        <span>{buttonText}</span>
      </Link>
    </div>
  );
}
