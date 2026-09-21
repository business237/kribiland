'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { homeForRole } from '@/lib/auth/get-current-profile';
import { redirect } from 'next/navigation';
import { normalizePhone } from '@/lib/utils/normalize-phone';

// NOTE : useFormState (react-dom) n'est pas disponible avec React 18.2 / Next
// 13.5 tels que pinnés dans ce projet. On gère donc les erreurs par redirection
// avec un paramètre ?error=... relu par la page (Server Component).

export async function signInAction(formData: FormData) {
  // Le champ accepte un email OU un numéro de téléphone
  const emailOrPhone = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const redirectTo = String(formData.get('redirect') || '');

  if (!emailOrPhone || !password) {
    redirect(`/connexion?error=${encodeURIComponent('Veuillez renseigner votre téléphone (ou email) et mot de passe.')}`);
  }

  let emailToSignIn: string;

  if (emailOrPhone.includes('@')) {
    // Si c'est un email (contient @)
    emailToSignIn = emailOrPhone;
  } else {
    // Si c'est un numéro de téléphone, on le normalise
    const normalizedPhone = normalizePhone(emailOrPhone);
    const adminSupabase = createAdminClient();

    // Recherche de l'email associé au numéro de téléphone dans la table profiles
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('email')
      .eq('phone', normalizedPhone)
      .maybeSingle();

    if (!profile || !profile.email) {
      // Aucun profil trouvé pour ce numéro de téléphone
      redirect(`/connexion?error=${encodeURIComponent('Identifiant ou mot de passe incorrect.')}`);
    }

    emailToSignIn = profile.email;
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailToSignIn,
    password,
  });

  if (error || !data.user) {
    redirect(`/connexion?error=${encodeURIComponent('Identifiant ou mot de passe incorrect.')}`);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();

  redirect(redirectTo || homeForRole(profile?.role ?? 'client'));
}

export async function signUpClientAction(formData: FormData) {
  const phoneRaw = String(formData.get('phone') || '').trim();
  const emailRaw = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const fullName = String(formData.get('full_name') || '').trim();

  // Le téléphone est obligatoire pour générer l'email technique si besoin
  if (!phoneRaw || !password || !fullName) {
    redirect(`/inscription?error=${encodeURIComponent('Nom, téléphone et mot de passe sont obligatoires.')}`);
  }
  if (password.length < 8) {
    redirect(`/inscription?error=${encodeURIComponent('Le mot de passe doit contenir au moins 8 caractères.')}`);
  }

  const phoneNormalized = normalizePhone(phoneRaw);

  // Si l'utilisateur a saisi un email, on l'utilise ; sinon email technique depuis le téléphone normalisé
  const email = emailRaw || `${phoneNormalized}@kribiland.local`;

  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { role: 'client', full_name: fullName, phone: phoneNormalized || null } },
  });

  if (error) {
    const message = error.message.includes('already registered')
      ? 'Un compte existe déjà avec ce numéro (ou cet email).'
      : 'Une erreur est survenue, veuillez réessayer.';
    redirect(`/inscription?error=${encodeURIComponent(message)}`);
  }

  redirect('/');
}

export async function signUpHostAction(formData: FormData) {
  const phoneRaw = String(formData.get('phone') || '').trim();
  const emailRaw = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const fullName = String(formData.get('full_name') || '').trim();
  const businessName = String(formData.get('business_name') || '').trim();

  if (!phoneRaw || !password || !fullName) {
    redirect(`/devenir-hote?error=${encodeURIComponent('Nom, téléphone et mot de passe sont obligatoires.')}`);
  }
  if (password.length < 8) {
    redirect(`/devenir-hote?error=${encodeURIComponent('Le mot de passe doit contenir au moins 8 caractères.')}`);
  }

  const phoneNormalized = normalizePhone(phoneRaw);

  // Si l'utilisateur a saisi un email, on l'utilise ; sinon email technique depuis le téléphone normalisé
  const email = emailRaw || `${phoneNormalized}@kribiland.local`;

  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role: 'host', full_name: fullName, phone: phoneNormalized, business_name: businessName || null },
    },
  });

  if (error) {
    const message = error.message.includes('already registered')
      ? 'Un compte existe déjà avec ce numéro (ou cet email).'
      : 'Une erreur est survenue, veuillez réessayer.';
    redirect(`/devenir-hote?error=${encodeURIComponent(message)}`);
  }

  // Compte créé — redirige directement vers la création d'annonce
  redirect('/dashboard/logements/nouvelle');
}

export async function signUpProviderAction(formData: FormData) {
  const phoneRaw = String(formData.get('phone') || '').trim();
  const emailRaw = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const fullName = String(formData.get('full_name') || '').trim();
  const businessName = String(formData.get('business_name') || '').trim();

  if (!phoneRaw || !password || !fullName) {
    redirect(`/devenir-prestataire?error=${encodeURIComponent('Nom, téléphone et mot de passe sont obligatoires.')}`);
  }
  if (password.length < 8) {
    redirect(`/devenir-prestataire?error=${encodeURIComponent('Le mot de passe doit contenir au moins 8 caractères.')}`);
  }

  const phoneNormalized = normalizePhone(phoneRaw);

  // Si l'utilisateur a saisi un email, on l'utilise ; sinon email technique depuis le téléphone normalisé
  const email = emailRaw || `${phoneNormalized}@kribiland.local`;

  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role: 'provider', full_name: fullName, phone: phoneNormalized, business_name: businessName || null },
    },
  });

  if (error) {
    const message = error.message.includes('already registered')
      ? 'Un compte existe déjà avec ce numéro (ou cet email).'
      : 'Une erreur est survenue, veuillez réessayer.';
    redirect(`/devenir-prestataire?error=${encodeURIComponent(message)}`);
  }

  // Compte créé — redirige directement vers la création d'annonce
  redirect('/dashboard/services/nouvelle');
}

export async function signOutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/connexion');
}

/**
 * Upgrader le rôle d'un client connecté vers 'host' ou 'provider'
 * sans aucun écran intermédiaire, puis rediriger vers le wizard de création.
 */
export async function upgradeRoleAction(formData: FormData) {
  const newRole = String(formData.get('role') || '') as 'host' | 'provider';
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // Pas connecté : redirige vers connexion avec paramètre de retour approprié
    const returnPath = newRole === 'host' ? '/devenir-hote' : '/devenir-prestataire';
    redirect(`/connexion?redirect=${returnPath}`);
  }

  // Utilise le client admin pour contourner les restrictions RLS sur la colonne role
  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', user!.id);

  if (error) {
    const page = newRole === 'host' ? '/devenir-hote' : '/devenir-prestataire';
    redirect(`${page}?error=${encodeURIComponent('Erreur lors de la mise à jour du rôle. Veuillez réessayer.')}`);
  }

  // Redirection directe vers le wizard sans aucun écran intermédiaire
  redirect(newRole === 'host' ? '/dashboard/logements/nouvelle' : '/dashboard/services/nouvelle');
}