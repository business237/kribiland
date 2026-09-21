'use client';

import { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { signUpHostAction } from '@/app/actions/auth-actions';
import { PhoneInput } from '@/components/shared/phone-input';
import { AlertCircle, Loader2, ArrowRight, Home, CalendarCheck, TrendingUp, LayoutDashboard, CheckCircle2, X } from 'lucide-react';

const HOST_BENEFITS = [
    { icon: Home,            text: 'Publiez vos logements facilement' },
    { icon: CalendarCheck,   text: 'Gérez vos réservations 24h/24' },
    { icon: TrendingUp,      text: 'Commissions compétitives' },
    { icon: LayoutDashboard, text: 'Tableau de bord intuitif' },
];

export function HostSignupForm({ initialError }: { initialError?: string }) {
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
                await signUpHostAction(formData);
            } catch (err: any) {
                if (err?.message && err.message.includes('NEXT_REDIRECT')) {
                    return;
                }
                setError(err?.message || 'Une erreur est survenue lors de votre inscription (numéro ou email déjà utilisé).');
            }
        });
    };

    return (
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-blue-100 p-8 sm:p-10 relative overflow-hidden transition-all duration-300">
            {/* Décorations de fond */}
            <div className="absolute top-0 left-0 w-56 h-56 bg-blue-50 rounded-full blur-3xl -z-10 transform -translate-x-24 -translate-y-24 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-sky-50 rounded-full blur-2xl -z-10 transform translate-x-14 translate-y-14 pointer-events-none" />

            {/* Badge */}
            <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl">🏠</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-widest">
                    Portail Hôte
                </span>
            </div>

            <h1 className="font-display text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">
                Devenir hôte
            </h1>
            <p className="text-gray-500 text-sm mb-5">
                Publiez vos logements et accueillez des voyageurs à Kribi.
            </p>

            {/* Bénéfices */}
            <div className="mb-7 rounded-2xl bg-blue-50/80 border border-blue-100 p-4">
                <ul className="grid grid-cols-2 gap-2.5">
                    {HOST_BENEFITS.map(({ icon: Icon, text }) => (
                        <li key={text} className="flex items-center gap-2 text-xs text-gray-700">
                            <Icon className="w-3.5 h-3.5 shrink-0 text-blue-500" />
                            {text}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Notification Dynamic Popup - Succès */}
            {successMessage && (
                <div className="mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3 text-emerald-900 text-sm shadow-md animate-in fade-in slide-in-from-top-2 duration-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 animate-bounce" />
                    <div className="flex-1">
                        <p className="font-bold">{successMessage}</p>
                        <p className="text-xs text-emerald-700 mt-0.5">Veuillez patienter pendant la redirection...</p>
                    </div>
                </div>
            )}

            {/* Notification Dynamic Popup - Erreur */}
            {error && (
                <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4 flex items-start gap-3 text-red-900 text-sm shadow-md animate-in fade-in slide-in-from-top-2 duration-300">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="font-bold text-red-900">Erreur d'inscription hôte</p>
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
                {/* Nom complet */}
                <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                        Nom complet *
                    </label>
                    <input
                        type="text"
                        name="full_name"
                        required
                        autoComplete="name"
                        disabled={isPending || !!successMessage}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition disabled:opacity-60"
                        placeholder="Jean Mballa"
                    />
                </div>

                {/* Nom commercial */}
                <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                        Nom de votre hébergement{' '}
                        <span className="font-normal text-gray-400 normal-case">(optionnel)</span>
                    </label>
                    <input
                        type="text"
                        name="business_name"
                        autoComplete="organization"
                        disabled={isPending || !!successMessage}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition disabled:opacity-60"
                        placeholder="Villa Les Cocotiers"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Téléphone */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                            Téléphone *
                        </label>
                        <PhoneInput name="phone" required disabled={isPending || !!successMessage} />
                    </div>

                    {/* Email (optionnel) */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                            Email{' '}
                            <span className="font-normal text-gray-400 normal-case">(optionnel)</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            autoComplete="email"
                            disabled={isPending || !!successMessage}
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition disabled:opacity-60"
                            placeholder="hote@exemple.com"
                        />
                    </div>
                </div>

                {/* Mot de passe */}
                <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                        Mot de passe *
                    </label>
                    <input
                        type="password"
                        name="password"
                        required
                        minLength={8}
                        autoComplete="new-password"
                        disabled={isPending || !!successMessage}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition disabled:opacity-60"
                        placeholder="8 caractères minimum"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isPending || !!successMessage}
                    className="w-full font-bold rounded-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 transition duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99] mt-2"
                >
                    {isPending || successMessage
                        ? <><Loader2 className="w-5 h-5 animate-spin" /><span>Envoi de la demande...</span></>
                        : <><span>Envoyer ma demande</span><ArrowRight className="w-4 h-4" /></>}
                </button>

                <p className="text-xs text-gray-400 text-center pt-1">
                    ✅ Votre compte sera actif dès son inscription. Chaque annonce est ensuite modérée séparément.
                </p>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-center gap-3 text-sm text-gray-500 text-center">
                <span>Déjà hôte ?</span>
                <Link href="/connexion" className="font-bold text-blue-600 hover:underline">
                    Se connecter à votre espace →
                </Link>
                <span className="hidden sm:inline text-gray-300">|</span>
                <Link href="/devenir-prestataire" className="text-gray-400 hover:text-gray-600 hover:underline">
                    Vous êtes prestataire ?
                </Link>
            </div>
        </div>
    );
}
