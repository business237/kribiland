import { createClient } from "@/lib/supabase/server";
import { FALLBACK_PROPERTY_IMAGE, PROPERTY_TYPE_LABELS } from "@/lib/listing-constants";

export type SearchCategory = "logement" | "service" | "activite" | "tout";

export interface SearchFilters {
  category: SearchCategory;
  checkIn?: string;
  checkOut?: string;
  q?: string;
}

export interface PropertyResult {
  kind: "logement";
  id: string;
  title: string;
  subtitle: string;
  location: string;
  price: string;
  rating: number;
  reviewCount: number;
  image: string;
  href: string;
  badge?: string;
}

export interface ServiceResult {
  kind: "service";
  id: string;
  title: string;
  subtitle: string;
  location: string;
  price: string;
  rating: number;
  reviewCount: number;
  image: string;
  href: string;
}

export interface ActivityResult {
  kind: "activite";
  id: string;
  title: string;
  subtitle: string;
  location: string;
  price: string;
  image: string;
  href: string;
}

export type SearchResult = PropertyResult | ServiceResult | ActivityResult;

async function getBookedPropertyIds(checkIn: string, checkOut: string): Promise<string[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("bookings")
    .select("property_id")
    .in("status", ["accepted", "completed"])
    .lt("check_in", checkOut)
    .gt("check_out", checkIn);
  if (!data) return [];
  return Array.from(new Set(data.map((b: any) => b.property_id as string)));
}

async function searchProperties(filters: SearchFilters): Promise<PropertyResult[]> {
  const supabase = createClient();
  let excludedIds: string[] = [];
  if (filters.checkIn && filters.checkOut && filters.checkIn < filters.checkOut) {
    excludedIds = await getBookedPropertyIds(filters.checkIn, filters.checkOut);
  }
  let query = supabase
    .from("properties")
    .select("id, title, type, hotel_name, room_type_label, quartier, price_per_night, price_per_month, rental_mode, average_rating, review_count, created_at, property_images ( url, position )")
    .eq("status", "published")
    .order("created_at", { ascending: false });
  if (filters.q) query = query.ilike("title", "%" + filters.q + "%");
  if (excludedIds.length > 0) query = query.not("id", "in", "(" + excludedIds.join(",") + ")");
  const { data } = await query;
  if (!data) return [];
  return data.map((p: any): PropertyResult => {
    const sortedImages = [...(p.property_images || [])].sort((a: any, b: any) => a.position - b.position);
    const isNew = Date.now() - new Date(p.created_at).getTime() < 14 * 24 * 60 * 60 * 1000;
    const typeLabel = PROPERTY_TYPE_LABELS[p.type] || p.type;
    const displayTitle = p.type === "hotel" ? ((p.hotel_name || "Hotel") + (p.room_type_label ? " - " + p.room_type_label : "")) : p.title;
    let priceStr = "Prix non renseigne";
    if (p.price_per_night) priceStr = p.price_per_night.toLocaleString("fr-FR") + " FCFA / nuit";
    else if (p.price_per_month) priceStr = p.price_per_month.toLocaleString("fr-FR") + " FCFA / mois";
    return { kind: "logement", id: p.id, title: displayTitle, subtitle: typeLabel, location: p.quartier || "Kribi", price: priceStr, rating: p.average_rating || 0, reviewCount: p.review_count || 0, image: sortedImages[0]?.url || FALLBACK_PROPERTY_IMAGE, href: "/logements/" + p.id, badge: isNew ? "Nouveau" : undefined };
  });
}

async function searchServices(filters: SearchFilters): Promise<ServiceResult[]> {
  const supabase = createClient();
  let query = supabase
    .from("services")
    .select("id, title, quartier, price, price_amount, average_rating, review_count, service_categories ( label )")
    .eq("status", "published")
    .order("created_at", { ascending: false });
  if (filters.q) query = query.ilike("title", "%" + filters.q + "%");
  const { data } = await query;
  if (!data) return [];
  return data.map((s: any): ServiceResult => ({
    kind: "service", id: s.id, title: s.title, subtitle: s.service_categories?.label || "Service",
    location: s.quartier || "Kribi", price: s.price_amount ? s.price_amount.toLocaleString("fr-FR") + " FCFA" : (s.price || "Contactez pour le prix"),
    rating: s.average_rating || 0, reviewCount: s.review_count || 0, image: FALLBACK_PROPERTY_IMAGE, href: "/services/" + s.id
  }));
}

async function searchActivities(filters: SearchFilters): Promise<ActivityResult[]> {
  const supabase = createClient();
  let query = supabase
    .from("activities")
    .select("id, title, quartier, indicative_price, activity_images ( url, position )")
    .eq("status", "published")
    .order("created_at", { ascending: false });
  if (filters.q) query = query.ilike("title", "%" + filters.q + "%");
  const { data } = await query;
  if (!data) return [];
  return data.map((a: any): ActivityResult => {
    const sortedImages = [...(a.activity_images || [])].sort((x: any, y: any) => x.position - y.position);
    return { kind: "activite", id: a.id, title: a.title, subtitle: "Activite", location: a.quartier || "Kribi", price: a.indicative_price || "Prix indicatif non renseigne", image: sortedImages[0]?.url || FALLBACK_PROPERTY_IMAGE, href: "/activites/" + a.id };
  });
}

export async function runSearch(filters: SearchFilters) {
  const fetchProperties = filters.category === "logement" || filters.category === "tout";
  const fetchServices = filters.category === "service" || filters.category === "tout";
  const fetchActivities = filters.category === "activite" || filters.category === "tout";
  const [properties, services, activities] = await Promise.all([
    fetchProperties ? searchProperties(filters) : Promise.resolve([]),
    fetchServices ? searchServices(filters) : Promise.resolve([]),
    fetchActivities ? searchActivities(filters) : Promise.resolve([]),
  ]);
  return { properties, services, activities };
}
