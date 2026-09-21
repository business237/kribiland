import type { Restaurant } from '@/types';

export const mockRestaurants: Restaurant[] = [
  {
    id: 'r1',
    name: 'Le Marin',
    cuisine: 'Fruits de mer',
    location: 'Port de Kribi',
    priceRange: '€€€',
    rating: 4.8,
    image:
      'https://images.pexels.com/photos/34104580/pexels-photo-34104580.jpeg?auto=compress&cs=tinysrgb&w=1260&h=840&fit=crop',
    specialty: 'Plateau de fruits de mer frais',
  },
  {
    id: 'r2',
    name: 'Chez Mama',
    cuisine: 'Cuisine camerounaise',
    location: 'Kribi Centre',
    priceRange: '€€',
    rating: 4.7,
    image:
      'https://images.pexels.com/photos/28736727/pexels-photo-28736727.jpeg?auto=compress&cs=tinysrgb&w=1260&h=840&fit=crop',
    specialty: 'Poisson braisé et plantains',
  },
  {
    id: 'r3',
    name: 'L\'Éscale',
    cuisine: 'Fusion',
    location: 'Plage de Kribi',
    priceRange: '€€€',
    rating: 4.9,
    image:
      'https://images.pexels.com/photos/35336025/pexels-photo-35336025.jpeg?auto=compress&cs=tinysrgb&w=1260&h=840&fit=crop',
    specialty: 'Cuisine fusion océan & savane',
  },
];
