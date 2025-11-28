"use client";

import React, { useEffect, useRef, useState } from "react";

interface AnimateInProps {
    children: React.ReactNode;
    animation?: "fade" | "slide" | "blur";
    duration?: number;
    delay?: number;
    threshold?: number;
    className?: string;
    style?: React.CSSProperties;
}

const AnimateIn: React.FC<AnimateInProps> = ({
    children,
    animation = "fade",
    duration = 500,
    delay = 0,
    threshold = 0.1,
    className = "",
    style,
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated) {
                    setIsVisible(true);
                    setHasAnimated(true);
                }
            },
            {
                threshold,
                rootMargin: "0px 0px -50px 0px", // Trigger slightly before bottom
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [threshold, hasAnimated]);

    const getAnimationName = () => {
        switch (animation) {
            case "slide":
                return "slide-in-from-bottom";
            case "blur":
                return "blur-in";
            case "fade":
            default:
                return "fade-in";
        }
    };

    const animationStyle: React.CSSProperties = isVisible
        ? {
            animationName: getAnimationName(),
            animationDuration: `${duration}ms`,
            animationDelay: `${delay}ms`,
            animationFillMode: "both",
            animationTimingFunction: "ease-out",
            ...style,
        }
        : {
            visibility: "hidden",
            ...style,
        };

    return (
        <div ref={ref} className={className} style={animationStyle}>
            {children}
        </div>
    );
};

export default AnimateIn;
