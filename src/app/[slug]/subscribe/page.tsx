'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { PrimaryButton, Button } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import AnimateIn from '@/components/ui/AnimateIn';

// Initialize Stripe (replace key with env var in real app)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

import { useParams } from 'next/navigation';

export default function SubscribePage() {
    const params = useParams();
    const slug = params.slug as string;
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);
    const [error, setError] = useState('');

    const plans = [
        {
            id: 'prod_Tbyu0kjYbAO1GU',
            name: 'Basic',
            price: '29€',
            period: '/month',
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
            price: '79€',
            period: '/month',
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
            price: '199€',
            period: '/month',
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

    const handleSubscribe = async (priceId: string) => {
        setLoading(priceId);
        setError('');

        try {
            // 1. Get current user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error('Please log in to subscribe.');
            }

            // 2. Get restaurant details
            const { data: restaurant } = await supabase
                .from('restaurants')
                .select('id, email')
                .eq('slug', slug)
                .single();

            if (!restaurant) {
                throw new Error('Restaurant not found.');
            }

            // 3. Create Checkout Session
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    priceId,
                    restaurantId: restaurant.id,
                    email: restaurant.email,
                    slug: slug
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

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-beige)' }}>
            <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-16">
                    <AnimateIn animation="slide" delay={200}>
                        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6 font-loubag uppercase tracking-wide">
                            Choose Your Plan
                        </h1>
                        <p className="text-xl text-secondary max-w-2xl mx-auto font-plus-jakarta-sans">
                            Unlock the power of 3D menus. Select the plan that fits your restaurant's needs.
                        </p>
                    </AnimateIn>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="max-w-md mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-center">
                        <p className="text-red-600 font-inter">{error}</p>
                    </div>
                )}

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-20">
                    {plans.map((plan, index) => (
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

                            {plan.popular ? (
                                <PrimaryButton
                                    onClick={() => handleSubscribe(plan.id)}
                                    disabled={loading === plan.id || loading !== null}
                                    fullWidth
                                >
                                    {loading === plan.id ? 'Processing...' : 'Select Plan'}
                                </PrimaryButton>
                            ) : (
                                <Button
                                    variant="outline"
                                    onClick={() => handleSubscribe(plan.id)}
                                    disabled={loading === plan.id || loading !== null}
                                    className="w-full border-gray-900"
                                >
                                    {loading === plan.id ? 'Processing...' : 'Select Plan'}
                                </Button>
                            )}
                        </AnimateIn>
                    ))}
                </div>

                {/* Custom Website Section */}
                <AnimateIn animation="blur" delay={600} className="max-w-4xl mx-auto">
                    <div className="bg-[#1a1a1a] rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
                        {/* Background decorative elements */}
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
                            <div className="absolute top-0 left-0 w-64 h-64 bg-[#F34A23] rounded-full filter blur-[100px] transform -translate-x-1/2 -translate-y-1/2"></div>
                            <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-600 rounded-full filter blur-[100px] transform translate-x-1/2 translate-y-1/2"></div>
                        </div>

                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-loubag uppercase">
                                Need a Custom Website?
                            </h2>
                            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto font-plus-jakarta-sans">
                                Don't want to use a template? Our team of experts can build a fully custom, high-performance website tailored exactly to your brand's unique identity.
                            </p>
                            <a
                                href="mailto:contact@ochel.com"
                                className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg font-plus-jakarta-sans"
                            >
                                Contact Us
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </AnimateIn>

            </div>
        </div>
    );
}
