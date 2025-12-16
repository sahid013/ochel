'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PrimaryButton } from '@/components/ui';
import AnimateIn from '@/components/ui/AnimateIn';

export default function SubscriptionSuccessPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const slug = params.slug as string;
    const sessionId = searchParams.get('session_id');

    const [status, setStatus] = useState('Verifying your payment...');
    const [error, setError] = useState<string | null>(null);
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        if (!slug || !sessionId) {
            setError('Missing payment information');
            return;
        }

        const verifyPayment = async () => {
            try {
                setStatus('Verifying your payment...');

                const res = await fetch('/api/verify-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId, slug })
                });

                const data = await res.json();

                if (data.success) {
                    setStatus('Payment verified! You can now access your dashboard.');
                    setIsVerified(true);
                } else {
                    setError(data.error || 'Payment verification failed');
                }
            } catch (err) {
                console.error('Verification error:', err);
                setError('An error occurred while verifying your payment');
            }
        };

        // Verify payment immediately on page load
        verifyPayment();
    }, [slug, sessionId, router]);

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                <AnimateIn animation="fade">
                    {!error ? (
                        <>
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
                                {isVerified ? (
                                    <PrimaryButton
                                        onClick={() => router.push(`/${slug}/admin`)}
                                        className="bg-[#F34A23] hover:bg-[#d63e1b] text-white font-bold py-3 px-8 text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                                    >
                                        Visit Dashboard
                                    </PrimaryButton>
                                ) : (
                                    <LoadingSpinner size="md" />
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="mb-8 flex justify-center">
                                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                                    <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                            </div>

                            <h1 className="text-3xl font-bold text-gray-900 mb-4 font-loubag">
                                Verification Failed
                            </h1>

                            <p className="text-gray-600 mb-8 font-plus-jakarta-sans">
                                {error}
                            </p>

                            <button
                                onClick={() => router.push(`/${slug}/subscribe`)}
                                className="bg-primary text-white px-6 py-3 rounded-full font-bold shadow-md hover:bg-primary/90 transition-colors"
                            >
                                Back to Subscribe
                            </button>
                        </>
                    )}
                </AnimateIn>
            </div>
        </div>
    );
}
