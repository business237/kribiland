import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth/get-current-profile';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import Link from 'next/link';

export const revalidate = 0;

const MONTH_NAMES = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

export default async function DashboardHomePage() {
  const supabase = createClient();
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const isHost = profile.role === 'host';
  const now = new Date();

  // 1. KPI : Revenus du mois en cours
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const { data: currentMonthCommissions } = await supabase
    .from('commissions')
    .select('net_amount')
    .eq('beneficiary_id', profile.id)
    .gte('created_at', currentMonthStart);

  const currentMonthRevenue = (currentMonthCommissions || []).reduce(
    (sum, r) => sum + (r.net_amount || 0),
    0
  );

  // 2. KPI : Demandes en attente
  const { count: pendingOrders } = isHost
    ? await supabase
        .from('bookings')
        .select('id, properties!inner(host_id)', { count: 'exact', head: true })
        .eq('properties.host_id', profile.id)
        .eq('status', 'pending')
    : await supabase
        .from('service_orders')
        .select('id, services!inner(provider_id)', { count: 'exact', head: true })
        .eq('services.provider_id', profile.id)
        .eq('status', 'pending');

  // 3. KPI : Taux d'acceptation (30 derniers jours)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  let acceptanceRate = '100%';

  if (isHost) {
    const { data: recentBookings } = await supabase
      .from('bookings')
      .select('status, properties!inner(host_id)')
      .eq('properties.host_id', profile.id)
      .gte('created_at', thirtyDaysAgo);

    if (recentBookings && recentBookings.length > 0) {
      const accepted = recentBookings.filter(
        (b) => b.status === 'confirmed' || b.status === 'accepted' || b.status === 'completed'
      ).length;
      const refused = recentBookings.filter(
        (b) => b.status === 'rejected' || b.status === 'cancelled'
      ).length;
      const totalDecided = accepted + refused;
      if (totalDecided > 0) {
        acceptanceRate = `${Math.round((accepted / totalDecided) * 100)}%`;
      }
    }
  } else {
    const { data: recentOrders } = await supabase
      .from('service_orders')
      .select('status, services!inner(provider_id)')
      .eq('services.provider_id', profile.id)
      .gte('created_at', thirtyDaysAgo);

    if (recentOrders && recentOrders.length > 0) {
      const accepted = recentOrders.filter(
        (o) => o.status === 'confirmed' || o.status === 'accepted' || o.status === 'completed'
      ).length;
      const refused = recentOrders.filter(
        (o) => o.status === 'rejected' || o.status === 'cancelled'
      ).length;
      const totalDecided = accepted + refused;
      if (totalDecided > 0) {
        acceptanceRate = `${Math.round((accepted / totalDecided) * 100)}%`;
      }
    }
  }

  // 4. KPI : Note moyenne
  let averageRatingStr = (profile as any).average_rating ? Number((profile as any).average_rating).toFixed(1) : null;
  if (!averageRatingStr) {
    const { data: userListings } = isHost
      ? await supabase.from('properties').select('average_rating').eq('host_id', profile.id)
      : await supabase.from('services').select('average_rating').eq('provider_id', profile.id);

    if (userListings && userListings.length > 0) {
      const ratings = userListings.map((l) => Number(l.average_rating || 0)).filter((r) => r > 0);
      if (ratings.length > 0) {
        const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
        averageRatingStr = avg.toFixed(1);
      }
    }
  }
  if (!averageRatingStr) averageRatingStr = '5.0';

  // 5. Graphique 6 derniers mois
  const sixMonthsData: Array<{ month: string; amount: number; yearMonthKey: string }> = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthIdx = d.getMonth();
    const year = d.getFullYear();
    const monthStr = MONTH_NAMES[monthIdx];
    const yearMonthKey = `${year}-${String(monthIdx + 1).padStart(2, '0')}`;
    sixMonthsData.push({ month: monthStr, amount: 0, yearMonthKey });
  }

  const startDate6MonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString();
  const { data: commissions6Months } = await supabase
    .from('commissions')
    .select('net_amount, created_at')
    .eq('beneficiary_id', profile.id)
    .gte('created_at', startDate6MonthsAgo);

  if (commissions6Months) {
    commissions6Months.forEach((comm) => {
      const d = new Date(comm.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const targetMonth = sixMonthsData.find((m) => m.yearMonthKey === key);
      if (targetMonth) {
        targetMonth.amount += comm.net_amount || 0;
      }
    });
  }

  const chartData = sixMonthsData.map((m) => ({ month: m.month, amount: m.amount }));

  // 6. Activité récente (5 dernières demandes)
  interface ActivityItem {
    id: string;
    clientName: string;
    itemTitle: string;
    amount: number;
    status: string;
    createdAt: string;
  }
  let recentActivity: ActivityItem[] = [];

  if (isHost) {
    const { data: latestBookings } = await supabase
      .from('bookings')
      .select(
        'id, total_price, status, created_at, properties!inner(title, host_id), profiles!bookings_client_id_fkey(full_name)'
      )
      .eq('properties.host_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (latestBookings) {
      recentActivity = latestBookings.map((b: any) => ({
        id: b.id,
        clientName: b.profiles?.full_name || 'Client',
        itemTitle: b.properties?.title || 'Logement',
        amount: b.total_price || 0,
        status: b.status,
        createdAt: b.created_at,
      }));
    }
  } else {
    const { data: latestOrders } = await supabase
      .from('service_orders')
      .select(
        'id, price, status, created_at, services!inner(title, provider_id), profiles!service_orders_client_id_fkey(full_name)'
      )
      .eq('services.provider_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (latestOrders) {
      recentActivity = latestOrders.map((o: any) => ({
        id: o.id,
        clientName: o.profiles?.full_name || 'Client',
        itemTitle: o.services?.title || 'Service',
        amount: o.price || 0,
        status: o.status,
        createdAt: o.created_at,
      }));
    }
  }

  const newListingHref = isHost ? '/dashboard/logements/nouvelle' : '/dashboard/services/nouvelle';

  return (
    <div className="space-y-8">
      {/* En-tête de bienvenue */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-navy-100 shadow-sm">
        <div>
          <h1 className="font-display text-3xl text-navy-800 mb-1">
            Bonjour {profile.full_name.split(' ')[0]} 👋
          </h1>
          <p className="text-navy-500 text-sm">
            Voici la vue d'ensemble de votre activité <span className="font-semibold text-navy-800">KribiLand</span>.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={newListingHref}
            className="inline-flex items-center gap-2 bg-sun-500 hover:bg-sun-600 text-navy-950 font-semibold px-4 py-2.5 rounded-xl text-sm transition shadow-sm"
          >
            <span>✨</span> Créer une annonce
          </Link>
        </div>
      </div>

      {/* 4 Cartes KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* KPI 1 : Revenus du mois */}
        <div className="bg-white p-5 rounded-2xl border border-navy-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-navy-400 uppercase tracking-wider">Revenus ce mois</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
              💰
            </div>
          </div>
          <p className="text-2xl font-bold text-navy-900 mb-1">
            {currentMonthRevenue.toLocaleString('fr-FR')} <span className="text-xs text-navy-400 font-normal">FCFA</span>
          </p>
          <p className="text-xs text-navy-400">Commissions nettes perçues</p>
        </div>

        {/* KPI 2 : Demandes en attente */}
        <div
          className={`p-5 rounded-2xl border shadow-sm transition ${
            (pendingOrders ?? 0) > 0
              ? 'bg-amber-50/60 border-amber-200'
              : 'bg-white border-navy-100'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-navy-400 uppercase tracking-wider">En attente</span>
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
              ⏳
            </div>
          </div>
          <p className="text-2xl font-bold text-navy-900 mb-1">{pendingOrders ?? 0}</p>
          <p className="text-xs text-navy-400">Demandes à traiter</p>
        </div>

        {/* KPI 3 : Taux d'acceptation */}
        <div className="bg-white p-5 rounded-2xl border border-navy-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-navy-400 uppercase tracking-wider">Acceptation</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
              📈
            </div>
          </div>
          <p className="text-2xl font-bold text-navy-900 mb-1">{acceptanceRate}</p>
          <p className="text-xs text-navy-400">Sur les 30 derniers jours</p>
        </div>

        {/* KPI 4 : Note moyenne */}
        <div className="bg-white p-5 rounded-2xl border border-navy-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-navy-400 uppercase tracking-wider">Note moyenne</span>
            <div className="w-8 h-8 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center font-bold text-sm">
              ⭐
            </div>
          </div>
          <p className="text-2xl font-bold text-navy-900 mb-1">
            {averageRatingStr} <span className="text-xs text-amber-500 font-bold">/ 5</span>
          </p>
          <p className="text-xs text-navy-400">Avis clients enregistrés</p>
        </div>
      </div>

      {/* Graphique des revenus (6 mois) */}
      <div className="bg-white p-6 rounded-2xl border border-navy-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-xl text-navy-800">Évolution des revenus (6 derniers mois)</h2>
            <p className="text-xs text-navy-400 mt-0.5">Montant net des commissions perçues par mois</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-navy-50 text-navy-600 rounded-full">
            FCFA
          </span>
        </div>
        <RevenueChart data={chartData} />
      </div>

      {/* Grille 2 colonnes : Activité récente & Accès rapide */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activité récente (2 cols sur desktop) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-navy-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-navy-800">Activité récente</h2>
            <Link
              href="/dashboard/reservations"
              className="text-xs font-semibold text-navy-600 hover:text-navy-900 transition"
            >
              Voir tout →
            </Link>
          </div>

          {recentActivity.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-navy-200 rounded-xl">
              <p className="text-navy-400 text-sm">Aucune activité récente à afficher.</p>
            </div>
          ) : (
            <div className="divide-y divide-navy-50">
              {recentActivity.map((item) => (
                <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-navy-800 text-sm truncate">{item.itemTitle}</p>
                    <p className="text-xs text-navy-400">
                      Client : <span className="text-navy-600 font-medium">{item.clientName}</span> ·{' '}
                      {new Date(item.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="text-right shrink-0 flex items-center gap-3">
                    <span className="font-semibold text-navy-900 text-sm">
                      {item.amount.toLocaleString('fr-FR')} FCFA
                    </span>
                    <StatusBadge status={item.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Accès rapide */}
        <div className="bg-white p-6 rounded-2xl border border-navy-100 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="font-display text-xl text-navy-800 mb-1">Accès rapide</h2>
            <p className="text-xs text-navy-400 mb-6">Actions courantes de votre espace partenaire</p>

            <div className="space-y-3">
              <Link
                href={newListingHref}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-navy-100 hover:bg-sun-50 hover:border-sun-200 transition group"
              >
                <div className="w-10 h-10 rounded-lg bg-sun-100 text-sun-700 flex items-center justify-center font-bold text-lg group-hover:bg-sun-200">
                  ➕
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-navy-800 text-sm group-hover:text-navy-900">
                    Créer une annonce
                  </p>
                  <p className="text-xs text-navy-400 truncate">Publier un nouveau logement ou service</p>
                </div>
              </Link>

              <Link
                href="/dashboard/reservations"
                className="flex items-center gap-3 p-3.5 rounded-xl border border-navy-100 hover:bg-navy-50 hover:border-navy-200 transition group"
              >
                <div className="w-10 h-10 rounded-lg bg-navy-100 text-navy-700 flex items-center justify-center font-bold text-lg group-hover:bg-navy-200">
                  📅
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-navy-800 text-sm group-hover:text-navy-900">
                    Voir mes réservations
                  </p>
                  <p className="text-xs text-navy-400 truncate">Gérer les demandes et confirmations</p>
                </div>
              </Link>

              <Link
                href="/dashboard/revenus"
                className="flex items-center gap-3 p-3.5 rounded-xl border border-navy-100 hover:bg-emerald-50 hover:border-emerald-200 transition group"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg group-hover:bg-emerald-200">
                  💳
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-navy-800 text-sm group-hover:text-navy-900">
                    Gérer mes revenus
                  </p>
                  <p className="text-xs text-navy-400 truncate">Consulter commissions et versements</p>
                </div>
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-navy-50 text-center">
            <p className="text-xs text-navy-400">Besoin d'assistance ? Contactez le support KribiLand.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
