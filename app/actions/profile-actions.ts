'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

/**
 * Met à jour les informations personnelles du profil (nom complet, téléphone).
 */
export async function updateProfileAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/connexion');
  }

  const fullName = String(formData.get('full_name') || '').trim();
  const phone = String(formData.get('phone') || '').trim();

  if (!fullName) {
    redirect(`/mon-compte/profil?error=${encodeURIComponent('Le nom complet est obligatoire.')}`);
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      phone: phone || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) {
    redirect(`/mon-compte/profil?error=${encodeURIComponent('Erreur lors de la mise à jour du profil.')}`);
  }

  revalidatePath('/mon-compte/profil');
  revalidatePath('/mon-compte');
  redirect('/mon-compte/profil?success=profile_updated');
}

/**
 * Modifie le mot de passe de l'utilisateur connecté via Supabase Auth.
 */
export async function changePasswordAction(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/connexion');
  }

  const newPassword = String(formData.get('new_password') || '');
  const confirmPassword = String(formData.get('confirm_password') || '');

  if (!newPassword || newPassword.length < 8) {
    redirect(`/mon-compte/profil?error=${encodeURIComponent('Le nouveau mot de passe doit contenir au moins 8 caractères.')}`);
  }

  if (newPassword !== confirmPassword) {
    redirect(`/mon-compte/profil?error=${encodeURIComponent('Les deux mots de passe ne correspondent pas.')}`);
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    redirect(`/mon-compte/profil?error=${encodeURIComponent('Erreur lors de la modification du mot de passe.')}`);
  }

  revalidatePath('/mon-compte/profil');
  redirect('/mon-compte/profil?success=password_updated');
}
