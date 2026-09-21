'use client';

import { useState } from 'react';
import type { Property } from '@/types';
import { PropertyCard } from '@/components/properties/property-card';
import { PropertyMap } from '@/components/shared/property-map';
import { LayoutGrid, Map } from 'lucide-react';
import Link from 'next/link';

interface ListingsViewProps {
  properties: Property[];
  hasFilters: boolean;
}

export function ListingsView({ properties, hasFilters }: ListingsViewProps) {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  return (
    <div className="space-y-6">
      {/* Top bar avec compteur et toggle Liste / Carte */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy sm:text-4xl">
            Logements à Kribi
          </h1>
          <p className="mt-1 text-navy/55 text-sm">
            {properties.length} logement{properties.length !== 1 ? 's' : ''}{' '}
            {hasFilters ? 'correspondant à vos critères' : 'disponible(s)'}
          </p>
        </div>

        {/* Toggle Liste / Carte */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl ring-1 ring-navy/10 shadow-sm shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
              viewMode === 'list'
                ? 'bg-navy text-white shadow-sm'
                : 'text-navy/60 hover:text-navy'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Liste</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
              viewMode === 'map'
                ? 'bg-sun text-white shadow-sm'
                : 'text-navy/60 hover:text-navy'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Carte Kribi</span>
          </button>
        </div>
      </div>

      {properties.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center text-navy/50 ring-1 ring-navy/5">
          {hasFilters
            ? "Aucun logement ne correspond à vos critères. Essayez d'élargir vos filtres."
            : 'Aucun logement publié pour le moment.'}
        </div>
      ) : viewMode === 'map' ? (
        /* VUE CARTE */
        <div className="space-y-3">
          <PropertyMap properties={properties} height="620px" />
          <p className="text-xs text-navy/40 text-center font-medium">
            Cliquez sur un marqueur de tarif pour voir l&apos;aperçu du logement
          </p>
        </div>
      ) : (
        /* VUE LISTE */
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <Link key={property.id} href={`/logements/${property.id}`}>
              <PropertyCard property={property} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
