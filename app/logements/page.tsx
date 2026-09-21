import { getPublishedProperties, getDistinctQuartiers } from '@/lib/listings';
import type { PropertyFilters } from '@/lib/listings';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { FiltersBar } from '@/components/logements/filters-bar';
import { ListingsView } from '@/components/logements/listings-view';

export const revalidate = 0;

interface SearchParams {
    quartier?: string;
    type?: string;
    priceMin?: string;
    priceMax?: string;
    guests?: string;
    checkIn?: string;
    checkOut?: string;
}

export default async function LogementsPage({
    searchParams,
}: {
    searchParams: SearchParams;
}) {
    const filters: PropertyFilters = {
        quartier: searchParams.quartier || undefined,
        type: searchParams.type || undefined,
        priceMin: searchParams.priceMin ? Number(searchParams.priceMin) : undefined,
        priceMax: searchParams.priceMax ? Number(searchParams.priceMax) : undefined,
        guests: searchParams.guests ? Number(searchParams.guests) : undefined,
        checkIn: searchParams.checkIn || undefined,
        checkOut: searchParams.checkOut || undefined,
    };

    const [properties, quartiers] = await Promise.all([
        getPublishedProperties(filters),
        getDistinctQuartiers(),
    ]);

    const hasFilters = Object.values(filters).some(Boolean);

    return (
        <>
            <Navbar />

            {/* Barre de filtres sticky (desktop) + bouton sheet (mobile) */}
            <FiltersBar quartiers={quartiers} />

            <main className="bg-warm min-h-screen pt-24 pb-10 sm:pt-28 sm:pb-14">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <ListingsView properties={properties} hasFilters={hasFilters} />
                </div>
            </main>
            <Footer />
        </>
    );
}