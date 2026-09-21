export const PROPERTY_TYPE_OPTIONS = [
    { value: 'chambre', label: 'Chambre' },
    { value: 'appartement_studio', label: 'Appartement & studio' },
    { value: 'maison', label: 'Maison' },
    { value: 'villa', label: 'Villa' },
    { value: 'autre', label: 'Autre' },
] as const;

export const PROPERTY_TYPE_LABELS: Record<string, string> = Object.fromEntries(
    PROPERTY_TYPE_OPTIONS.map(({ value, label }) => [value, label])
);

export const ELECTRICITY_LABELS: Record<string, string> = {
  compteur_individuel: 'Compteur individuel',
  compteur_partage: 'Compteur partagé',
  groupe_electrogene: 'Groupe électrogène',
  aucun: 'Aucun',
};

export const WATER_SOURCE_LABELS: Record<string, string> = {
  robinet_cde: 'Robinet CDE',
  forage: 'Forage',
  puits: 'Puits',
  citerne: 'Citerne',
  aucun: 'Aucun',
};

export const ROAD_ACCESS_LABELS: Record<string, string> = {
  bord_route_bitumee: 'Bord de route bitumée',
  proche_route_moins_100m: 'À moins de 100m',
  acces_non_bitume: 'Accès non bitumé',
  eloigne_de_la_route: 'Éloigné de la route',
};

// Image utilisée tant qu'un hôte n'a pas encore ajouté de photo à son logement.
export const FALLBACK_PROPERTY_IMAGE =
    'https://images.pexels.com/photos/23384204/pexels-photo-23384204.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop';