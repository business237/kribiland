import { getCurrentProfile } from '@/lib/auth/get-current-profile';
import { redirect } from 'next/navigation';
import { DashboardSidebar } from '@/components/dashboard/sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  if (!profile || (profile.role !== 'host' && profile.role !== 'provider')) {
    redirect('/connexion');
  }

  return (
    <div className="min-h-screen bg-warm flex flex-col md:flex-row">
      <DashboardSidebar profile={profile} />
      <main className="flex-1 w-full min-w-0">
        <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto w-full">{children}</div>
      </main>
    </div>
  );
}
