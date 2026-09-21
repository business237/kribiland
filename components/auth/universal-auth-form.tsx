'use client';

import { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { signInAction } from '@/app/actions/auth-actions';
import { AlertCircle, Loader2, ArrowRight, Lock, Sparkles, X } from 'lucide-react';

interface UniversalAuthFormProps {
    initialError?: string;
    redirectTo?: string;
}

export function UniversalAuthForm({ initialError, redirectTo }: UniversalAuthFormProps) {
    const [isPending, startTransition] = useTransition();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(initialError || null);

    useEffect(() => {
        if (initialError) {
            try {
                setError(decodeURIComponent(initialError));
            } catch {
                setError(initialError);
            }
        }
    }, [initialError]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        const safeEmail = (email || '').trim();
        const safePassword = password || '';

        if (!safeEmail || safeEmail.length === 0) {
            setError('Veuillez renseigner votre téléphone ou email.');
            return;
        }

        if (!safePassword || safePassword.length === 0) {
            setError('Veuillez renseigner votre mot de passe.');
            return;
        }

        const formData = new FormData(e.currentTarget);
        formData.set('email', safeEmail);
        formData.set('password', safePassword);
        if (redirectTo) formData.set('redirect', redirectTo);

        startTransition(async () => {
            try {
                await signInAction(formData);
            } catch (err: any) {
                // En cas de redirection Next.js (y compris les redirections d'erreur ?error=...),
                // NEXT_REDIRECT est levé. Seul le vrai catch d'exception non-redirect doit afficher une erreur locale.
                if (err?.message && err.message.includes('NEXT_REDIRECT')) {
                    return;
                }
                setError('Identifiant ou mot de passe incorrect. Veuillez vérifier vos identifiants.');
            }
        });
    };

    return (
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-amber-100 p-8 sm:p-10 relative overflow-hidden transition-all duration-300">
            {/* Éléments de fond décoratifs */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-amber-100/60 rounded-full blur-3xl -z-10 transform translate-x-12 -translate-y-12 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-100/50 rounded-full blur-2xl -z-10 transform -translate-x-10 translate-y-10 pointer-events-none" />

            {/* En-tête */}
            <div className="flex flex-col items-center text-center mb-6">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 mb-3 border border-amber-500/20 shadow-sm">
                    <Sparkles className="w-7 h-7 text-amber-600" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 text-amber-900 text-xs font-bold uppercase tracking-widest mb-2 border border-amber-200">
                    <Lock className="w-3 h-3 text-amber-700" /> Espace Universel KribiLand
                </span>
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                    Connexion
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                    Accédez à votre espace (Voyageur, Hôte, Prestataire ou Admin) avec votre compte unique.
                </p>
            </div>

            {/* Notification Erreur */}
            {error && (
                <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4 flex items-start gap-3 text-red-900 text-sm shadow-md animate-in fade-in slide-in-from-top-2 duration-300">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="font-bold text-red-900">Échec de connexion</p>
                        <p className="text-xs text-red-700 mt-0.5">{error}</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setError(null)}
                        className="text-red-400 hover:text-red-600 font-bold p-1 rounded-full hover:bg-red-100 transition"
                        aria-label="Fermer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {redirectTo && <input type="hidden" name="redirect" value={redirectTo} />}

                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Téléphone ou Email
                    </label>
                    <input
                        type="text"
                        name="email"
                        required
                        autoComplete="username"
                        value={email}
                        onChange={(e) => setEmail(e.target.value ?? '')}
                        disabled={isPending}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white focus:border-transparent transition disabled:opacity-60 font-medium"
                        placeholder="6XX XXX XXX ou exemple@email.com"
                    />
                    <p className="text-[11px] font-medium text-gray-500 mt-1.5 flex items-center gap-1">
                        💡 <span>Téléphone : <strong>6XX XXX XXX</strong> (sans le +237) ou votre email</span>
                    </p>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Mot de passe
                        </label>
                    </div>
                    <input
                        type="password"
                        name="password"
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value ?? '')}
                        disabled={isPending}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white focus:border-transparent transition disabled:opacity-60"
                        placeholder="••••••••"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full text-white font-bold rounded-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/30 transition duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2 active:scale-[0.99] cursor-pointer"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin text-white" />
                            <span>Vérification en cours...</span>
                        </>
                    ) : (
                        <>
                            <span>Se connecter</span>
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center space-y-3">
                <p className="text-sm text-gray-600">
                    Vous n'avez pas encore de compte ?
                </p>
                <div className="flex flex-wrap justify-center gap-2 text-xs font-semibold">
                    <Link href="/inscription" className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 hover:bg-amber-100 transition">
                        Créer un compte Voyageur
                    </Link>
                    <Link href="/devenir-hote" className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition">
                        Devenir Hôte
                    </Link>
                    <Link href="/devenir-prestataire" className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition">
                        Devenir Prestataire
                    </Link>
                </div>
            </div>
        </div>
    );
}
