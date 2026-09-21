'use client';

import { useState } from 'react';

interface LongTermFieldsProps {
  property?: {
    rental_mode?: string | null;
    price_per_month?: number | null;
    deposit_amount?: number | null;
    advance_months?: number | null;
    electricity_type?: string | null;
    water_source?: string | null;
    road_access?: string | null;
    is_fenced?: boolean | null;
    has_gate?: boolean | null;
    is_furnished?: boolean | null;
  } | null;
}

export function LongTermRentalFields({ property }: LongTermFieldsProps = {}) {
  const [rentalMode, setRentalMode] = useState<string>(
    property?.rental_mode || 'courte_duree'
  );

  const showLongTerm = rentalMode === 'longue_duree' || rentalMode === 'les_deux';

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-navy-700 mb-1">
          Mode de location
        </label>
        <select
          name="rental_mode"
          value={rentalMode}
          onChange={(e) => setRentalMode(e.target.value)}
          className="w-full rounded-lg border border-navy-100 px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-sun-400"
        >
          <option value="courte_duree">Courte durée</option>
          <option value="longue_duree">Longue durée</option>
          <option value="les_deux">Les deux</option>
        </select>
      </div>

      <fieldset
        className={`rounded-xl border border-navy-100 bg-warm/40 p-4 transition-all ${
          showLongTerm ? 'block' : 'hidden'
        }`}
      >
        <legend className="px-1 font-display text-lg font-bold text-navy-800">
          Informations longue durée
        </legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">
              Prix / mois (FCFA)
            </label>
            <input
              type="number"
              name="price_per_month"
              defaultValue={
                property?.price_per_month != null
                  ? String(property.price_per_month)
                  : ''
              }
              className="w-full rounded-lg border border-navy-100 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sun-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">
              Caution (FCFA)
            </label>
            <input
              type="number"
              name="deposit_amount"
              defaultValue={
                property?.deposit_amount != null
                  ? String(property.deposit_amount)
                  : ''
              }
              className="w-full rounded-lg border border-navy-100 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sun-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">
              Nombre de mois d'avance demandés
            </label>
            <input
              type="number"
              name="advance_months"
              defaultValue={
                property?.advance_months != null
                  ? String(property.advance_months)
                  : ''
              }
              className="w-full rounded-lg border border-navy-100 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sun-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">
              Type d'électricité
            </label>
            <select
              name="electricity_type"
              defaultValue={property?.electricity_type || ''}
              className="w-full rounded-lg border border-navy-100 px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-sun-400"
            >
              <option value="">Sélectionner</option>
              {[
                'Compteur individuel',
                'Compteur partagé',
                'Groupe électrogène',
                'Aucun',
              ].map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">
              Source d'eau
            </label>
            <select
              name="water_source"
              defaultValue={property?.water_source || ''}
              className="w-full rounded-lg border border-navy-100 px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-sun-400"
            >
              <option value="">Sélectionner</option>
              {['Robinet CDE', 'Forage', 'Puits', 'Citerne', 'Aucun'].map(
                (val) => (
                  <option key={val} value={val}>
                    {val}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">
              Accès à la route
            </label>
            <select
              name="road_access"
              defaultValue={property?.road_access || ''}
              className="w-full rounded-lg border border-navy-100 px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-sun-400"
            >
              <option value="">Sélectionner</option>
              {[
                'Bord de route bitumée',
                'À moins de 100m',
                'Accès non bitumé',
                'Éloigné de la route',
              ].map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
            <label className="flex items-center gap-2 text-sm text-navy-700 cursor-pointer">
              <input
                type="checkbox"
                name="is_fenced"
                defaultChecked={!!property?.is_fenced}
              />
              Clôturé
            </label>

            <label className="flex items-center gap-2 text-sm text-navy-700 cursor-pointer">
              <input
                type="checkbox"
                name="has_gate"
                defaultChecked={!!property?.has_gate}
              />
              Portail
            </label>

            <label className="flex items-center gap-2 text-sm text-navy-700 cursor-pointer">
              <input
                type="checkbox"
                name="is_furnished"
                defaultChecked={!!property?.is_furnished}
              />
              Meublé
            </label>
          </div>
        </div>
      </fieldset>
    </div>
  );
}
