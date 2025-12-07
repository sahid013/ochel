import { CSSProperties } from 'react';
import { Restaurant } from '@/types';

/**
 * Generates CSS variables for dynamic template styling based on restaurant settings.
 * content of these variables will override the default template colors.
 */
export function getTemplateVariables(restaurant: Restaurant): CSSProperties {
    const vars: any = {};

    if (restaurant.primary_color) vars['--pixel-primary'] = restaurant.primary_color;
    // Strictly ignore other colors as per user request
    // if (restaurant.accent_color) vars['--pixel-accent'] = restaurant.accent_color;
    // if (restaurant.background_color) vars['--pixel-bg'] = restaurant.background_color;
    // if (restaurant.text_color) vars['--pixel-text'] = restaurant.text_color;

    return vars as CSSProperties;
}
