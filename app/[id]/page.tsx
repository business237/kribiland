import { redirect } from 'next/navigation';

export default function PropertyIdRedirectPage({ params }: { params: { id: string } }) {
  redirect(`/logements/${params.id}`);
}