import Link from "next/link";
import { Star, MapPin, Calendar, Search, Home, Wrench, Zap, PackageSearch } from "lucide-react";
import type { PropertyResult, ServiceResult, ActivityResult, SearchCategory } from "@/lib/search";
import { FALLBACK_PROPERTY_IMAGE } from "@/lib/listing-constants";

interface SearchResultsProps {
  properties: PropertyResult[];
  services: ServiceResult[];
  activities: ActivityResult[];
  category: SearchCategory;
  hasQuery: boolean;
  searchQuery?: string;
}

/* ── Carte generique ─────────────────────────────────────────── */
function ResultCard({
  image, title, subtitle, location, price, rating, reviewCount, href, badge, kindIcon, kindLabel,
}: {
  image: string; title: string; subtitle: string; location: string; price: string;
  rating?: number; reviewCount?: number; href: string; badge?: string;
  kindIcon: React.ReactNode; kindLabel: string;
}) {
  return (
    <Link href={href} className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-navy/5 transition-all duration-300 hover:shadow-xl hover:ring-navy/10">
      <div className="relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={title} className="h-48 w-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-navy/80 px-2.5 py-1 backdrop-blur-sm text-[10px] font-semibold text-white">
          {kindIcon}
          {kindLabel}
        </div>
        {badge && (
          <div className="absolute right-3 top-3 rounded-full bg-sun px-2.5 py-1 text-[10px] font-semibold text-white shadow-md">{badge}</div>
        )}
        {rating !== undefined && (
          <div className="absolute right-3 bottom-3 flex items-center gap-1 rounded-full bg-navy/80 px-2.5 py-1 backdrop-blur-sm">
            <Star className="h-3 w-3 fill-golden text-golden" />
            <span className="text-xs font-semibold text-white">{rating > 0 ? rating.toFixed(1) : "Nouveau"}</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-sun">{subtitle}</span>
        <h3 className="mt-0.5 font-display text-base font-bold text-navy line-clamp-2">{title}</h3>
        <div className="mt-1 flex items-center gap-1 text-xs text-navy/55">
          <MapPin className="h-3 w-3 shrink-0" />
          <span>{location}, Kribi</span>
        </div>
        <div className="mt-auto pt-4 flex items-end justify-between">
          <span className="font-semibold text-sm text-navy">{price}</span>
          {reviewCount !== undefined && (
            <span className="text-xs text-navy/40">{reviewCount} avis</span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ── Etat vide ───────────────────────────────────────────────── */
function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center rounded-3xl bg-white py-16 px-8 text-center ring-1 ring-navy/5">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-warm text-navy/30">
        {icon}
      </div>
      <h3 className="font-display text-lg font-bold text-navy">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-navy/50">{description}</p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-sun px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-sun/30 hover:bg-sun/90 transition"
      >
        <Search className="h-3.5 w-3.5" />
        Nouvelle recherche
      </Link>
    </div>
  );
}

/* ── Section avec titre ──────────────────────────────────────── */
function Section({ title, icon, count, children }: { title: string; icon: React.ReactNode; count: number; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sun/10 text-sun">{icon}</div>
        <h2 className="font-display text-xl font-bold text-navy">{title}</h2>
        <span className="ml-1 rounded-full bg-navy/8 px-2.5 py-0.5 text-xs font-semibold text-navy/60">{count}</span>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </div>
  );
}

/* ── Composant principal ─────────────────────────────────────── */
export function SearchResults({ properties, services, activities, category, hasQuery, searchQuery }: SearchResultsProps) {
  const total = properties.length + services.length + activities.length;

  if (total === 0) {
    const messages: Record<SearchCategory, { title: string; desc: string }> = {
      logement: {
        title: "Aucun logement disponible",
        desc: searchQuery
          ? `Aucun logement ne correspond a "${searchQuery}" a Kribi. Essayez un autre mot-cle ou modifiez les dates.`
          : "Aucun logement publie pour le moment a Kribi. Revenez bientot !",
      },
      service: {
        title: "Aucun service trouve",
        desc: searchQuery
          ? `Le service "${searchQuery}" n'est pas disponible sur Kribiland pour le moment.`
          : "Aucun prestataire de service n'est encore inscrit a Kribi.",
      },
      activite: {
        title: "Activite introuvable",
        desc: searchQuery
          ? `L'activite "${searchQuery}" n'existe pas encore sur Kribiland. Proposez-la a notre equipe !`
          : "Aucune activite referencee pour le moment a Kribi.",
      },
      tout: {
        title: hasQuery ? "Aucun resultat" : "Rien pour le moment",
        desc: searchQuery
          ? `Votre recherche "${searchQuery}" ne donne aucun resultat. Essayez d'autres mots-cles.`
          : "Le contenu de Kribiland est en cours de constitution. Revenez tres bientot !",
      },
    };

    const msg = messages[category];
    return (
      <div className="grid">
        <EmptyState
          icon={<PackageSearch className="h-8 w-8" />}
          title={msg.title}
          description={msg.desc}
        />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {properties.length > 0 && (
        <Section title="Logements" icon={<Home className="h-4 w-4" />} count={properties.length}>
          {properties.map((p) => (
            <ResultCard
              key={p.id} href={p.href} image={p.image} title={p.title}
              subtitle={p.subtitle} location={p.location} price={p.price}
              rating={p.rating} reviewCount={p.reviewCount} badge={p.badge}
              kindIcon={<Home className="h-2.5 w-2.5" />} kindLabel="Logement"
            />
          ))}
        </Section>
      )}

      {services.length > 0 && (
        <Section title="Services" icon={<Wrench className="h-4 w-4" />} count={services.length}>
          {services.map((s) => (
            <ResultCard
              key={s.id} href={s.href} image={s.image} title={s.title}
              subtitle={s.subtitle} location={s.location} price={s.price}
              rating={s.rating} reviewCount={s.reviewCount}
              kindIcon={<Wrench className="h-2.5 w-2.5" />} kindLabel="Service"
            />
          ))}
        </Section>
      )}

      {activities.length > 0 && (
        <Section title="Activites" icon={<Zap className="h-4 w-4" />} count={activities.length}>
          {activities.map((a) => (
            <ResultCard
              key={a.id} href={a.href} image={a.image} title={a.title}
              subtitle={a.subtitle} location={a.location} price={a.price}
              kindIcon={<Zap className="h-2.5 w-2.5" />} kindLabel="Activite"
            />
          ))}
        </Section>
      )}
    </div>
  );
}
