import React from 'react';

interface SectionHeaderProps {
  subtitle: string;
  title: string;
}

export default function SectionHeader({ subtitle, title }: SectionHeaderProps) {
  return (
    <div className="mb-4 text-center">
      <div className="text-[#d4af37] font-forum text-sm tracking-[0.2em] uppercase mb-2">
        {subtitle}
      </div>
      <h2 style={{
        color: '#FFF2CC',
        fontFamily: 'Forum',
        fontSize: '1.5rem',
        fontStyle: 'normal',
        fontWeight: 400,
        lineHeight: '1.8rem',
        textTransform: 'uppercase'
      }} suppressHydrationWarning>
        {title}
      </h2>
    </div>
  );
}