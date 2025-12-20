'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { PrimaryButton } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { AdminHeader, AdminTabs } from '@/components/admin';
import { supabase } from '@/lib/supabase';
import AnimateIn from '@/components/ui/AnimateIn';
import { useTranslation } from '@/contexts/LanguageContext';

// Initialize Stripe (replace key with env var in real app)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

import { useParams } from 'next/navigation';

export default function SubscribePage() {
    const params = useParams();
    const slug = params.slug as string;
    const router = useRouter();
    const { t, locale } = useTranslation();
    const [loading, setLoading] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [currentPlan, setCurrentPlan] = useState<{ status: string; plan: string } | null>(null);
    const [billingCycle, setBillingCycle] = useState<'month' | 'year'>('month');

    const plans = [
        {
            id: 'prod_Tbyu0kjYbAO1GU',
            name: t('home.features.plans.standard.name'),
            price: billingCycle === 'month' ? '49 €' : '490 €',
            period: billingCycle === 'month' ? t('home.features.plans.period.month') : (locale === 'fr' ? '/année' : '/year'),
            features: Array.isArray(t('home.features.plans.standard.features')) ? t('home.features.plans.standard.features') : [],
            footerNote: t('home.features.plans.standard.footer'),
            popular: false,
        },
        {
            id: 'prod_Tbyv6lbtixiI8D',
            name: t('home.features.plans.essential.name'),
            price: billingCycle === 'month' ? '59 €' : '590 €',
            period: billingCycle === 'month' ? t('home.features.plans.period.month') : (locale === 'fr' ? '/année' : '/year'),
            features: Array.isArray(t('home.features.plans.essential.features')) ? t('home.features.plans.essential.features') : [],
            footerNote: t('home.features.plans.essential.footer'),
            popular: true,
        },
        {
            id: 'prod_TbyvP5fQfg2Dbh',
            name: t('home.features.plans.advanced.name'),
            price: billingCycle === 'month' ? '79 €' : '790 €',
            period: billingCycle === 'month' ? t('home.features.plans.period.month') : (locale === 'fr' ? '/année' : '/year'),
            features: Array.isArray(t('home.features.plans.advanced.features')) ? t('home.features.plans.advanced.features') : [],
            footerNote: t('home.features.plans.advanced.footer'),
            popular: false,
        }
    ];

    useEffect(() => {
        const fetchSubscriptionStatus = async () => {
            if (!slug) return;
            const { data } = await supabase
                .from('restaurants')
                .select('subscription_status, subscription_plan')
                .eq('slug', slug)
                .single();

            if (data) {
                setCurrentPlan({
                    status: data.subscription_status,
                    plan: data.subscription_plan // e.g., 'pro', 'basic'
                });
            }
        };
        fetchSubscriptionStatus();
    }, [slug]);

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

    // ... (existing imports)

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-beige)' }}>
            {/* Show Admin Navigation if user has an active subscription or is trialing */}
            {currentPlan && (currentPlan.status === 'active' || currentPlan.status === 'trialing') && (
                <>
                    <AdminHeader />
                    <AdminTabs
                        activeTab="membership"
                        slug={slug}
                    />
                </>
            )}

            <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-10">
                    <AnimateIn animation="slide" delay={200}>
                        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4 font-loubag tracking-normal leading-tight">
                            Une tarification simple pour activer <span className="text-[#F34A23]">votre</span> menu digital <span className="text-[#F34A23]">3D</span>,
                        </h1>
                        <p className="text-lg md:text-xl text-secondary max-w-3xl mx-auto font-plus-jakarta-sans italic">
                            Gérez votre menu en temps réel depuis un dashboard, sans dépendre de personne.
                        </p>
                    </AnimateIn>
                </div>

                {/* Billing Toggle (Hidden as per requirement to follow image exactness, or kept? The image doesn't show toggle, but usually it exists. I will keep it but update labels if needed. For now keeping as is but maybe hide if user wanted EXACT match. User said "keeping the design, layout and functionality same". So I keep the toggle functionality.) */}
                <AnimateIn animation="fade" delay={300} className="flex justify-center items-center gap-4 mb-16">
                    <span className={`text-lg font-bold font-plus-jakarta-sans transition-colors ${billingCycle === 'month' ? 'text-gray-900' : 'text-gray-500'}`}>
                        {t('home.features.billing.monthly')}
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
                        {t('home.features.billing.annual')}
                        <span className="bg-[#dcfce7] text-[#166534] text-xs font-bold px-2.5 py-1 rounded-full border border-[#bbf7d0]">
                            {locale === 'fr' ? '2 mois gratuits' : '2 months free'}
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
                                                {t('home.features.plans.popularTag')}
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
                                                <span className="text-lg font-medium text-gray-800 font-plus-jakarta-sans">{t('home.features.plans.subscription')}</span>
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

                                            {isCurrentPlan ? (
                                                <Button
                                                    disabled
                                                    className="w-full bg-[#F34A23] text-white border-[#F34A23] opacity-100 cursor-default font-bold hover:bg-[#F34A23] hover:text-white"
                                                >
                                                    {t('home.features.buttons.currentPlan')}
                                                </Button>
                                            ) : plan.popular ? (
                                                <PrimaryButton
                                                    onClick={() => handleSubscribe(plan.id)}
                                                    disabled={loading === plan.id || loading !== null}
                                                    fullWidth
                                                >
                                                    {loading === plan.id ? t('home.features.buttons.processing') : t('home.features.buttons.selectPlan')}
                                                </PrimaryButton>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    onClick={() => handleSubscribe(plan.id)}
                                                    disabled={loading === plan.id || loading !== null}
                                                    className="w-full border-gray-900"
                                                >
                                                    {loading === plan.id ? t('home.features.buttons.processing') : t('home.features.buttons.selectPlan')}
                                                </Button>
                                            )}
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
