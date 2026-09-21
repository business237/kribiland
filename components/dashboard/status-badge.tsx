const STYLES: Record<string, string> = {
  pending: 'bg-golden-100 text-golden-800',
  published: 'bg-turquoise-100 text-turquoise-800',
  rejected: 'bg-red-100 text-red-700',
  suspended: 'bg-navy-100 text-navy-600',
  accepted: 'bg-turquoise-100 text-turquoise-800',
  payment_pending: 'bg-sky-100 text-sky-800',
  confirmed: 'bg-turquoise-100 text-turquoise-800',
  payment_failed: 'bg-red-100 text-red-700',
  cancelled: 'bg-navy-100 text-navy-600',
  completed: 'bg-navy-200 text-navy-700',
  refunded: 'bg-navy-100 text-navy-600',
};

const LABELS: Record<string, string> = {
  pending: 'En attente',
  published: 'Publiée',
  rejected: 'Refusée',
  suspended: 'Suspendue',
  accepted: 'Acceptée',
  payment_pending: 'Paiement en cours',
  confirmed: 'Confirmée',
  payment_failed: 'Paiement échoué',
  cancelled: 'Annulée',
  completed: 'Terminée',
  refunded: 'Remboursée',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${STYLES[status] || 'bg-navy-100 text-navy-600'}`}>
      {LABELS[status] || status}
    </span>
  );
}
