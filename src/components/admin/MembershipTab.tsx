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
            name: 'Basic',
            price: billingCycle === 'month' ? '29€' : '279€',
            period: billingCycle === 'month' ? '/month' : '/year',
            features: [
                'Up to 10 3D Plates',
                'Standard Menu Templates',
                'Email Support',
                'Basic Analytics'
            ],
            popular: false,
        },
        {
            id: 'prod_Tbyv6lbtixiI8D',
            name: 'Pro',
            price: billingCycle === 'month' ? '79€' : '759€',
            period: billingCycle === 'month' ? '/month' : '/year',
            features: [
                'Up to 30 3D Plates',
                'All Premium Templates',
                'Priority Support',
                'Advanced Analytics',
                'QR Code Generator'
            ],
            popular: true,
        },
        {
            id: 'prod_TbyvP5fQfg2Dbh',
            name: 'Enterprise',
            price: billingCycle === 'month' ? '199€' : '1899€',
            period: billingCycle === 'month' ? '/month' : '/year',
            features: [
                'Unlimited 3D Plates',
                'Custom Branding',
                'Dedicated Success Manager',
                'API Access',
                'White Label Options'
            ],
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
                window.location.href = url;
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
        'Basic': 1,
        'Pro': 2,
        'Enterprise': 3
    };

    // Helper to determine button text
    const getButtonText = (planName: string) => {
        if (!currentPlan) return 'Select Plan';

        const currentTier = TIER_LEVELS[currentPlan.plan || ''] || 0;
        const targetTier = TIER_LEVELS[planName] || 0;
        const isActive = currentPlan.status === 'active' || currentPlan.status === 'trialing';

        if (!isActive) return 'Select Plan';

        if (targetTier > currentTier) return 'Upgrade';
        if (targetTier < currentTier) return 'Downgrade';

        // Same tier
        // Note: currentPlan.interval might be undefined if we didn't fetch it yet or DB fallback
        // The API returns 'interval' but our state type definition needs to support it.
        // We handle that in a separate edit or cast here.
        if ((currentPlan as any).interval === 'month' && billingCycle === 'year') {
            return 'Switch to Annual';
        }

        return 'Current Plan';
    };

    return (
        <div className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-10">
                    <AnimateIn animation="slide" delay={200}>
                        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6 font-loubag uppercase tracking-wide">
                            {currentPlan?.status === 'active' || currentPlan?.status === 'trialing'
                                ? 'Manage Subscription'
                                : 'Choose Your Plan'}
                        </h1>
                        <p className="text-xl text-secondary max-w-2xl mx-auto font-plus-jakarta-sans">
                            {currentPlan?.status === 'active' || currentPlan?.status === 'trialing'
                                ? 'Upgrade, downgrade, or cancel your plan at any time.'
                                : 'Unlock the power of 3D menus. Select the plan that fits your restaurant\'s needs.'}
                        </p>
                    </AnimateIn>
                </div>

                {/* Billing Toggle */}
                <AnimateIn animation="fade" delay={300} className="flex justify-center items-center gap-4 mb-16">
                    <span className={`text-lg font-bold font-plus-jakarta-sans transition-colors ${billingCycle === 'month' ? 'text-gray-900' : 'text-gray-500'}`}>
                        Monthly
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
                            {/* Grip texture */}
                            <div className="grid grid-cols-2 gap-0.5 opacity-30">
                                <div className="w-0.5 h-0.5 bg-black rounded-full"></div>
                                <div className="w-0.5 h-0.5 bg-black rounded-full"></div>
                                <div className="w-0.5 h-0.5 bg-black rounded-full"></div>
                                <div className="w-0.5 h-0.5 bg-black rounded-full"></div>
                            </div>
                        </span>
                    </button>

                    <span className={`text-lg font-bold font-plus-jakarta-sans transition-colors flex items-center gap-3 ${billingCycle === 'year' ? 'text-gray-900' : 'text-gray-500'}`}>
                        Annual
                        <span className="bg-[#dcfce7] text-[#166534] text-xs font-bold px-2.5 py-1 rounded-full border border-[#bbf7d0]">
                            Save 20%
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
                                className={`relative rounded-3xl p-8 flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border ${plan.popular
                                    ? 'bg-white border-[#F34A23] shadow-lg ring-1 ring-[#F34A23]/20'
                                    : 'bg-white border-gray-200 shadow-sm'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                        <span className="bg-[#F34A23] text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wide shadow-md font-plus-jakarta-sans">
                                            Most Popular
                                        </span>
                                    </div>
                                )}

                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold text-primary mb-2 font-loubag uppercase">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold text-primary font-plus-jakarta-sans">{plan.price}</span>
                                        <span className="text-gray-500 font-plus-jakarta-sans">{plan.period}</span>
                                    </div>
                                </div>

                                <ul className="space-y-4 mb-8 flex-1">
                                    {plan.features.map((feature, featureIndex) => (
                                        <li key={featureIndex} className="flex items-start gap-3">
                                            <div className="w-5 h-5 rounded-full bg-[#fcece9] flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <svg className="w-3 h-3 text-[#F34A23]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span className="text-gray-600 font-medium font-plus-jakarta-sans">{feature}</span>
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
                                                Current Plan
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
                                                {loading === 'portal' ? 'Loading...' : btnText}
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
                                                {loading === plan.id ? 'Processing...' : 'Select Plan'}
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
                                            {loading === plan.id ? 'Processing...' : 'Select Plan'}
                                        </Button>
                                    );
                                })()}

                            </AnimateIn>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}
