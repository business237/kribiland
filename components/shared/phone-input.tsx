'use client';

import { useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface PhoneInputProps {
    name?: string;
    defaultValue?: string;
    required?: boolean;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
    onChange?: (normalizedValue: string) => void;
    error?: string;
}

export function PhoneInput({
    name = 'phone',
    defaultValue = '',
    required = false,
    disabled = false,
    placeholder = '6XX XXX XXX',
    className = '',
    onChange,
    error: externalError,
}: PhoneInputProps) {
    // Si defaultValue contient déjà '237' au début, on garde les 9 derniers chiffres
    const initialLocal = defaultValue.startsWith('237')
        ? defaultValue.slice(3, 12)
        : defaultValue.replace(/[^0-9]/g, '').slice(0, 9);

    const [localValue, setLocalValue] = useState(initialLocal);
    const [touched, setTouched] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Ne garder strictement que les chiffres, maximum 9
        const rawDigits = e.target.value.replace(/[^0-9]/g, '').slice(0, 9);
        setLocalValue(rawDigits);

        if (localError && rawDigits.length === 9) {
            setLocalError(null);
        }

        const fullNormalized = rawDigits ? `237${rawDigits}` : '';
        if (onChange) {
            onChange(fullNormalized);
        }
    };

    const handleBlur = () => {
        setTouched(true);
        if (required && localValue.length === 0) {
            setLocalError('Le numéro de téléphone est obligatoire.');
        } else if (localValue.length > 0 && localValue.length < 9) {
            setLocalError('Le numéro doit comporter exactement 9 chiffres (ex: 698123456).');
        } else if (localValue.length > 0 && !localValue.startsWith('6')) {
            setLocalError('Un numéro camerounais valide commence par 6.');
        } else {
            setLocalError(null);
        }
    };

    const fullNormalizedValue = localValue ? `237${localValue}` : '';
    const displayError = externalError || (touched ? localError : null);

    return (
        <div className={`space-y-1 ${className}`}>
            {/* Input hidden transmis automatiquement au FormData */}
            <input type="hidden" name={name} value={fullNormalizedValue} />

            <div
                className={`flex items-center rounded-xl border bg-gray-50/80 transition-all overflow-hidden ${
                    displayError
                        ? 'border-red-300 ring-2 ring-red-100 bg-red-50/20'
                        : 'border-gray-200 focus-within:ring-2 focus-within:ring-amber-500 focus-within:bg-white focus-within:border-transparent'
                } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
                {/* Prefix fixe +237 avec drapeau */}
                <div className="flex items-center gap-1.5 px-3.5 py-3 bg-gray-100/80 text-gray-800 font-extrabold text-sm border-r border-gray-200 select-none shrink-0">
                    <span className="text-base leading-none">🇨🇲</span>
                    <span>+237</span>
                </div>

                {/* Champ 9 chiffres */}
                <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={9}
                    value={localValue}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    disabled={disabled}
                    required={required}
                    placeholder={placeholder}
                    className="w-full bg-transparent px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none font-semibold tracking-wider text-sm disabled:cursor-not-allowed"
                />
            </div>

            {/* Message d'erreur local */}
            {displayError && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600 mt-1 animate-in fade-in duration-200">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{displayError}</span>
                </div>
            )}
        </div>
    );
}
