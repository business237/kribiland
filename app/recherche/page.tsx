import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { runSearch } from "@/lib/search";
import type { SearchCategory } from "@/lib/search";
import { SearchResults } from "@/components/search/search-results";
import { Search, MapPin } from "lucide-react";

export const revalidate = 0;

interface PageProps {
  searchParams: {
    category?: string;
    checkIn?: string;
    checkOut?: string;
    q?: string;
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  logement: "Logements",
  service: "Services",
  activite: "Activites",
  tout: "Tout",
};

export default async function RecherchePage({ searchParams }: PageProps) {
  const category = (searchParams.category as SearchCategory) || "tout";
  const checkIn = searchParams.checkIn || undefined;
  const checkOut = searchParams.checkOut || undefined;
  const q = searchParams.q || undefined;

  const { properties, services, activities } = await runSearch({ category, checkIn, checkOut, q });

  const totalCount = properties.length + services.length + activities.length;
  const hasQuery = !!(category !== "tout" || checkIn || checkOut || q);

  const categoryLabel = CATEGORY_LABELS[category] || "Tout";

  return (
    <>
      <Navbar />
      <main className="bg-warm min-h-screen pt-24 pb-16 sm:pt-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* En-tete de resultats */}
          <div className="mb-8 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-navy/50">
              <MapPin className="h-3.5 w-3.5 text-sun" />
              <span className="font-semibold text-sun">Kribi, Cameroun</span>
              {category !== "tout" && (
                <>
                  <span>&bull;</span>
                  <span>{categoryLabel}</span>
                </>
              )}
              {checkIn && <><span>&bull;</span><span>Arrivee : {checkIn}</span></>}
              {checkOut && <><span>&bull;</span><span>Depart : {checkOut}</span></>}
            </div>
            <h1 className="font-display text-3xl font-bold text-navy sm:text-4xl">
              {q ? (
                <>Resultats pour &ldquo;<span className="text-sun">{q}</span>&rdquo;</>
              ) : (
                <>Tout a Kribi</>
              )}
            </h1>
            <p className="text-sm text-navy/50">
              {totalCount > 0
                ? `${totalCount} resultat${totalCount > 1 ? "s" : ""} trouve${totalCount > 1 ? "s" : ""}`
                : hasQuery
                  ? "Aucun resultat pour cette recherche"
                  : "Decouvrez tout ce que Kribi a a offrir"}
            </p>
          </div>

          <SearchResults
            properties={properties}
            services={services}
            activities={activities}
            category={category}
            hasQuery={hasQuery}
            searchQuery={q}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
