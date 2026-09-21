import { getCurrentProfile } from '@/lib/auth/get-current-profile';
import { updateProfileAction, changePasswordAction } from '@/app/actions/profile-actions';
import { User, Lock, CheckCircle2, AlertCircle, Phone, Mail } from 'lucide-react';

export const revalidate = 0;

export default async function AccountProfilePage({
  searchParams,
}: {
  searchParams: { success?: string; error?: string };
}) {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  return (
    <div className="max-w-3xl space-y-8">
      {/* Notifications */}
      {searchParams.success === 'profile_updated' && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Profil mis à jour avec succès.</span>
        </div>
      )}

      {searchParams.success === 'password_updated' && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Votre mot de passe a été modifié avec succès.</span>
        </div>
      )}

      {searchParams.error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-red-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{searchParams.error}</span>
        </div>
      )}

      {/* Formulaire 1 : Informations personnelles */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-navy/5 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-navy/5">
          <div className="w-10 h-10 rounded-2xl bg-sun/10 flex items-center justify-center text-sun">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-navy">Informations personnelles</h2>
            <p className="text-xs text-navy/60">Modifiez votre nom d'affichage et votre numéro de téléphone.</p>
          </div>
        </div>

        <form action={updateProfileAction} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-navy/60 uppercase tracking-wider mb-1.5">
              Nom complet
            </label>
            <input
              type="text"
              name="full_name"
              required
              defaultValue={profile.full_name || ''}
              className="w-full rounded-xl border border-navy/10 bg-gray-50 px-4 py-3 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-sun/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-navy/60 uppercase tracking-wider mb-1.5">
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />Téléphone principal</span>
              </label>
              <input
                type="text"
                name="phone"
                defaultValue={profile.phone || ''}
                placeholder="+237699001122"
                className="w-full rounded-xl border border-navy/10 bg-gray-50 px-4 py-3 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-sun/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-navy/60 uppercase tracking-wider mb-1.5">
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />Adresse email</span>
              </label>
              <input
                type="text"
                disabled
                value={profile.email || 'Email non renseigné'}
                className="w-full rounded-xl border border-navy/10 bg-navy/5 px-4 py-3 text-sm text-navy/50 cursor-not-allowed"
              />
              <p className="text-[10px] text-navy/40 mt-1">L'email sert d'identifiant technique.</p>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="bg-sun hover:bg-sun/90 text-white font-bold text-sm rounded-full px-6 py-3 shadow-md shadow-sun/20 transition"
            >
              Enregistrer les modifications
            </button>
          </div>
        </form>
      </div>

      {/* Formulaire 2 : Changement de mot de passe */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-navy/5 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-navy/5">
          <div className="w-10 h-10 rounded-2xl bg-navy/10 flex items-center justify-center text-navy">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-navy">Sécurité & Mot de passe</h2>
            <p className="text-xs text-navy/60">Modifiez votre mot de passe pour sécuriser votre compte.</p>
          </div>
        </div>

        <form action={changePasswordAction} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-navy/60 uppercase tracking-wider mb-1.5">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                name="new_password"
                required
                minLength={8}
                placeholder="••••••••"
                className="w-full rounded-xl border border-navy/10 bg-gray-50 px-4 py-3 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-sun/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-navy/60 uppercase tracking-wider mb-1.5">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                name="confirm_password"
                required
                minLength={8}
                placeholder="••••••••"
                className="w-full rounded-xl border border-navy/10 bg-gray-50 px-4 py-3 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-sun/50"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="bg-navy hover:bg-navy/90 text-white font-bold text-sm rounded-full px-6 py-3 shadow-md transition"
            >
              Modifier le mot de passe
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
