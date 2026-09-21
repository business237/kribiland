'use client';

import { useTransition } from 'react';
import { clientConfirmPaymentAction } from '@/app/actions/order-actions';
import { Smartphone, CheckCircle2, Clock, Loader2, AlertCircle } from 'lucide-react';

interface PaymentCardProps {
  bookingId: string;
  totalPrice: number;
  mobileMoneyNumber?: string | null;
  hostName?: string | null;
  paymentConfirmedByClient: boolean;
  isCompleted: boolean;
}

export function PaymentCard({
  bookingId,
  totalPrice,
  mobileMoneyNumber,
  hostName,
  paymentConfirmedByClient,
  isCompleted,
}: PaymentCardProps) {
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    const fd = new FormData();
    fd.set('booking_id', bookingId);
    startTransition(async () => {
      try {
        await clientConfirmPaymentAction(fd);
      } catch (ex: any) {
        // NEXT_REDIRECT est attendu en cas de succès
        if (!ex?.message?.includes('NEXT_REDIRECT')) {
          console.error('Erreur confirmation paiement', ex);
        }
      }
    });
  };

  // Cas 1 : Séjour completé
  if (isCompleted) {
    return (
      <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 flex items-center gap-4">
        <CheckCircle2 className="w-8 h-8 text-emerald-500 shrink-0" />
        <div>
          <p className="font-bold text-emerald-800">Séjour confirmé ✅</p>
          <p className="text-sm text-emerald-700">L'hôte a bien reçu votre paiement. Bon séjour !</p>
        </div>
      </div>
    );
  }

  // Cas 2 : Client a dit "J'ai payé", en attente de l'hôte
  if (paymentConfirmedByClient) {
    return (
      <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 flex items-center gap-4">
        <Clock className="w-8 h-8 text-amber-500 shrink-0 animate-pulse" />
        <div>
          <p className="font-bold text-amber-800">En attente de confirmation hôte</p>
          <p className="text-sm text-amber-700">
            Vous avez signalé votre virement. L'hôte va confirmer la réception sous peu.
          </p>
        </div>
      </div>
    );
  }

  // Cas 3 : Réservation acceptée, paiement à effectuer
  return (
    <div className="rounded-2xl bg-white border border-navy/10 shadow-sm p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-sun/10 flex items-center justify-center">
          <Smartphone className="w-5 h-5 text-sun" />
        </div>
        <div>
          <p className="font-bold text-navy">Réservation confirmée 🎉</p>
          <p className="text-xs text-navy/60">Procédez au paiement par Mobile Money</p>
        </div>
      </div>

      {/* Montant */}
      <div className="rounded-xl bg-navy/5 px-4 py-3 flex items-center justify-between">
        <span className="text-sm text-navy/70">Montant total à envoyer</span>
        <span className="font-display text-xl font-bold text-navy">
          {totalPrice.toLocaleString('fr-FR')} FCFA
        </span>
      </div>

      {/* Numéro Mobile Money */}
      {mobileMoneyNumber ? (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
          <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wider mb-1">Numéro Mobile Money de l'hôte</p>
          <p className="text-2xl font-bold text-emerald-800 tracking-widest font-mono">{mobileMoneyNumber}</p>
          {hostName && <p className="text-xs text-emerald-600 mt-1">Bénéficiaire : {hostName}</p>}
        </div>
      ) : (
        <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-amber-800 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
          <span>
            L'hôte n'a pas encore renseigné son numéro Mobile Money.
            Contactez-le directement par téléphone pour finaliser le paiement.
          </span>
        </div>
      )}

      {/* Instructions */}
      <ol className="text-sm text-navy/70 space-y-1.5 list-none">
        <li className="flex items-start gap-2">
          <span className="w-5 h-5 rounded-full bg-sun/20 text-sun font-bold text-xs flex items-center justify-center shrink-0">1</span>
          Ouvrez Orange Money ou MTN MoMo
        </li>
        <li className="flex items-start gap-2">
          <span className="w-5 h-5 rounded-full bg-sun/20 text-sun font-bold text-xs flex items-center justify-center shrink-0">2</span>
          Envoyez <strong>{totalPrice.toLocaleString('fr-FR')} FCFA</strong> au numéro ci-dessus
        </li>
        <li className="flex items-start gap-2">
          <span className="w-5 h-5 rounded-full bg-sun/20 text-sun font-bold text-xs flex items-center justify-center shrink-0">3</span>
          Cliquez sur "J'ai payé" pour en informer l'hôte
        </li>
      </ol>

      {/* Bouton */}
      <button
        type="button"
        onClick={handleConfirm}
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full py-3.5 shadow-lg shadow-emerald-600/20 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending
          ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Envoi…</span></>
          : <><CheckCircle2 className="w-4 h-4" /><span>J'ai payé</span></>}
      </button>

      <p className="text-xs text-center text-navy/40">
        Ce bouton informe uniquement l'hôte. La réservation sera définitivement confirmée
        après vérification de la réception du paiement par l'hôte.
      </p>
    </div>
  );
}
