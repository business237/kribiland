import { redirect } from 'next/navigation';

export default function MesReservationsAliasPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const query = new URLSearchParams(searchParams).toString();
  redirect(`/mon-compte/reservations${query ? `?${query}` : ''}`);
}
