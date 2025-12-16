'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import AnimateIn from '@/components/ui/AnimateIn';

export default function SubscriptionSuccessPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const slug = params.slug as string;
    const sessionId = searchParams.get('session_id');

    const [status, setStatus] = useState('Verifying subscription...');
    const [retries, setRetries] = useState(0);

    useEffect(() => {
        if (!slug) return;

        let intervalId: NodeJS.Timeout;

        const checkSubscriptionStatus = async () => {
            try {
                // Fetch restaurant subscription status
                const { data: restaurant, error } = await supabase
                    .from('restaurants')
                    .select('subscription_status')
                    .eq('slug', slug)
                    .single();

                if (error) {
                    console.error('Error fetching status:', error);
                    return;
                }

                // Check if active or trialing
                if (restaurant && (restaurant.subscription_status === 'active' || restaurant.subscription_status === 'trialing')) {
                    setStatus('Subscription active! Redirecting...');
                    clearInterval(intervalId);

                    // Add a small delay for user to see success message
                    setTimeout(() => {
                        router.push(`/${slug}/admin`);
                    }, 1000);
                } else {
                    // Still waiting for webhook
                    setRetries(prev => prev + 1);
                    if (retries > 10) {
                        setStatus('This is taking longer than usual...');
                    }
                }
            } catch (err) {
                console.error('Polling error:', err);
            }
        };

        // Poll every 2 seconds
        intervalId = setInterval(checkSubscriptionStatus, 2000);

        // Initial check
        checkSubscriptionStatus();

        return () => clearInterval(intervalId);
    }, [slug, router, retries]);

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                <AnimateIn animation="fade">
                    <div className="mb-8 flex justify-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-4 font-loubag">
                        Payment Successful!
                    </h1>

                    <p className="text-gray-600 mb-8 font-plus-jakarta-sans">
                        {status}
                    </p>

                    <div className="flex justify-center">
                        <LoadingSpinner size="md" />
                    </div>

                    {retries > 5 && (
                        <div className="flex flex-col items-center gap-2 mt-8">
                            <p className="text-sm text-gray-500">
                                Stripe webhook might be delayed.
                            </p>
                            <button
                                onClick={async () => {
                                    setStatus('Force verifying payment...');
                                    try {
                                        const res = await fetch('/api/verify-payment', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ sessionId, slug })
                                        });
                                        const data = await res.json();
                                        if (data.success) {
                                            router.push(`/${slug}/admin`);
                                        } else {
                                            setStatus('Verification failed: ' + (data.error || 'Unknown error'));
                                        }
                                    } catch (e) {
                                        setStatus('Verification error');
                                    }
                                }}
                                className="bg-primary text-white px-6 py-2 rounded-full font-bold shadow-md hover:bg-primary/90 transition-colors"
                            >
                                Force Verification
                            </button>
                        </div>
                    )}
                </AnimateIn>
            </div>
        </div>
    );
}
