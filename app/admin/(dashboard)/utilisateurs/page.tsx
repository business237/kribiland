import { toggleUserActiveAction } from '@/app/actions/admin-actions';
import { createClient } from '@/lib/supabase/server';

const ROLE_OPTIONS = [
    { value: '', label: 'Tous les rôles' },
    { value: 'client', label: 'Client' },
    { value: 'host', label: 'Hôte' },
    { value: 'provider', label: 'Prestataire' },
    { value: 'admin', label: 'Admin' },
];

const ROLE_LABELS: Record<string, string> = Object.fromEntries(
    ROLE_OPTIONS.filter((role) => role.value).map((role) => [role.value, role.label])
);

export default async function UtilisateursPage({
    searchParams,
}: {
    searchParams: { query?: string; role?: string; error?: string; success?: string };
}) {
    const supabase = createClient();
    const query = (searchParams.query || '').trim();
    const role = ROLE_OPTIONS.some((option) => option.value === searchParams.role) ? (searchParams.role || '') : '';

    let usersQuery = supabase
        .from('profiles')
        .select('id, full_name, email, phone, business_name, role, is_active, created_at')
        .order('created_at', { ascending: false });

    if (role) usersQuery = usersQuery.eq('role', role as any);
    if (query) {
        const pattern = `%${query.replace(/[%(),]/g, '')}%`;
        usersQuery = usersQuery.or(`full_name.ilike.${pattern},email.ilike.${pattern},phone.ilike.${pattern}`);
    }

    const { data: users } = await usersQuery;

    return (
        <div>
            <h1 className="mb-1 font-display text-3xl text-navy-800">Utilisateurs</h1>
            <p className="mb-6 text-navy-400">Tous les comptes et leur état d’activation.</p>

            {searchParams.error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{searchParams.error}</div>}
            {searchParams.success && <div className="mb-4 rounded-lg bg-turquoise-50 px-4 py-3 text-sm text-turquoise-800">Mise à jour effectuée.</div>}

            <form method="get" className="mb-6 flex flex-col gap-3 rounded-2xl border border-navy-100 bg-white p-4 sm:flex-row">
                <input name="query" defaultValue={query} placeholder="Rechercher par nom, email ou téléphone" className="min-w-0 flex-1 rounded-lg border border-navy-100 px-3 py-2.5 text-sm" />
                <select name="role" defaultValue={role} className="rounded-lg border border-navy-100 bg-white px-3 py-2.5 text-sm text-navy-700">
                    {ROLE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
                <button type="submit" className="rounded-full bg-navy-800 px-5 py-2.5 text-sm font-semibold text-white">Rechercher</button>
            </form>

            {!users || users.length === 0 ? (
                <div className="rounded-2xl border border-navy-100 bg-white p-10 text-center text-navy-400">Aucun compte trouvé.</div>
            ) : (
                <div className="space-y-4">
                    {users.map((user) => (
                        <div key={user.id} className="rounded-2xl border border-navy-100 bg-white p-5">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <p className="font-medium text-navy-800">
                                        {user.full_name}{' '}
                                        {user.business_name && <span className="font-normal text-navy-400">— {user.business_name}</span>}
                                    </p>
                                    <p className="mt-1 text-sm text-navy-400">
                                        {ROLE_LABELS[user.role] || user.role} · {user.email || 'Email non renseigné'} · {user.phone || 'Téléphone non renseigné'}
                                    </p>
                                </div>
                                <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${user.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                    {user.is_active ? 'Actif' : 'Suspendu'}
                                </span>
                            </div>
                            <form action={toggleUserActiveAction} className="mt-4 border-t border-navy-50 pt-4">
                                <input type="hidden" name="profile_id" value={user.id} />
                                <input type="hidden" name="is_active" value={String(user.is_active)} />
                                <input type="hidden" name="query" value={query} />
                                <input type="hidden" name="role" value={role} />
                                <button type="submit" className={`rounded-full px-4 py-2 text-sm font-semibold ${user.is_active ? 'border border-red-200 bg-white text-red-600 hover:bg-red-50' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}>
                                    {user.is_active ? 'Suspendre' : 'Réactiver'}
                                </button>
                            </form>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
