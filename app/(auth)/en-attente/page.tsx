import Link from 'next/link';

export default function EnAttentePage() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 px-4">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-blue-100 p-10 text-center">
                {/* Icône succès animée */}
                <div className="flex items-center justify-center mb-6">
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                        <span className="text-4xl animate-bounce">✅</span>
                        <span className="absolute inset-0 rounded-full ring-4 ring-green-200 ring-offset-2 animate-ping opacity-30" />
                    </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-widest mb-5">
                    Portail Partenaire
                </span>

                <h1 className="font-display text-3xl font-extrabold text-gray-900 mb-3">
                    Demande envoyée avec succès !
                </h1>

                <p className="text-gray-500 text-base leading-relaxed mb-6">
                    Merci pour votre inscription. Notre équipe va examiner votre dossier dans les <strong className="text-gray-700">24 à 48 heures</strong>.
                    <br /><br />
                    Vous recevrez un <strong className="text-blue-700">email de confirmation</strong> dès que votre compte partenaire sera activé et que vous pourrez publier votre première annonce.
                </p>

                {/* Étapes */}
                <div className="bg-blue-50 rounded-2xl p-5 text-left mb-7 space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-3">Prochaines étapes</p>
                    {[
                        { step: '1', text: 'Notre équipe vérifie votre profil', done: true },
                        { step: '2', text: 'Vous recevez un email d\'activation', done: false },
                        { step: '3', text: 'Vous publiez votre première annonce', done: false },
                    ].map(({ step, text, done }) => (
                        <div key={step} className="flex items-center gap-3">
                            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shrink-0 ${done ? 'bg-green-500 text-white' : 'bg-blue-200 text-blue-700'}`}>
                                {done ? '✓' : step}
                            </div>
                            <span className={`text-sm ${done ? 'text-gray-500 line-through' : 'text-gray-700'}`}>{text}</span>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link href="/"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20">
                        🏠 Retour à l'accueil
                    </Link>
                    <Link href="/connexion"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-blue-200 text-blue-700 text-sm font-semibold hover:bg-blue-50 transition">
                        Se connecter →
                    </Link>
                </div>
            </div>
        </main>
    );
}