/**
 * Stripe plan configurations
 * Central source of truth for all plan-related logic
 */

export interface PlanDetails {
  readonly name: string;
  readonly credits: number;
}

/**
 * Mapping of Stripe product IDs to plan details
 * Updated with LIVE production Product IDs
 */
export const STRIPE_PLANS: Record<string, PlanDetails> = {
  'prod_TeC1BPj8drCWmA': {
    name: 'Standard',
    credits: 5,
  },
  'prod_TeC4RBVp4NJNPy': {
    name: 'Essentielle',
    credits: 15,
  },
  'prod_TeC6qYUFRekEzT': {
    name: 'Avancée',
    credits: 25,
  },
  'prod_TeCHj5wFSShp6w': {
    name: 'Menu multilingue',
    credits: 0,
  },
} as const;

/**
 * Default plan details for free tier or unknown plans
 */
export const DEFAULT_PLAN: PlanDetails = {
  name: 'free',
  credits: 0,
} as const;

/**
 * Get plan details from Stripe product ID
 * @param productId - Stripe product ID
 * @returns Plan details including name and credits
 */
export function getPlanDetails(productId: string): PlanDetails {
  return STRIPE_PLANS[productId] || DEFAULT_PLAN;
}

/**
 * Check if a product ID corresponds to a valid paid plan
 * @param productId - Stripe product ID
 * @returns True if the product ID is a valid paid plan
 */
export function isValidPaidPlan(productId: string): boolean {
  return productId in STRIPE_PLANS;
}
