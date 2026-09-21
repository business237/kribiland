import type { Database } from './database.types';

export type PropertyType =
  | Database['public']['Enums']['property_type']
  | 'hotel'
  | 'Chambre'
  | 'Appartement & studio'
  | 'Maison / villa'
  | 'Autre'
  | (string & {});


export interface Property {
  id: string;
  name: string;
  type: PropertyType;
  location: string;
  pricePerNight: number;
  currency: string;
  rating: number;
  reviewCount: number;
  image: string;
  features: string[];
  badge?: string;
  rentalMode?: 'courte_duree' | 'longue_duree' | 'les_deux' | string;
  pricePerMonth?: number;
  minMonths?: number;
  isLongTermAvailable?: boolean;
  latitude?: number | null;
  longitude?: number | null;
  hotel_name?: string | null;
  room_type_label?: string | null;
}

export interface Experience {
  id: string;
  title: string;
  category: string;
  location: string;
  duration: string;
  price: number;
  currency: string;
  rating: number;
  image: string;
  description: string;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  location: string;
  priceRange: string;
  rating: number;
  image: string;
  specialty: string;
}

export interface Category {
  id: string;
  title: string;
  description: string;
  icon: string;
  image: string;
  href: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  location: string;
  avatar: string;
  rating: number;
  text: string;
}

export interface ValueStep {
  number: string;
  title: string;
  description: string;
  icon: string;
}
