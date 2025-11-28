"use client";

import React, { useEffect, useState } from "react";

interface TextRotatorProps {
    texts: string[];
    interval?: number;
    className?: string;
}

const TextRotator: React.FC<TextRotatorProps> = ({
    texts,
    interval = 3000,
    className = "",
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [key, setKey] = useState(0); // Force re-render to restart animations

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % texts.length);
            setKey((prev) => prev + 1);
        }, interval);

        return () => clearInterval(timer);
    }, [texts.length, interval]);

    const currentText = texts[currentIndex];

    return (
        <span className={`inline-flex overflow-hidden ${className}`}>
            {currentText.split("").map((char, index) => (
                <span
                    key={`${key}-${index}`}
                    className="inline-block"
                    style={{
                        animationName: "slide-down-reveal",
                        animationDuration: "0.5s",
                        animationTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                        animationFillMode: "both",
                        animationDelay: `${index * 30}ms`, // Slightly faster stagger
                        whiteSpace: "pre",
                        willChange: "transform, opacity",
                    }}
                >
                    {char}
                </span>
            ))}
        </span>
    );
};

export default TextRotator;
