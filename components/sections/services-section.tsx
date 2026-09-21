import { Star, MapPin } from 'lucide-react';
import { Reveal } from '@/components/shared/reveal';
import { UserAvatar } from '@/components/shared/user-avatar';
import { getPublishedServices, SERVICE_CATEGORY_META } from '@/lib/services';

// Données fallback si la DB est vide
const MOCK_SERVICES = [
    {
        id: 'mock-1',
        title: 'Transport Aéroport — Kribi Centre',
        description: 'Navette confortable depuis l\'aéroport de Douala jusqu\'à Kribi, disponible 24h/24.',
        price: 'À partir de 15 000 FCFA',
        quartier: 'Kribi Centre',
        contact_phone: '+237 600 000 001',
        average_rating: 4.8,
        review_count: 24,
        category: { label: 'Transport', slug: 'transport', icon: null },
        provider: { full_name: 'Emmanuel Nguele', business_name: 'Kribi Express Transfer' },
    },
    {
        id: 'mock-2',
        title: 'Restaurant La Plage — Spécialités de Mer',
        description: 'Poisson braisé, crevettes fraîches et plats camerounais face à l\'océan.',
        price: 'À partir de 3 000 FCFA',
        quartier: 'Plage des Cocotiers',
        contact_phone: '+237 600 000 002',
        average_rating: 4.9,
        review_count: 56,
        category: { label: 'Restauration', slug: 'restauration', icon: null },
        provider: { full_name: 'Marie-Claire Bella', business_name: 'La Plage Dorée' },
    },
    {
        id: 'mock-3',
        title: 'Location Moto — Exploration Libre',
        description: 'Scooters et motos en parfait état pour explorer Kribi et ses environs à votre rythme.',
        price: 'Dès 5 000 FCFA/jour',
        quartier: 'Marché Central',
        contact_phone: '+237 600 000 003',
        average_rating: 4.6,
        review_count: 18,
        category: { label: 'Location Véhicule', slug: 'location_vehicule', icon: null },
        provider: { full_name: 'Patrick Tamba', business_name: 'Kribi Motos' },
    },
    {
        id: 'mock-4',
        title: 'Guide Touristique — Chutes de la Lobé',
        description: 'Découvrez les chutes de la Lobé directement dans l\'océan et la forêt pygmée avec un guide local expérimenté.',
        price: 'Dès 8 000 FCFA/pers.',
        quartier: 'Chutes de la Lobé',
        contact_phone: '+237 600 000 004',
        average_rating: 5.0,
        review_count: 42,
        category: { label: 'Guide', slug: 'guide', icon: null },
        provider: { full_name: 'Serge Moukoko', business_name: 'Kribi Nature Tours' },
    },
];

export async function ServicesSection() {
    const dbServices = await getPublishedServices(6);
    const services = dbServices.length > 0 ? dbServices : MOCK_SERVICES;
    const isLive = dbServices.length > 0;

    return (
        <section id="services" className="bg-white py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <Reveal className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
                    <div className="max-w-2xl">
                        <span className="text-sm font-semibold uppercase tracking-[0.2em] text-sun">
                            Services
                        </span>
                        <h2 className="mt-4 text-balance font-display text-3xl font-bold text-navy sm:text-4xl md:text-5xl">
                            Tout ce qu'il vous faut à Kribi
                        </h2>
                        <p className="mt-3 text-navy/60 text-base max-w-xl">
                            Transport, restauration, location de véhicules, guides locaux — nos prestataires sont là pour vous.
                        </p>
                    </div>
                    {!isLive && (
                        <span className="text-xs px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium shrink-0">
                            🚀 Bientôt disponible
                        </span>
                    )}
                </Reveal>

                <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {services.map((service, i) => {
                        const meta = SERVICE_CATEGORY_META[service.category.slug] || { emoji: '⭐', color: '#64748b', bg: '#f1f5f9' };
                        return (
                            <Reveal key={service.id} delay={i * 80}>
                                <article className="group h-full flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                                    {/* Couleur catégorie en haut */}
                                    <div className="h-1.5 w-full" style={{ backgroundColor: meta.color }} />

                                    <div className="flex-1 p-5 flex flex-col gap-3">
                                        {/* Badge catégorie */}
                                        <div className="flex items-center justify-between">
                                            <span
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                                                style={{ backgroundColor: meta.bg, color: meta.color }}
                                            >
                                                <span>{meta.emoji}</span>
                                                {service.category.label}
                                            </span>
                                            {service.average_rating && (
                                                <span className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                                    {service.average_rating.toFixed(1)}
                                                    {service.review_count && (
                                                        <span className="text-gray-400 font-normal">({service.review_count})</span>
                                                    )}
                                                </span>
                                            )}
                                        </div>

                                        {/* Nom commercial ou nom de la personne */}
                                        <div>
                                            <h3 className="font-display font-bold text-navy leading-snug text-base group-hover:text-sun transition-colors">
                                                {service.title}
                                            </h3>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                par {service.provider.business_name || service.provider.full_name}
                                            </p>
                                        </div>

                                        {service.description && (
                                            <p className="text-sm text-gray-500 line-clamp-2 flex-1">
                                                {service.description}
                                            </p>
                                        )}

                                        {/* Localisation & Prix */}
                                        <div className="flex items-center justify-between mt-auto pt-2">
                                            {service.quartier && (
                                                <span className="flex items-center gap-1 text-xs text-gray-400">
                                                    <MapPin className="w-3 h-3" />
                                                    {service.quartier}
                                                </span>
                                            )}
                                            {service.price && (
                                                <span className="text-xs font-bold text-navy">{service.price}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Pied de carte : info prestataire */}
                                    <div className="flex items-center gap-2 p-3 border-t border-gray-100 bg-gray-50/50">
                                        <UserAvatar fullName={service.provider.full_name} size="sm" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-navy truncate">
                                                {service.provider.business_name || service.provider.full_name}
                                            </p>
                                            {service.review_count && service.review_count > 0 && (
                                                <p className="text-xs text-gray-400">{service.review_count} avis</p>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            </Reveal>
                        );
                    })}
                </div>

                {!isLive && (
                    <p className="text-center text-sm text-gray-400 mt-8">
                        Ces données sont indicatives. Les vraies annonces apparaîtront une fois que des prestataires se seront inscrits.{' '}
                        <a href="/devenir-prestataire" className="text-blue-600 font-semibold hover:underline">Devenir prestataire →</a>
                    </p>
                )}
            </div>
        </section>
    );
}
