import { createClient } from '@/lib/supabase/server';
import { TransactionChart } from '@/components/admin/transaction-chart';
import Link from 'next/link';

export const revalidate = 0;

const MONTH_NAMES = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

export default async function AdminHomePage() {
  const supabase = createClient();
  const now = new Date();

  // 1. KPI : GMV Total (Paiements effectués)
  const { data: gmvRows } = await supabase
    .from('payments')
    .select('amount')
    .in('status', ['success', 'paid', 'completed'] as any);

  const gmvTotal = (gmvRows || []).reduce((sum, p) => sum + (p.amount || 0), 0);

  // 2. KPI : Commissions collectées ce mois
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const { data: currentMonthCommissions } = await supabase
    .from('commissions')
    .select('amount')
    .gte('created_at', currentMonthStart);

  const monthCommissionsTotal = (currentMonthCommissions || []).reduce(
    (sum, c) => sum + (c.amount || 0),
    0
  );

  // 3. KPI : Hôtes et Prestataires actifs
  const { count: activePartnersCount } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .in('role', ['host', 'provider'])
    .eq('is_active', true);

  // 4. KPI : Annonces en attente de modération
  const [{ count: pendingProperties }, { count: pendingServices }] = await Promise.all([
    supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('services').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ]);

  const totalPendingListings = (pendingProperties ?? 0) + (pendingServices ?? 0);

  // 5. Courbe de volume de transactions sur 6 mois (Plateforme entière)
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
  const { data: paidPayments6Months } = await supabase
    .from('payments')
    .select('amount, created_at')
    .in('status', ['success', 'paid', 'completed'] as any)
    .gte('created_at', startDate6MonthsAgo);

  if (paidPayments6Months) {
    paidPayments6Months.forEach((pay) => {
      const d = new Date(pay.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const targetMonth = sixMonthsData.find((m) => m.yearMonthKey === key);
      if (targetMonth) {
        targetMonth.amount += pay.amount || 0;
      }
    });
  }

  const chartData = sixMonthsData.map((m) => ({ month: m.month, amount: m.amount }));

  // 6. Les 5 dernières annonces en attente de modération
  const [{ data: pendingPropList }, { data: pendingSrvList }] = await Promise.all([
    supabase
      .from('properties')
      .select('id, title, created_at, profiles!properties_host_id_fkey(full_name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('services')
      .select('id, title, created_at, profiles!services_provider_id_fkey(full_name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  interface PendingItem {
    id: string;
    title: string;
    type: 'Logement' | 'Service';
    typeTab: 'properties' | 'services';
    authorName: string;
    createdAt: string;
  }

  const pendingItems: PendingItem[] = [
    ...(pendingPropList || []).map((p: any) => ({
      id: p.id,
      title: p.title,
      type: 'Logement' as const,
      typeTab: 'properties' as const,
      authorName: p.profiles?.full_name || 'Hôte',
      createdAt: p.created_at,
    })),
    ...(pendingSrvList || []).map((s: any) => ({
      id: s.id,
      title: s.title,
      type: 'Service' as const,
      typeTab: 'services' as const,
      authorName: s.profiles?.full_name || 'Prestataire',
      createdAt: s.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* En-tête Admin */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-navy-100 shadow-sm">
        <div>
          <h1 className="font-display text-3xl text-navy-900 mb-1">Vue d'ensemble Plateforme</h1>
          <p className="text-navy-500 text-sm">
            Synthèse globale des performances et de l'activité sur KribiLand.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/annonces"
            className="inline-flex items-center gap-2 bg-navy-900 hover:bg-navy-800 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition shadow-sm"
          >
            📋 Modérer les annonces ({totalPendingListings})
          </Link>
        </div>
      </div>

      {/* 4 Cartes KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* KPI 1 : GMV Total */}
        <div className="bg-white p-5 rounded-2xl border border-navy-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-navy-400 uppercase tracking-wider">GMV Total</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-sm">
              💎
            </div>
          </div>
          <p className="text-2xl font-bold text-navy-900 mb-1">
            {gmvTotal.toLocaleString('fr-FR')}{' '}
            <span className="text-xs text-navy-400 font-normal">FCFA</span>
          </p>
          <p className="text-xs text-navy-400">Volume total des transactions payées</p>
        </div>

        {/* KPI 2 : Commissions du mois */}
        <div className="bg-white p-5 rounded-2xl border border-navy-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-navy-400 uppercase tracking-wider">
              Commissions ce mois
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
              🏛️
            </div>
          </div>
          <p className="text-2xl font-bold text-navy-900 mb-1">
            {monthCommissionsTotal.toLocaleString('fr-FR')}{' '}
            <span className="text-xs text-navy-400 font-normal">FCFA</span>
          </p>
          <p className="text-xs text-navy-400">Revenus de la plateforme KribiLand</p>
        </div>

        {/* KPI 3 : Partenaires actifs */}
        <div className="bg-white p-5 rounded-2xl border border-navy-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-navy-400 uppercase tracking-wider">
              Partenaires Actifs
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-sm">
              🤝
            </div>
          </div>
          <p className="text-2xl font-bold text-navy-900 mb-1">{activePartnersCount ?? 0}</p>
          <p className="text-xs text-navy-400">Hôtes et prestataires vérifiés</p>
        </div>

        {/* KPI 4 : Annonces en attente */}
        <div
          className={`p-5 rounded-2xl border shadow-sm transition ${
            totalPendingListings > 0
              ? 'bg-amber-50/70 border-amber-200'
              : 'bg-white border-navy-100'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-navy-400 uppercase tracking-wider">
              Annonces en attente
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
              ⏳
            </div>
          </div>
          <p className="text-2xl font-bold text-navy-900 mb-1">{totalPendingListings}</p>
          <p className="text-xs text-navy-400">Logements & services à modérer</p>
        </div>
      </div>

      {/* Graphique de volume de transactions 6 mois */}
      <div className="bg-white p-6 rounded-2xl border border-navy-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-xl text-navy-900">
              Volume des transactions (6 derniers mois)
            </h2>
            <p className="text-xs text-navy-400 mt-0.5">
              Montant total brut des réservations et commandes réglées
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-navy-50 text-navy-600 rounded-full">
            FCFA
          </span>
        </div>
        <TransactionChart data={chartData} />
      </div>

      {/* Grille 2 colonnes : Annonces en attente & Accès rapides */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Annonces à modérer (2 colonnes) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-navy-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-xl text-navy-900">Annonces à modérer</h2>
              <p className="text-xs text-navy-400">
                Les 5 plus récentes soumissions en attente de validation
              </p>
            </div>
            <Link
              href="/admin/annonces"
              className="text-xs font-semibold text-navy-600 hover:text-navy-900 transition"
            >
              Toutes les annonces →
            </Link>
          </div>

          {pendingItems.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-navy-200 rounded-xl">
              <p className="text-navy-400 text-sm">🎉 Aucune annonce en attente de modération !</p>
            </div>
          ) : (
            <div className="divide-y divide-navy-50">
              {pendingItems.map((item) => (
                <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.type === 'Logement'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.type}
                      </span>
                      <p className="font-medium text-navy-900 text-sm truncate">{item.title}</p>
                    </div>
                    <p className="text-xs text-navy-400">
                      Par : <span className="text-navy-600 font-medium">{item.authorName}</span> · Soumis le{' '}
                      {new Date(item.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <Link
                      href={`/admin/annonces?type=${item.typeTab}&status=pending`}
                      className="inline-flex items-center gap-1 bg-sun-400 hover:bg-sun-500 text-navy-950 font-semibold px-3 py-1.5 rounded-lg text-xs transition"
                    >
                      Valider →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Accès rapide Admin */}
        <div className="bg-white p-6 rounded-2xl border border-navy-100 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="font-display text-xl text-navy-900 mb-1">Actions d'administration</h2>
            <p className="text-xs text-navy-400 mb-6">Accès rapide aux modules de gestion</p>

            <div className="space-y-3">
              <Link
                href="/admin/annonces"
                className="flex items-center gap-3 p-3.5 rounded-xl border border-navy-100 hover:bg-amber-50 hover:border-amber-200 transition group"
              >
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg group-hover:bg-amber-200">
                  📋
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-navy-900 text-sm">Modérer les annonces</p>
                  <p className="text-xs text-navy-400 truncate">Valider, refuser ou suspendre</p>
                </div>
              </Link>

              <Link
                href="/admin/utilisateurs"
                className="flex items-center gap-3 p-3.5 rounded-xl border border-navy-100 hover:bg-sky-50 hover:border-sky-200 transition group"
              >
                <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-lg group-hover:bg-sky-200">
                  👥
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-navy-900 text-sm">Gérer les utilisateurs</p>
                  <p className="text-xs text-navy-400 truncate">Vérifier l'identité des partenaires</p>
                </div>
              </Link>

              <Link
                href="/admin/transactions"
                className="flex items-center gap-3 p-3.5 rounded-xl border border-navy-100 hover:bg-teal-50 hover:border-teal-200 transition group"
              >
                <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-lg group-hover:bg-teal-200">
                  💳
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-navy-900 text-sm">Consulter les transactions</p>
                  <p className="text-xs text-navy-400 truncate">Paiements et flux de caisse</p>
                </div>
              </Link>

              <Link
                href="/admin/retraits"
                className="flex items-center gap-3 p-3.5 rounded-xl border border-navy-100 hover:bg-emerald-50 hover:border-emerald-200 transition group"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg group-hover:bg-emerald-200">
                  🏧
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-navy-900 text-sm">Gérer les retraits</p>
                  <p className="text-xs text-navy-400 truncate">Traiter les demandes de virement</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}