'use client';

import { useState } from 'react';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Amenity {
    label: string;
    icon?: string | null;
    category?: string | null;
}

const CATEGORIES = [
    { key: 'general', label: 'Général' },
    { key: 'exterieur', label: 'Extérieur' },
    { key: 'cuisine', label: 'Cuisine' },
    { key: 'securite', label: 'Sécurité' },
];

function normalizeCategory(category: string | null | undefined): string {
    return (category || 'general').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function getAmenityIcon(iconName?: string | null): LucideIcon {
    if (!iconName) return Icons.Sparkles;
    const normalized = iconName.replace(/(^|[-_\s])([a-z])/g, (_, prefix, letter) => `${prefix}${letter.toUpperCase()}`);
    return (Icons as unknown as Record<string, LucideIcon>)[normalized]
        || (Icons as unknown as Record<string, LucideIcon>)[iconName]
        || Icons.Sparkles;
}

export function AmenitiesSection({ amenities }: { amenities: Amenity[] }) {
    const [expanded, setExpanded] = useState(false);
    if (amenities.length === 0) return null;

    const visibleAmenities = expanded ? amenities : amenities.slice(0, 8);
    const hiddenCount = amenities.length - 8;

    return (
        <section className="mt-8">
            <h2 className="mb-5 font-display text-2xl font-bold text-navy">Ce que propose ce logement</h2>
            <div className="space-y-6">
                {CATEGORIES.map((category) => {
                    const items = visibleAmenities.filter((amenity) => normalizeCategory(amenity.category) === category.key);
                    if (items.length === 0) return null;
                    return (
                        <div key={category.key}>
                            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-navy/60">{category.label}</h3>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                {items.map((amenity, index) => {
                                    const Icon = getAmenityIcon(amenity.icon);
                                    return (
                                        <div key={`${amenity.label}-${index}`} className="flex min-h-[76px] items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-navy/10">
                                            <Icon className="h-5 w-5 shrink-0 text-sun" />
                                            <span className="text-sm font-medium text-navy/80">{amenity.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
            {!expanded && hiddenCount > 0 && (
                <button type="button" onClick={() => setExpanded(true)} className="mt-5 rounded-full border border-navy/20 px-4 py-2 text-sm font-semibold text-navy hover:border-sun hover:text-sun">
                    Voir les {hiddenCount} équipements
                </button>
            )}
        </section>
    );
}
