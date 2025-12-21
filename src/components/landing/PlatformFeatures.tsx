'use client';

import { useState } from 'react';
import { useTranslation } from '@/contexts/LanguageContext';
import AnimateIn from '@/components/ui/AnimateIn';
import { PrimaryButton } from '@/components/ui';

export const PlatformFeatures = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('visualisation');

    const features = [
        {
            key: 'visualisation',
            icon: (
                <svg className="w-6 h-6 z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            )
        },
        {
            key: 'analytics',
            icon: (
                <svg className="w-6 h-6 z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            )
        },
        {
            key: 'management',
            icon: (
                <svg className="w-6 h-6 z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
            )
        },
        {
            key: 'integration',
            icon: (
                <svg className="w-6 h-6 z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                </svg>
            )
        },
        {
            key: 'support',
            icon: (
                <svg className="w-6 h-6 z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            )
        }
    ];

    // We loop 4 times to render 4 cards per tab
    const cardIndices = ['card1', 'card2', 'card3', 'card4'];

    const getCardIcon = (index: number) => {
        // Return different icons based on active tab and index if needed, 
        // or generic nice icons for each position
        const icons = [
            // Card 1 Icon
            (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
            ),
            // Card 2 Icon
            (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            ),
            // Card 3 Icon
            (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            // Card 4 Icon
            (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4h2v-4zM6 15h2v4H6v-4zm0-6h2v4H6V9zm6 0h2v4h-2V9zm-6-6h2v4H6V3zm6 0h2v4h-2V3zM3 3h4v4H3V3zm14 0h4v4h-4V3zM3 17h4v4H3v-4z" />
                </svg>
            )
        ];
        return icons[index];
    };

    return (
        <div className="py-20 px-4 transition-colors duration-500" style={{ backgroundColor: 'var(--color-bg-beige)' }}>
            <div className="max-w-[1460px] mx-auto">
                <AnimateIn animation="slide" delay={200}>
                    <div className="text-center mb-16 max-w-4xl mx-auto">
                        <h2
                            className="text-3xl md:text-5xl font-bold text-primary mb-6 font-loubag"
                            dangerouslySetInnerHTML={{ __html: t('home.platformFeatures.title') }}
                        />
                        <p className="text-secondary text-lg md:text-xl font-plus-jakarta-sans max-w-2xl mx-auto">
                            {t('home.platformFeatures.subtitle')}
                        </p>
                    </div>
                </AnimateIn>

                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
                    {/* Left Side - Feature List */}
                    <div className="lg:w-1/3 lg:space-y-8 flex flex-row lg:flex-col overflow-x-auto pb-4 lg:pb-0 gap-6 lg:gap-0 scrollbar-hide">
                        {features.map((feature, index) => (
                            <div
                                key={feature.key}
                                onClick={() => setActiveTab(feature.key)}
                                className={`group cursor-pointer flex-shrink-0 lg:flex-shrink-1 transition-all duration-300 ease-in-out px-4 py-2 rounded-xl lg:px-0 lg:py-0 lg:rounded-none ${activeTab === feature.key
                                    ? 'bg-[#3A4D39]/10 lg:bg-transparent'
                                    : ''
                                    }`}
                            >
                                <div className={`flex items-center gap-4 ${activeTab === feature.key ? 'text-[#3A4D39] font-bold' : 'text-secondary hover:text-[#3A4D39]'
                                    } transition-colors duration-300`}>

                                    {/* Active Indicator Line (Desktop) */}
                                    <div className={`hidden lg:block pl-4 border-l-4 ${activeTab === feature.key ? 'border-[#3A4D39]' : 'border-transparent group-hover:border-[#3A4D39]/30'
                                        } py-2 transition-all duration-300 flex items-center`}>
                                        {/* Icon Wrapper */}
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg transition-all duration-300 ${activeTab === feature.key ? 'scale-110' : 'scale-100'}`}>
                                                {feature.icon}
                                            </div>
                                            <span className="text-lg font-plus-jakarta-sans whitespace-nowrap">
                                                {t(`home.platformFeatures.tabs.${feature.key}`)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Mobile View */}
                                    <div className="lg:hidden flex flex-col items-center gap-2">
                                        <div className={`p-2 rounded-full ${activeTab === feature.key ? 'bg-[#3A4D39] text-white shadow-lg' : 'bg-white border border-gray-200 text-secondary'}`}>
                                            {feature.icon}
                                        </div>
                                        <span className="text-sm font-plus-jakarta-sans font-medium">
                                            {t(`home.platformFeatures.tabs.${feature.key}`).split(' ')[0]}
                                        </span>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right Side - Cards Grid */}
                    <div className="lg:w-2/3 grid md:grid-cols-2 gap-6 relative min-h-[500px]">
                        {cardIndices.map((cardKey, index) => (
                            <AnimateIn
                                key={`${activeTab}-${cardKey}`} // Key change triggers re-mount & animation
                                animation="slide"
                                delay={index * 100}
                                duration={500}
                                className="h-full"
                            >
                                <div className="bg-[#F5F5F0] p-8 rounded-[32px] h-full shadow-sm hover:shadow-md transition-all duration-300 border border-[#E5E5E5] group hover:-translate-y-1">
                                    <div className="w-12 h-12 bg-[#3A4D39] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                        {getCardIcon(index)}
                                    </div>
                                    <h3 className="text-xl font-bold text-primary mb-4 font-plus-jakarta-sans">
                                        {t(`home.platformFeatures.cards.${activeTab}.${cardKey}.title`)}
                                    </h3>
                                    <p className="text-secondary leading-relaxed font-plus-jakarta-sans text-sm">
                                        {t(`home.platformFeatures.cards.${activeTab}.${cardKey}.description`)}
                                    </p>
                                </div>
                            </AnimateIn>
                        ))}
                    </div>
                </div>

                {/* Bottom CTA */}
                <AnimateIn animation="slide" delay={600} className="mt-20">
                    <div className="bg-white rounded-[32px] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm border border-[#E5E5E5] max-w-4xl mx-auto">
                        <div>
                            <h3 className="text-xl md:text-2xl font-bold text-primary mb-2 font-plus-jakarta-sans">
                                {t('home.platformFeatures.cta.title')}
                            </h3>
                            <p className="text-secondary font-plus-jakarta-sans">
                                {t('home.platformFeatures.cta.subtitle')}
                            </p>
                        </div>
                        <PrimaryButton href="/signup" className="shrink-0 bg-[#C2410C] hover:bg-[#9A3412] text-white px-8 py-4 rounded-full font-bold transition-all transform hover:scale-105">
                            {t('home.platformFeatures.cta.button')} →
                        </PrimaryButton>
                    </div>
                </AnimateIn>
            </div>
        </div>
    );
};
