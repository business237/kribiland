/**
 * Normalise un numéro de téléphone pour KribiLand (Cameroun).
 * - Supprime tous les caractères non numériques (espaces, +, tirets, etc.).
 * - Si le numéro fait 9 chiffres et commence par '6' (format local sans indicatif),
 *   ajoute automatiquement le préfixe "237".
 * - Si le numéro commence déjà par "237" et fait 12 chiffres, le conserve tel quel.
 */
export function normalizePhone(input: string): string {
    if (!input) return '';
    const digits = input.replace(/[^0-9]/g, '');

    // Format local camerounais à 9 chiffres débutant par 6 (ex: 698123456 -> 237698123456)
    if (digits.length === 9 && digits.startsWith('6')) {
        return `237${digits}`;
    }

    return digits;
}
