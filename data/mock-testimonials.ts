import type { Testimonial } from '@/types';

export const mockTestimonials: Testimonial[] = [
  {
    id: 't1',
    name: 'Aïcha Nkomo',
    role: 'Voyageuse',
    location: 'Yaoundé, Cameroun',
    avatar: 'https://i.pravatar.cc/150?img=47',
    rating: 5,
    text: 'J\'ai pu trouver mon logement et organiser mes activités avant même d\'arriver à Kribi. Tout était parfait à l\'arrivée.',
  },
  {
    id: 't2',
    name: 'Thomas Berger',
    role: 'Touriste',
    location: 'Paris, France',
    avatar: 'https://i.pravatar.cc/150?img=12',
    rating: 5,
    text: 'Une plateforme claire et élégante. J\'ai découvert des expériences que je n\'aurais jamais trouvées seul. Kribi est magique.',
  },
  {
    id: 't3',
    name: 'Emmanuel Biya',
    role: 'Voyageur d\'affaires',
    location: 'Douala, Cameroun',
    avatar: 'https://i.pravatar.cc/150?img=33',
    rating: 5,
    text: 'Pour un séjour professionnel, KribiLand m\'a fait gagner un temps fou. Réservation simple, prestations de qualité.',
  },
];
