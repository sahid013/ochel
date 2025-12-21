"use client";

import React from "react";

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
    className = "",
    style,
}) => {
    return (
        <div className={className} style={style}>
            {children}
        </div>
    );
};

export default AnimateIn;
