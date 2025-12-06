import React from 'react';
import dynamic from 'next/dynamic';
import animationData from '../../../public/assets/Cooking.json';

// Dynamically import Lottie to avoid SSR issues
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

interface EmptyStateProps {
    message: string;
    className?: string; // Allow custom styling for text
    invertAnimation?: boolean;
    animationData?: any;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message, className, invertAnimation, animationData: customAnimationData }) => {
    return (
        <div className="flex flex-col items-center justify-center py-[80px] w-fit mx-auto">
            <div className="w-[85px] h-[85px] mb-6" style={{ filter: invertAnimation ? 'brightness(0) invert(1)' : 'none' }}>
                <Lottie animationData={customAnimationData || animationData} loop={true} />
            </div>
            <p className={`text-lg font-medium text-center ${className || 'text-gray-500'}`}>
                {message}
            </p>
        </div>
    );
};
