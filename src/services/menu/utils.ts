/**
 * Get translated field value based on locale
 * Falls back to French if translation not available
 */
export function getTranslatedField<T extends Record<string, any>>(
    item: T,
    field: string,
    locale: 'fr' | 'en' | 'it' | 'es'
): string {
    // For French, return the original field
    if (locale === 'fr') {
        return (item[field] as string) || '';
    }

    // For other languages, try translated field first, fallback to French
    const translatedField = `${field}_${locale}`;
    return (item[translatedField] as string) || (item[field] as string) || '';
}
