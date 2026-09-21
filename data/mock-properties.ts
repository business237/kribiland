import type { Property } from '@/types';

export const mockProperties: Property[] = [
  {
    id: 'p1',
    name: 'Villa Les Cocotiers',
    type: 'Maison / villa',
    location: 'Plage de Kribi, Kribi',
    pricePerNight: 75000,
    currency: 'FCFA',
    rating: 4.9,
    reviewCount: 128,
    image:
      'https://images.pexels.com/photos/2476632/pexels-photo-2476632.jpeg?auto=compress&cs=tinysrgb&w=1260&h=840&fit=crop',
    features: ['Vue mer', 'Piscine', '4 chambres', 'Climatisation'],
    badge: 'Coup de cœur',
  },
  {
    id: 'p2',
    name: 'Appartement Vue Mer',
    type: 'Appartement & studio',
    location: 'Centre-ville, Kribi',
    pricePerNight: 35000,
    currency: 'FCFA',
    rating: 4.7,
    reviewCount: 86,
    image:
      'https://images.pexels.com/photos/30604875/pexels-photo-30604875.jpeg?auto=compress&cs=tinysrgb&w=1260&h=840&fit=crop',
    features: ['Vue mer', '2 chambres', 'Cuisine équipée', 'Wi-Fi'],
  },
  {
    id: 'p3',
    name: 'Ocean Breeze Residence',
    type: 'Autre',
    location: 'Lobé, Kribi',
    pricePerNight: 55000,
    currency: 'FCFA',
    rating: 4.8,
    reviewCount: 64,
    image:
      'https://images.pexels.com/photos/33154338/pexels-photo-33154338.jpeg?auto=compress&cs=tinysrgb&w=1260&h=840&fit=crop',
    features: ['Front de mer', '3 chambres', 'Terrasse', 'Parking'],
    badge: 'Nouveau',
  },
  {
    id: 'p4',
    name: 'Maison de Plage',
    type: 'Maison / villa',
    location: 'Grand Batanga, Kribi',
    pricePerNight: 45000,
    currency: 'FCFA',
    rating: 4.6,
    reviewCount: 42,
    image:
      'https://images.pexels.com/photos/33640920/pexels-photo-33640920.jpeg?auto=compress&cs=tinysrgb&w=1260&h=840&fit=crop',
    features: ['Accès plage', 'Jardin', '3 chambres', 'Barbecue'],
  },
];
