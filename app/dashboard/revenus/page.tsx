import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth/get-current-profile';
import Link from 'next/link';

export const revalidate = 0;

const PAYOUT_STATUS_STYLES: Record<string, string> = {
  not_started: 'bg-amber-100 text-amber-800',
  pending: 'bg-sky-100 text-sky-800',
  processed: 'bg-emerald-100 text-emerald-800',
  failed: 'bg-red-100 text-red-700',
};

const PAYOUT_STATUS_LABELS: Record<string, string> = {
  not_started: 'En attente',
  pending: 'En cours',
  processed: 'Effectué',
  failed: 'Échoué',
};

export default async function RevenuePage() {
  const supabase = createClient();
  const profile = await getCurrentProfile();
  if (!profile) return null;

  // 1. Récupération des commissions du partenaire
  const { data: commissions } = await supabase
    .from('commissions')
    .select('id, amount, rate, net_amount, created_at, payment_id')
    .eq('beneficiary_id', profile.id)
    .order('created_at', { ascending: false });

  // 2. Récupération des payouts du partenaire
  const { data: payouts } = await supabase
    .from('payouts')
    .select('id, period_start, period_end, amount, status, method, provider_transaction_ref, created_at, processed_at')
    .eq('beneficiary_id', profile.id)
    .order('created_at', { ascending: false });

  // Calculs financiers
  const totalNetEarned = (commissions || []).reduce((sum, c) => sum + (c.net_amount || 0), 0);

  const lastPayout = (payouts || []).find((p) => p.status === 'processed');
  const totalPaidOut = (payouts || [])
    .filter((p) => p.status === 'processed')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const pendingPayoutAmount = Math.max(0, totalNetEarned - totalPaidOut);

  return (
    <div className="space-y-8">
      {/* Fil d'Ariane & Titre */}
      <div>
        <div className="flex items-center gap-2 text-xs text-navy-400 mb-2">
          <Link href="/dashboard" className="hover:text-navy-700 transition">
            Vue d'ensemble
          </Link>
          <span>/</span>
          <span className="text-navy-700 font-medium">Revenus & Versements</span>
        </div>
        <h1 className="font-display text-3xl text-navy-800">Gestion des revenus</h1>
        <p className="text-navy-500 text-sm mt-1">
          Suivez la totalité de vos gains net perçus et l'historique de vos versements sur votre compte.
        </p>
      </div>

      {/* Cartes résumé financier */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total gains nets */}
        <div className="bg-gradient-to-br from-navy-900 to-navy-800 text-white p-6 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs text-sun-300 font-semibold uppercase tracking-wider">
              Total gains nets cumulés
            </span>
            <span className="text-xl">💰</span>
          </div>
          <p className="text-3xl font-bold text-white mb-1">
            {totalNetEarned.toLocaleString('fr-FR')}{' '}
            <span className="text-sm font-normal text-sun-300">FCFA</span>
          </p>
          <p className="text-xs text-navy-300">Après déduction des frais de plateforme</p>
        </div>

        {/* En attente de versement */}
        <div className="bg-white p-6 rounded-2xl border border-navy-100 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs text-navy-400 font-semibold uppercase tracking-wider">
              Solde en attente de versement
            </span>
            <span className="text-xl">⏳</span>
          </div>
          <p className="text-3xl font-bold text-navy-900 mb-1">
            {pendingPayoutAmount.toLocaleString('fr-FR')}{' '}
            <span className="text-sm font-normal text-navy-400">FCFA</span>
          </p>
          <p className="text-xs text-navy-400">Paiements collectés non encore transférés</p>
        </div>

        {/* Dernier versement */}
        <div className="bg-white p-6 rounded-2xl border border-navy-100 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs text-navy-400 font-semibold uppercase tracking-wider">
              Dernier versement effectué
            </span>
            <span className="text-xl">✅</span>
          </div>
          {lastPayout ? (
            <div>
              <p className="text-3xl font-bold text-emerald-600 mb-1">
                {lastPayout.amount.toLocaleString('fr-FR')}{' '}
                <span className="text-sm font-normal text-navy-400">FCFA</span>
              </p>
              <p className="text-xs text-navy-400">
                Effectué le{' '}
                {new Date(lastPayout.processed_at || lastPayout.created_at).toLocaleDateString(
                  'fr-FR',
                  { day: 'numeric', month: 'short', year: 'numeric' }
                )}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-2xl font-semibold text-navy-400 mb-1">Aucun versement</p>
              <p className="text-xs text-navy-400">Les versements s'afficheront ici</p>
            </div>
          )}
        </div>
      </div>

      {/* Tableau 1 : Historique des Commissions (gains par réservation/commande) */}
      <div className="bg-white rounded-2xl border border-navy-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-navy-100 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl text-navy-800">Commissions & Gains nets</h2>
            <p className="text-xs text-navy-400 mt-0.5">Détail des commissions générées sur vos ventes</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-navy-50 text-navy-600 rounded-full">
            {(commissions || []).length} transaction(s)
          </span>
        </div>

        {!commissions || commissions.length === 0 ? (
          <div className="text-center py-12 text-navy-400 text-sm">
            Aucune commission enregistrée pour le moment.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-navy-700">
              <thead className="bg-navy-50 text-xs font-semibold uppercase text-navy-500 tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Paiement Ref</th>
                  <th className="px-6 py-3.5 text-right">Montant Brut</th>
                  <th className="px-6 py-3.5 text-right">Commission Plateforme</th>
                  <th className="px-6 py-3.5 text-right font-bold text-navy-800">Gain Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50">
                {commissions.map((comm) => (
                  <tr key={comm.id} className="hover:bg-navy-50/50 transition">
                    <td className="px-6 py-4 text-xs">
                      {new Date(comm.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-navy-500">
                      {comm.payment_id ? comm.payment_id.substring(0, 8) + '...' : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-navy-500">
                      {comm.amount ? `${comm.amount.toLocaleString('fr-FR')} FCFA` : '-'}
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-red-600 font-medium">
                      -{comm.amount && comm.net_amount ? (comm.amount - comm.net_amount).toLocaleString('fr-FR') : '0'} FCFA
                      <span className="text-[10px] text-navy-400 block font-normal">({comm.rate}%)</span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-emerald-600">
                      +{comm.net_amount ? comm.net_amount.toLocaleString('fr-FR') : '0'} FCFA
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tableau 2 : Historique des Payouts (Versements) */}
      <div className="bg-white rounded-2xl border border-navy-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-navy-100 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl text-navy-800">Historique des Versements (Payouts)</h2>
            <p className="text-xs text-navy-400 mt-0.5">Transferts vers votre compte bancaire ou Mobile Money</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-navy-50 text-navy-600 rounded-full">
            {(payouts || []).length} versement(s)
          </span>
        </div>

        {!payouts || payouts.length === 0 ? (
          <div className="text-center py-12 text-navy-400 text-sm">
            Aucun versement effectué pour l'instant. Les versements sont traités selon les cycles de règlement KribiLand.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-navy-700">
              <thead className="bg-navy-50 text-xs font-semibold uppercase text-navy-500 tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Période</th>
                  <th className="px-6 py-3.5">Montant Versé</th>
                  <th className="px-6 py-3.5">Méthode</th>
                  <th className="px-6 py-3.5">Référence</th>
                  <th className="px-6 py-3.5">Statut</th>
                  <th className="px-6 py-3.5 text-right">Date Traitement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50">
                {payouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-navy-50/50 transition">
                    <td className="px-6 py-4 text-xs font-medium text-navy-800">
                      {new Date(payout.period_start).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                      })}{' '}
                      au{' '}
                      {new Date(payout.period_end).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-navy-900">
                      {payout.amount.toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="px-6 py-4 text-xs text-navy-600">
                      {payout.method || 'Mobile Money'}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-navy-500">
                      {payout.provider_transaction_ref || '-'}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          PAYOUT_STATUS_STYLES[payout.status] || 'bg-navy-100 text-navy-600'
                        }`}
                      >
                        {PAYOUT_STATUS_LABELS[payout.status] || payout.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-navy-400">
                      {payout.processed_at
                        ? new Date(payout.processed_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'En attente'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
