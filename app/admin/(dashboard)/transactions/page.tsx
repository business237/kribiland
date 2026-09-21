import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export const revalidate = 0;

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  paid: 'bg-emerald-100 text-emerald-800',
  completed: 'bg-emerald-100 text-emerald-800',
  pending: 'bg-amber-100 text-amber-800',
  failed: 'bg-red-100 text-red-700',
  cancelled: 'bg-navy-100 text-navy-600',
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  paid: 'Payé',
  completed: 'Payé',
  pending: 'En attente',
  failed: 'Échoué',
  cancelled: 'Annulé',
};

export default async function AdminTransactionsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const supabase = createClient();
  const filter = searchParams.status || 'all';

  let query = supabase
    .from('payments')
    .select(
      'id, amount, currency, method, provider, status, provider_transaction_ref, created_at, payer:profiles!payments_payer_id_fkey(full_name, email, phone), commissions(amount, net_amount, rate, beneficiary:profiles!commissions_beneficiary_id_fkey(full_name, phone, role))'
    )
    .order('created_at', { ascending: false });

  if (filter !== 'all') {
    query = query.eq('status', filter as any);
  }

  const { data: payments } = await query;

  const STATUS_TABS = [
    { value: 'all', label: 'Tous les paiements' },
    { value: 'paid', label: '✅ Payés' },
    { value: 'pending', label: '⏳ En attente' },
    { value: 'failed', label: '❌ Échoués' },
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
            <span className="text-navy-700 font-medium">Transactions</span>
          </div>
          <h1 className="font-display text-3xl text-navy-900">Historique des Transactions</h1>
          <p className="text-navy-500 text-sm mt-0.5">
            Suivi en temps réel de tous les paiements et flux financiers sur la plateforme.
          </p>
        </div>
      </div>

      {/* Onglets Filtre par Statut */}
      <div className="flex flex-wrap items-center gap-2 border-b border-navy-100 pb-3">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/transactions?status=${tab.value}`}
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

      {/* Tableau des Paiements */}
      <div className="bg-white rounded-2xl border border-navy-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-navy-100 flex items-center justify-between bg-navy-50/50">
          <span className="text-xs font-semibold text-navy-600 uppercase tracking-wider">
            {(payments || []).length} transaction(s) trouvée(s)
          </span>
        </div>

        {!payments || payments.length === 0 ? (
          <div className="text-center py-12 text-navy-400 text-sm">
            Aucune transaction correspondant au filtre sélectionné.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-navy-700">
              <thead className="bg-navy-50 text-xs font-semibold uppercase text-navy-500 tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Client (Payeur)</th>
                  <th className="px-6 py-3.5">Montant</th>
                  <th className="px-6 py-3.5">Méthode</th>
                  <th className="px-6 py-3.5">Bénéficiaire (Partenaire)</th>
                  <th className="px-6 py-3.5">Statut</th>
                  <th className="px-6 py-3.5 text-right">Référence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50">
                {payments.map((p: any) => {
                  const comm = p.commissions?.[0];
                  const beneficiary = comm?.beneficiary;
                  return (
                    <tr key={p.id} className="hover:bg-navy-50/50 transition">
                      <td className="px-6 py-4 text-xs">
                        {new Date(p.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-navy-900 text-sm">
                          {p.payer?.full_name || 'Client anonyme'}
                        </p>
                        <p className="text-xs text-navy-400">{p.payer?.phone || p.payer?.email || '-'}</p>
                      </td>
                      <td className="px-6 py-4 font-bold text-navy-900 text-sm">
                        {p.amount.toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="px-6 py-4 text-xs text-navy-600 font-medium">
                        {p.method || 'Mobile Money'}
                      </td>
                      <td className="px-6 py-4">
                        {beneficiary ? (
                          <div>
                            <p className="font-medium text-navy-900 text-xs">{beneficiary.full_name}</p>
                            <p className="text-[11px] text-emerald-600 font-semibold">
                              Gain net : {comm?.net_amount?.toLocaleString('fr-FR')} FCFA
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-navy-400">Non renseigné</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            PAYMENT_STATUS_STYLES[p.status] || 'bg-navy-100 text-navy-600'
                          }`}
                        >
                          {PAYMENT_STATUS_LABELS[p.status] || p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-xs font-mono text-navy-400">
                        {p.provider_transaction_ref || p.id.substring(0, 8)}
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
