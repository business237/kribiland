import { getCurrentProfile } from '@/lib/auth/get-current-profile';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { UserAvatar } from '@/components/shared/user-avatar';
import { AccountTabNav } from './tab-nav';
import Link from 'next/link';
import { LayoutDashboard, Home, Wrench } from 'lucide-react';

export const revalidate = 0;

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect('/connexion?redirect=/mon-compte');
  }

  const firstName = profile.full_name.split(' ')[0] || profile.full_name;
  const isPartner = ['host', 'provider', 'admin'].includes(profile.role);

  return (
    <>
      <Navbar />
      <main className="bg-warm min-h-screen pt-24 pb-12 sm:pt-28 sm:pb-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Header Profil */}
          <div className="mb-8 rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-navy/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <UserAvatar fullName={profile.full_name} size="lg" className="ring-4 ring-sun/10" />
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-navy">
                  Bienvenue, {firstName} 👋
                </h1>
                <p className="text-sm text-navy/60 mt-0.5">
                  {profile.email || profile.phone || 'Compte KribiLand'}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-navy/5 px-3 py-1 text-xs font-semibold text-navy/70 capitalize">
                    Rôle : {profile.role === 'host' ? 'Hôte' : profile.role === 'provider' ? 'Prestataire' : profile.role === 'admin' ? 'Administrateur' : 'Client'}
                  </span>
                </div>
              </div>
            </div>

            {isPartner ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-navy text-white text-xs font-semibold px-4 py-2.5 hover:bg-navy/90 transition shadow-sm"
              >
                <LayoutDashboard className="w-4 h-4 text-sun" />
                <span>Accéder au Dashboard</span>
              </Link>
            ) : (
              /* CTA pour les clients : Devenir hôte ou Prestataire */
              <div className="flex flex-col sm:flex-row gap-2">
                <Link
                  href="/devenir-hote"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-4 py-2.5 hover:from-amber-600 hover:to-orange-600 transition shadow-md shadow-amber-500/20"
                >
                  <Home className="w-4 h-4" />
                  <span>Devenir hôte</span>
                </Link>
                <Link
                  href="/devenir-prestataire"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-4 py-2.5 hover:from-emerald-600 hover:to-teal-600 transition shadow-md shadow-emerald-500/20"
                >
                  <Wrench className="w-4 h-4" />
                  <span>Devenir prestataire</span>
                </Link>
              </div>
            )}
          </div>

          {/* Navigation Onglets */}
          <AccountTabNav />

          {/* Contenu de la sous-page */}
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}
