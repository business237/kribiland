'use client';

import { useState } from 'react';
import { WizardSteps } from '@/components/dashboard/wizard-steps';
import { LocationPicker } from '@/components/shared/location-picker';
import { createServiceAction } from '@/app/actions/service-actions';
import type { Profile } from '@/lib/auth/get-current-profile';

export interface ServiceCategoryOption {
  id: string;
  label: string;
  slug?: string;
}

export function ServiceWizard({
  profile,
  categories,
}: {
  profile: Profile;
  categories: ServiceCategoryOption[];
}) {
  const [step, setStep] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  // Étape 1 : Catégorie & Quartier/Zone
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id || '');
  const [quartier, setQuartier] = useState<string>('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  // Étape 2 : Titre & Description
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  // Étape 3 : Tarif indicatif
  const [price, setPrice] = useState<string>('');
  const [priceAmount, setPriceAmount] = useState<string>('');

  // Étape 4 : Contact
  const [contactPhone, setContactPhone] = useState<string>(profile.phone || '');

  // Validation par étape
  const handleNext = () => {
    setError(null);

    if (step === 1) {
      if (!categoryId) {
        setError('Veuillez choisir une catégorie de service.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!title.trim()) {
        setError("Veuillez saisir le titre de l'annonce.");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handlePrev = () => {
    setError(null);
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const selectedCategoryLabel =
    categories.find((c) => c.id === categoryId)?.label || 'Catégorie inconnue';

  return (
    <div className="bg-white rounded-2xl border border-navy-100 p-6 md:p-8 shadow-sm">
      {/* Barre de progression par étapes */}
      <WizardSteps
        currentStep={step}
        totalSteps={4}
        labels={['Catégorie', 'Description', 'Tarif', 'Contact']}
      />

      {/* Message d'erreur */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 font-medium flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Formulaire englobant */}
      <form action={createServiceAction}>
        {/* Champs cachés transmis au FormData pour createServiceAction */}
        <input type="hidden" name="category_id" value={categoryId} />
        <input type="hidden" name="quartier" value={quartier} />
        <input type="hidden" name="title" value={title} />
        <input type="hidden" name="description" value={description} />
        <input type="hidden" name="price" value={price} />
        <input type="hidden" name="price_amount" value={priceAmount} />
        <input type="hidden" name="latitude" value={latitude ?? ''} />
        <input type="hidden" name="longitude" value={longitude ?? ''} />

        {/* ÉTAPE 1 : Catégorie & Zone d'intervention */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                Prix indicatif (FCFA)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={priceAmount}
                onChange={(e) => setPriceAmount(e.target.value)}
                placeholder="Ex: 15000"
                className="w-full rounded-lg border border-navy-100 px-4 py-2.5 text-navy-800 focus:outline-none focus:ring-2 focus:ring-sun-400"
              />
              <p className="text-xs text-navy-400 mt-2">
                Utilisé pour les filtres de prix. Laissez vide si le tarif dépend de la prestation.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-navy-800 mb-1">
                Catégorie & Zone d'intervention
              </h2>
              <p className="text-sm text-navy-400">
                Sélectionnez le secteur d'activité de votre prestation et votre zone d'intervention.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Catégorie de service *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryId(cat.id)}
                      className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                        categoryId === cat.id
                          ? 'border-sun-500 bg-sun-50/40 text-navy-900 ring-2 ring-sun-400'
                          : 'border-navy-100 bg-white hover:border-navy-200 text-navy-700'
                      }`}
                    >
                      <span className="font-semibold text-sm">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  Quartier / Zone d'intervention
                </label>
                <input
                  type="text"
                  value={quartier}
                  onChange={(e) => setQuartier(e.target.value)}
                  placeholder="Ex: Kribi centre, débarcadère, Ngoyé et alentours..."
                  className="w-full rounded-lg border border-navy-100 px-4 py-2.5 text-navy-800 focus:outline-none focus:ring-2 focus:ring-sun-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  Emplacement sur la carte <span className="text-navy-400 font-normal">(Recherchez ou cliquez sur le point exact)</span>
                </label>
                <LocationPicker
                  initialLat={latitude}
                  initialLng={longitude}
                  onChange={({ lat, lng }) => {
                    setLatitude(lat);
                    setLongitude(lng);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE 2 : Titre & Description */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-semibold text-navy-800 mb-1">
                Description du service
              </h2>
              <p className="text-sm text-navy-400">
                Précisez le nom de votre service et décrivez ce que vous proposez à vos clients.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  Titre de l'annonce *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Chauffeur VTC / Transfert aéroport Kribi"
                  className="w-full rounded-lg border border-navy-100 px-4 py-2.5 text-navy-800 focus:outline-none focus:ring-2 focus:ring-sun-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  Description détaillée
                </label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez votre service, vos horaires, vos véhicules ou prestations spécifiques..."
                  className="w-full rounded-lg border border-navy-100 px-4 py-2.5 text-navy-800 focus:outline-none focus:ring-2 focus:ring-sun-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* ÉTAPE 3 : Tarif indicatif */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-semibold text-navy-800 mb-1">
                Tarif indicatif
              </h2>
              <p className="text-sm text-navy-400">
                Indiquez votre grille tarifaire ou un prix de départ pour vos futurs clients.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                Tarif indicatif (texte libre)
              </label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Ex: À partir de 2 500 FCFA / course ou 15 000 FCFA / jour"
                className="w-full rounded-lg border border-navy-100 px-4 py-2.5 text-navy-800 focus:outline-none focus:ring-2 focus:ring-sun-400"
              />
              <p className="text-xs text-navy-400 mt-2">
                Format libre pour s'adapter à tout type de tarif (forfait, prix horaire, sur devis).
              </p>
            </div>
          </div>
        )}

        {/* ÉTAPE 4 : Contact & Récapitulatif */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-semibold text-navy-800 mb-1">
                Contact & Validation
              </h2>
              <p className="text-sm text-navy-400">
                Vérifiez les détails avant de publier votre annonce de service.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                Téléphone de contact *
              </label>
              <input
                type="tel"
                name="contact_phone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+237 6XX XXX XXX"
                className="w-full rounded-lg border border-navy-100 px-4 py-2.5 text-navy-800 focus:outline-none focus:ring-2 focus:ring-sun-400"
                required
              />
            </div>

            {/* Récapitulatif en lecture seule */}
            <div className="bg-navy-50/60 rounded-xl p-5 border border-navy-100 space-y-4 text-sm">
              <h3 className="font-semibold text-navy-800 text-base border-b border-navy-100 pb-2">
                📋 Récapitulatif du service
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-navy-700">
                <div>
                  <span className="text-navy-400 block text-xs">Catégorie :</span>
                  <span className="font-medium">{selectedCategoryLabel}</span>
                </div>
                <div>
                  <span className="text-navy-400 block text-xs">Zone d'intervention :</span>
                  <span className="font-medium">{quartier || 'Non spécifiée'}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-navy-400 block text-xs">Titre de l'annonce :</span>
                  <span className="font-medium">{title}</span>
                </div>
                {description && (
                  <div className="sm:col-span-2">
                    <span className="text-navy-400 block text-xs">Description :</span>
                    <p className="text-xs text-navy-600 line-clamp-3 bg-white p-2.5 rounded-lg border border-navy-100 mt-1">
                      {description}
                    </p>
                  </div>
                )}
                <div className="sm:col-span-2">
                  <span className="text-navy-400 block text-xs">Tarif indicatif :</span>
                  <span className="font-semibold text-sun-600">
                    {priceAmount ? `${Number(priceAmount).toLocaleString('fr-FR')} FCFA` : price || 'Sur devis'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 pt-6 border-t border-navy-100 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-5 py-2.5 rounded-full border border-navy-200 text-navy-700 hover:bg-navy-50 font-medium text-sm transition"
            >
              ← Précédent
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-full bg-sun-500 hover:bg-sun-600 text-white font-semibold text-sm transition shadow-md"
            >
              Suivant →
            </button>
          ) : (
            <button
              type="submit"
              className="px-8 py-3 rounded-full bg-sun-500 hover:bg-sun-600 text-white font-semibold text-base transition shadow-md"
            >
              Publier mon service
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
