import { UniversalAuthForm } from '@/components/auth/universal-auth-form';

export default function ConnexionPage({
    searchParams,
}: {
    searchParams: { error?: string; redirect?: string };
}) {
    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 px-4 py-12">
            <UniversalAuthForm
                initialError={searchParams.error}
                redirectTo={searchParams.redirect}
            />
        </main>
    );
}