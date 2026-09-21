import { ClientSignupForm } from '@/components/auth/client-signup-form';

export default function InscriptionPage({
    searchParams,
}: {
    searchParams: { error?: string };
}) {
    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 px-4 py-12">
            <ClientSignupForm initialError={searchParams.error} />
        </main>
    );
}