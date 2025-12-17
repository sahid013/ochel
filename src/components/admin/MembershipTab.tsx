'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { PrimaryButton, Button } from '@/components/ui';
import AnimateIn from '@/components/ui/AnimateIn';
import { supabase } from '@/lib/supabase';
import { Restaurant } from '@/types';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface MembershipTabProps {
    restaurant: Restaurant;
    slug: string;
}

export function MembershipTab({ restaurant, slug }: MembershipTabProps) {
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [currentPlan, setCurrentPlan] = useState<{ status: string; plan: string } | null>({
        status: restaurant.subscription_status || 'inactive',
        plan: restaurant.subscription_plan || 'free'
    });
    const [billingCycle, setBillingCycle] = useState<'month' | 'year'>('month');

    // Sync state with prop if it updates
    useEffect(() => {
        async function fetchSubscriptionStatus() {
            try {
                // Fetch real-time data from our new API
                const res = await fetch('/api/get-subscription-details', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ slug })
                });

                if (res.ok) {
                    const data = await res.json();
                    setCurrentPlan(data);
                } else {
                    // Fallback to basic DB check if API fails
                    const { data, error } = await supabase
                        .from('restaurants')
                        .select('subscription_status, subscription_plan')
                        .eq('slug', slug)
                        .single();

                    if (data && !error) {
                        setCurrentPlan({
                            status: data.subscription_status || 'inactive',
                            plan: data.subscription_plan || 'free'
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching plan:', error);
            }
        }
        fetchSubscriptionStatus();
    }, [slug]);

    const plans = [
        {
            id: 'prod_Tbyu0kjYbAO1GU',
            name: 'Standard',
            price: billingCycle === 'month' ? '49 €' : '499 €',
            period: '/mois',
            features: [
                "Menu digital Ochel **prêt à l'emploi**",
                "Accès à **tous les templates** de site menu, personnalisables à l'image de votre restaurant",
                "**Accès à un dashboard de gestion du menu**",
                "Jusqu'à **5 plats en 3D**",
                "QR code unique pour votre établissement",
                "Modification **instantanée** & illimitée du menu (ajouts, suppressions, prix, descriptions)",
                "Menu multilingue (option +9 € / mois)",
                "Hébergement & maintenance inclus",
                "Menu accessible partout (QR, lien, Google, réseaux sociaux)"
            ],
            footerNote: "Pensée pour une gestion fluide et autonome du menu, sans complexité.",
            popular: false,
        },
        {
            id: 'prod_Tbyv6lbtixiI8D',
            name: 'Essentielle',
            price: billingCycle === 'month' ? '59 €' : '599 €',
            period: '/mois',
            features: [
                "**Tout ce qui est inclus dans l'offre Standard**",
                "Jusqu'à **15 plats en 3D**",
                "Menu multilingue (option +9 € / mois)",
                "Gestion quotidienne du menu depuis le dashboard Ochel"
            ],
            footerNote: "Conçue pour les restaurants qui exploitent pleinement leur menu au quotidien.",
            popular: true,
        },
        {
            id: 'prod_TbyvP5fQfg2Dbh',
            name: 'Avancée',
            price: billingCycle === 'month' ? '79 €' : '799 €',
            period: '/mois',
            features: [
                "**Tout ce qui est inclus dans l'offre Essentielle**",
                "Jusqu'à **25 plats en 3D**",
                "Gestion avancée et fréquente du menu (cartes évolutives, rotations, volumes, performance)",
                "Menu multilingue (option +9 € / mois)"
            ],
            footerNote: "Adaptée aux restaurants dont le menu est un véritable levier de performance.",
            popular: false,
        }
    ];

    const handleManageSubscription = async () => {
        setLoading('portal');
        try {
            const response = await fetch('/api/create-portal-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create portal session');
            }

            const { url } = await response.json();
            window.location.href = url;

        } catch (err: any) {
            console.error('Portal error:', err);
            setError(err.message);
        } finally {
            setLoading(null);
        }
    };

    const handleSubscribe = async (priceId: string) => {
        setLoading(priceId);
        setError('');

        try {
            // 1. Get current user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error('Please log in to subscribe.');
            }

            // 2. Create Checkout Session
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    priceId,
                    restaurantId: restaurant.id,
                    email: restaurant.email,
                    slug: slug,
                    interval: billingCycle // Pass the interval to the API
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Network response was not ok');
            }

            const { url } = await response.json();

            if (url) {
                window.open(url, '_blank');
                // Since this opens in a new tab, we should clear the loading state here so the user can continue using the current tab if needed
                setLoading(null);
            } else {
                throw new Error('No checkout URL returned');
            }

        } catch (err: any) {
            console.error('Subscription error:', err);
            setError(err.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(null);
        }
    };

    // Tier Hierarchy for Logic
    const TIER_LEVELS: Record<string, number> = {
        'standard': 1,
        'essentielle': 2,
        'pro': 2, // Map 'Pro' to 'Essentielle' tier
        'avancée': 3
    };

    // Helper to determine button text
    const getButtonText = (planName: string) => {
        if (!currentPlan) return 'Choisir ce plan';

        const currentPlanName = (currentPlan.plan || '').toLowerCase();
        let normalizedPlanName = planName.toLowerCase();

        const currentTier = TIER_LEVELS[currentPlanName] || 0;
        const targetTier = TIER_LEVELS[normalizedPlanName] || 0;
        const isActive = currentPlan.status === 'active' || currentPlan.status === 'trialing';

        if (!isActive) return 'Choisir ce plan';

        if (targetTier > currentTier) return 'Améliorer';
        if (targetTier < currentTier) return 'Rétrograder';

        // Same tier
        if ((currentPlan as any).interval === 'month' && billingCycle === 'year') {
            return 'Passer à l\'annuel';
        }

        return 'Current Plan';
    };

    return (
        <div className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-10">
                    <AnimateIn animation="slide" delay={200}>
                        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4 font-loubag tracking-normal leading-tight">
                            {currentPlan?.status === 'active' || currentPlan?.status === 'trialing'
                                ? <>Une tarification simple pour gérer<br /> <span className="text-[#F34A23]">votre</span> abonnement</>
                                : <>Une tarification simple pour activer <span className="text-[#F34A23]">votre</span> menu digital <span className="text-[#F34A23]">3D</span>,</>}
                        </h1>
                        <p className="text-lg md:text-xl text-secondary max-w-3xl mx-auto font-plus-jakarta-sans italic">
                            {currentPlan?.status === 'active' || currentPlan?.status === 'trialing'
                                ? 'Modifiez, améliorez ou annulez votre abonnement à tout moment.'
                                : 'Gérez votre menu en temps réel depuis un dashboard, sans dépendre de personne.'}
                        </p>
                    </AnimateIn>
                </div>

                {/* Billing Toggle */}
                <AnimateIn animation="fade" delay={300} className="flex justify-center items-center gap-4 mb-16">
                    <span className={`text-lg font-bold font-plus-jakarta-sans transition-colors ${billingCycle === 'month' ? 'text-gray-900' : 'text-gray-500'}`}>
                        Mensuel
                    </span>

                    <button
                        onClick={() => setBillingCycle(billingCycle === 'month' ? 'year' : 'month')}
                        className={`relative w-16 h-8 rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#F34A23] focus:ring-offset-2 ${billingCycle === 'year' ? 'bg-[#F34A23]' : 'bg-gray-300'
                            }`}
                        aria-label="Toggle billing cycle"
                    >
                        <span
                            className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ease-in-out flex items-center justify-center ${billingCycle === 'year' ? 'translate-x-8' : 'translate-x-0'
                                }`}
                        >
                        </span>
                    </button>

                    <span className={`text-lg font-bold font-plus-jakarta-sans transition-colors flex items-center gap-3 ${billingCycle === 'year' ? 'text-gray-900' : 'text-gray-500'}`}>
                        Annuel
                        <span className="bg-[#dcfce7] text-[#166534] text-xs font-bold px-2.5 py-1 rounded-full border border-[#bbf7d0]">
                            -20%
                        </span>
                    </span>
                </AnimateIn>

                {/* Error Message */}
                {error && (
                    <div className="max-w-md mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-center">
                        <p className="text-red-600 font-inter">{error}</p>
                    </div>
                )}

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-20">
                    {plans.map((plan, index) => {
                        const isCurrentPlan = currentPlan?.status === 'active' && currentPlan?.plan?.toLowerCase() === plan.name.toLowerCase();

                        return (
                            <AnimateIn
                                key={plan.id}
                                animation="slide"
                                delay={300 + (index * 100)}
                                className="flex flex-col gap-4 h-full"
                            >
                                <div className="relative group transition-all duration-300 hover:-translate-y-2 h-full flex flex-col">
                                    {plan.popular && (
                                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                                            <span className="bg-[#F34A23] text-white px-6 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide shadow-md font-plus-jakarta-sans whitespace-nowrap">
                                                LE PLUS POPULAIRE
                                            </span>
                                        </div>
                                    )}
                                    <div className={`rounded-3xl overflow-hidden flex flex-col border transition-all duration-300 group-hover:shadow-xl h-full ${plan.popular
                                        ? 'bg-[#FEF5F3] border-[#F34A23] shadow-lg ring-1 ring-[#F34A23]/20'
                                        : 'bg-[#FEF5F3] border-gray-200 shadow-sm'
                                        }`}>
                                        <div className="p-4 md:p-8 pb-0 text-center">
                                            <h3 className="text-[28px] font-bold text-[#F34A23] mb-2 font-loubag uppercase">{plan.name}</h3>
                                            <div className="flex flex-col items-center justify-center mb-6">
                                                <span className="text-lg font-medium text-gray-800 font-plus-jakarta-sans">Abonnement :</span>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-[32px] font-bold text-[#F34A23] font-plus-jakarta-sans">{plan.price}</span>
                                                    <span className="text-lg text-gray-800 font-plus-jakarta-sans">{plan.period}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className={`px-8 py-6 ${plan.popular ? 'bg-white mx-0' : 'bg-white mx-0'} flex-1 flex flex-col`}>
                                            <ul className="space-y-4 mb-8 flex-1">
                                                {plan.features.map((feature, featureIndex) => (
                                                    <li key={featureIndex} className="flex items-start gap-3 text-left">
                                                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                        <span className="text-gray-700 text-[15px] font-medium font-plus-jakarta-sans leading-snug"
                                                            dangerouslySetInnerHTML={{
                                                                __html: feature.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                            }}
                                                        />
                                                    </li>
                                                ))}
                                            </ul>

                                            {(() => {
                                                const btnText = getButtonText(plan.name);
                                                const isCurrent = btnText === 'Current Plan';

                                                if (isCurrent) {
                                                    return (
                                                        <Button
                                                            disabled
                                                            className="w-full bg-[#F34A23] text-white border-[#F34A23] opacity-100 cursor-default font-bold hover:bg-[#F34A23] hover:text-white"
                                                        >
                                                            Plan Actuel
                                                        </Button>
                                                    );
                                                }

                                                // If active subscription, show manage button with custom text
                                                if (currentPlan?.status === 'active' || currentPlan?.status === 'trialing') {
                                                    return (
                                                        <Button
                                                            onClick={handleManageSubscription}
                                                            disabled={loading === 'portal' || loading !== null}
                                                            className="w-full border-gray-900"
                                                        >
                                                            {loading === 'portal' ? 'Chargement...' : btnText}
                                                        </Button>
                                                    );
                                                }

                                                // Default Select Plan buttons for new users
                                                if (plan.popular) {
                                                    return (
                                                        <PrimaryButton
                                                            onClick={() => handleSubscribe(plan.id)}
                                                            disabled={loading === plan.id || loading !== null}
                                                            fullWidth
                                                        >
                                                            {loading === plan.id ? 'Traitement...' : 'Choisir ce plan'}
                                                        </PrimaryButton>
                                                    );
                                                }

                                                return (
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => handleSubscribe(plan.id)}
                                                        disabled={loading === plan.id || loading !== null}
                                                        className="w-full border-gray-900"
                                                    >
                                                        {loading === plan.id ? 'Traitement...' : 'Choisir ce plan'}
                                                    </Button>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Note Outside Box */}
                                {plan.footerNote && (
                                    <div className="text-center px-4">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <svg className="w-6 h-6 text-[#F34A23]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                            </svg>
                                            <p className="text-[#F34A23] text-sm font-medium font-plus-jakarta-sans">
                                                {plan.footerNote}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </AnimateIn>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}
