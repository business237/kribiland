import { createClient } from '@/lib/supabase/server';
import { markPayoutAsProcessedAction } from '@/app/actions/admin-actions';
import Link from 'next/link';

export const revalidate = 0;

const PAYOUT_STATUS_STYLES: Record<string, string> = {
  not_started: 'bg-amber-100 text-amber-800',
  pending: 'bg-sky-100 text-sky-800',
  processed: 'bg-emerald-100 text-emerald-800',
  completed: 'bg-emerald-100 text-emerald-800',
  failed: 'bg-red-100 text-red-700',
};

const PAYOUT_STATUS_LABELS: Record<string, string> = {
  not_started: 'En attente de versement',
  pending: 'En cours',
  processed: 'Versé (Effectué)',
  completed: 'Versé (Effectué)',
  failed: 'Échoué',
};

export default async function AdminRetraitsPage({
  searchParams,
}: {
  searchParams: { status?: string; error?: string; success?: string };
}) {
  const supabase = createClient();
  const filter = searchParams.status || 'all';

  let query = supabase
    .from('payouts')
    .select(
      'id, period_start, period_end, amount, status, method, provider_transaction_ref, created_at, processed_at, beneficiary:profiles!payouts_beneficiary_id_fkey(full_name, phone, email, role, mobile_money_number)'
    )
    .order('created_at', { ascending: false });

  if (filter !== 'all') {
    query = query.eq('status', filter as any);
  }

  const { data: payouts } = await query;

  const STATUS_TABS = [
    { value: 'all', label: 'Tous les retraits' },
    { value: 'not_started', label: '⏳ En attente' },
    { value: 'processed', label: '✅ Effectués' },
  ];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-navy-400 mb-1">
            <Link href="/admin" className="hover:text-navy-700 transition">
              Vue d'ensemble
            </Link>
            <span>/</span>
            <span className="text-navy-700 font-medium">Retraits & Versements</span>
          </div>
          <h1 className="font-display text-3xl text-navy-900">Gestion des Retraits Partenaires</h1>
          <p className="text-navy-500 text-sm mt-0.5">
            Validez et marquez les versements Mobile Money / Virement effectués aux hôtes et prestataires.
          </p>
        </div>
      </div>

      {/* Messages de succès / erreur */}
      {searchParams.error && (
        <div className="rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3 border border-red-100">
          ⚠️ {searchParams.error}
        </div>
      )}
      {searchParams.success && (
        <div className="rounded-xl bg-emerald-50 text-emerald-800 text-sm px-4 py-3 border border-emerald-100">
          ✅ Le versement a bien été marqué comme effectué.
        </div>
      )}

      {/* Onglets Filtre par Statut */}
      <div className="flex flex-wrap items-center gap-2 border-b border-navy-100 pb-3">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/retraits?status=${tab.value}`}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              filter === tab.value
                ? 'bg-navy-900 text-white shadow-sm'
                : 'bg-white border border-navy-100 text-navy-600 hover:bg-navy-50'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Tableau des Payouts */}
      <div className="bg-white rounded-2xl border border-navy-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-navy-100 flex items-center justify-between bg-navy-50/50">
          <span className="text-xs font-semibold text-navy-600 uppercase tracking-wider">
            {(payouts || []).length} versement(s) trouvé(s)
          </span>
        </div>

        {!payouts || payouts.length === 0 ? (
          <div className="text-center py-12 text-navy-400 text-sm">
            Aucun versement correspondant au filtre.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-navy-700">
              <thead className="bg-navy-50 text-xs font-semibold uppercase text-navy-500 tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Bénéficiaire</th>
                  <th className="px-6 py-3.5">Montant à verser</th>
                  <th className="px-6 py-3.5">Numéro Mobile Money</th>
                  <th className="px-6 py-3.5">Période</th>
                  <th className="px-6 py-3.5">Statut</th>
                  <th className="px-6 py-3.5 text-right">Action / Référence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50">
                {payouts.map((p: any) => {
                  const isPending = p.status === 'not_started' || p.status === 'pending';
                  const beneficiary = p.beneficiary;

                  return (
                    <tr key={p.id} className="hover:bg-navy-50/50 transition">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-navy-900 text-sm">
                          {beneficiary?.full_name || 'Partenaire'}
                        </p>
                        <p className="text-xs text-navy-400 capitalize">
                          {beneficiary?.role === 'host' ? '🏠 Hôte' : '🔧 Prestataire'} ·{' '}
                          {beneficiary?.phone || beneficiary?.email || '-'}
                        </p>
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-600 text-base">
                        {p.amount.toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono font-semibold text-navy-900 text-xs bg-navy-50 px-2.5 py-1 rounded-lg border border-navy-100">
                          {beneficiary?.mobile_money_number || beneficiary?.phone || 'Non renseigné'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-navy-600">
                        {new Date(p.period_start).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                        })}{' '}
                        au{' '}
                        {new Date(p.period_end).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            PAYOUT_STATUS_STYLES[p.status] || 'bg-navy-100 text-navy-600'
                          }`}
                        >
                          {PAYOUT_STATUS_LABELS[p.status] || p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isPending ? (
                          <form action={markPayoutAsProcessedAction} className="inline-flex items-center gap-2">
                            <input type="hidden" name="payout_id" value={p.id} />
                            <input
                              type="text"
                              name="transaction_ref"
                              placeholder="Ref MoMo (optionnel)"
                              className="w-36 rounded-lg border border-navy-200 text-xs px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                            <button
                              type="submit"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition shadow-sm shrink-0"
                            >
                              ✓ Marquer comme versé
                            </button>
                          </form>
                        ) : (
                          <div>
                            <p className="text-xs font-mono text-navy-600 font-medium">
                              {p.provider_transaction_ref || 'Aucune réf.'}
                            </p>
                            {p.processed_at && (
                              <p className="text-[10px] text-navy-400">
                                Transféré le{' '}
                                {new Date(p.processed_at).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'short',
                                })}
                              </p>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
