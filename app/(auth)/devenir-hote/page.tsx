import { getCurrentProfile } from '@/lib/auth/get-current-profile';
import { upgradeRoleAction } from '@/app/actions/auth-actions';
import { HostSignupForm } from '@/components/auth/host-signup-form';

export const metadata = {
    title: 'Devenir hôte — KribiLand',
    description: 'Inscrivez-vous en tant qu\'hôte sur KribiLand et publiez vos logements à Kribi. Gérez vos réservations facilement depuis votre tableau de bord.',
};

export default async function DevenirHotePage({
    searchParams,
}: {
    searchParams: { error?: string };
}) {
    const profile = await getCurrentProfile();

    // Si un profil est déjà connecté : upgrade du rôle + redirection immédiate
    if (profile) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100 px-4 py-12">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-3xl animate-bounce">🏠</div>
                    <p className="text-lg font-bold text-gray-800">Activation de votre espace hôte...</p>
                    <p className="text-sm text-gray-500">Vous êtes redirigé vers votre tableau de bord.</p>
                    {/* Formulaire auto-submit côté serveur pour upgrader le rôle */}
                    <form action={upgradeRoleAction}>
                        <input type="hidden" name="role" value="host" />
                        <button
                            type="submit"
                            className="mt-2 px-6 py-2.5 rounded-full bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 transition"
                        >
                            Continuer →
                        </button>
                    </form>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100 px-4 py-12">
            <HostSignupForm initialError={searchParams.error} />
        </main>
    );
}
