import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];

/**
 * À utiliser dans les Server Components / Server Actions.
 * Retourne null si personne n'est connecté.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    return profile ?? null;
}

/** Redirige vers la bonne page d'accueil selon le rôle après connexion. */
export function homeForRole(role: Profile['role']): string {
    switch (role) {
        case 'admin':
            return '/admin';
        case 'host':
        case 'provider':
            return '/dashboard';
        default:
            return '/';
    }
}
