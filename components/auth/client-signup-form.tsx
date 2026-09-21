'use client';

import { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { signUpClientAction } from '@/app/actions/auth-actions';
import { PhoneInput } from '@/components/shared/phone-input';
import { AlertCircle, Loader2, ArrowRight, CheckCircle2, X } from 'lucide-react';

export function ClientSignupForm({ initialError }: { initialError?: string }) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(initialError || null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        if (initialError) {
            setError(decodeURIComponent(initialError));
        }
    }, [initialError]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
            try {
                await signUpClientAction(formData);
            } catch (err: any) {
                if (err?.message && err.message.includes('NEXT_REDIRECT')) {
                    return;
                }
                setError(err?.message || 'Une erreur est survenue lors de la création du compte. Vérifiez vos informations (email ou téléphone déjà utilisé).');
            }
        });
    };

    return (
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-amber-100 p-8 sm:p-10 relative overflow-hidden transition-all duration-300">
            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-50 rounded-full blur-3xl -z-10 transform translate-x-10 -translate-y-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-50 rounded-full blur-2xl -z-10 transform -translate-x-8 translate-y-8 pointer-events-none" />

            {/* Badge */}
            <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl">🌴</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-widest">
                    Espace Voyageur
                </span>
            </div>

            <h1 className="font-display text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">
                Créer un compte
            </h1>
            <p className="text-gray-500 text-sm mb-7">
                Trouvez où dormir, quoi faire et qui solliciter à Kribi.
            </p>

            {/* Notification Dynamic Popup - Succès */}
            {successMessage && (
                <div className="mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3 text-emerald-900 text-sm shadow-md animate-in fade-in slide-in-from-top-2 duration-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 animate-bounce" />
                    <div className="flex-1">
                        <p className="font-bold">{successMessage}</p>
                        <p className="text-xs text-emerald-700 mt-0.5">Préparation de votre session...</p>
                    </div>
                </div>
            )}

            {/* Notification Dynamic Popup - Erreur */}
            {error && (
                <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4 flex items-start gap-3 text-red-900 text-sm shadow-md animate-in fade-in slide-in-from-top-2 duration-300">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="font-bold text-red-900">Erreur d'inscription</p>
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
                <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Nom complet *</label>
                    <input type="text" name="full_name" required autoComplete="name" disabled={isPending || !!successMessage}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition disabled:opacity-60"
                        placeholder="Votre nom complet" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Téléphone *</label>
                    <PhoneInput name="phone" required disabled={isPending || !!successMessage} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                        Email <span className="font-normal text-gray-400 normal-case">(optionnel)</span>
                    </label>
                    <input type="email" name="email" autoComplete="email" disabled={isPending || !!successMessage}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition disabled:opacity-60"
                        placeholder="vous@exemple.com" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Mot de passe *</label>
                    <input type="password" name="password" required minLength={8} autoComplete="new-password" disabled={isPending || !!successMessage}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition disabled:opacity-60"
                        placeholder="8 caractères minimum" />
                </div>

                <button type="submit" disabled={isPending || !!successMessage}
                    className="w-full bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-white font-bold rounded-full py-3.5 shadow-lg shadow-amber-500/30 transition duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-1">
                    {isPending || successMessage
                        ? <><Loader2 className="w-5 h-5 animate-spin" /><span>Création du compte...</span></>
                        : <><span>Créer mon compte voyageur</span><ArrowRight className="w-4 h-4" /></>}
                </button>
            </form>

            <div className="mt-7 pt-6 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-500">
                    Déjà un compte ?{' '}
                    <Link href="/connexion" className="text-amber-600 font-bold hover:underline">Se connecter</Link>
                </p>
            </div>
        </div>
    );
}
