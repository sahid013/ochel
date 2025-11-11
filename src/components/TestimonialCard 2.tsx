import React from 'react';

interface TestimonialCardProps {
  rating: number;
  title: string;
  description: string;
  author: {
    name: string;
    title: string;
    avatar?: string;
  };
}

export default function TestimonialCard({ rating, title, description, author }: TestimonialCardProps) {
  return (
    <div style={{
      display: 'flex',
      padding: '1rem',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.5625rem',
      alignSelf: 'stretch',
      borderRadius: '0.75rem',
      background: '#101010',
      border: '1px solid rgba(255, 255, 255, 0.10)'
    }}>
      <div className="flex justify-center mb-4">
        {[...Array(rating)].map((_, i) => (
          <span key={i} className="text-[#d4af37] text-xl">★</span>
        ))}
      </div>
      <h3 style={{
        color: '#FFF2CC',
        fontFamily: 'Forum',
        fontSize: '1.375rem',
        fontStyle: 'normal',
        fontWeight: 400,
        lineHeight: '1.8rem',
        textTransform: 'uppercase',
        textAlign: 'center'
      }} suppressHydrationWarning>{title}</h3>
      <p style={{
        color: 'rgba(234, 234, 234, 0.70)',
        fontFamily: 'Forum',
        fontSize: '1rem',
        fontStyle: 'normal',
        fontWeight: 400,
        lineHeight: '1.40625rem',
        textAlign: 'center'
      }}>
        {description}
      </p>
      <div style={{ width: '100%', height: '1px', backgroundColor: '#272727', margin: '0.5rem 0' }}></div>
      <div className="flex items-center justify-center">
        <div className="w-12 h-12 bg-[#4a3f35] rounded-full mr-3"></div>
        <div>
          <p className="font-eb-garamond text-sm tracking-wider">{author.name}</p>
          <p className="font-forum text-[#8a7a68] text-xs">{author.title}</p>
        </div>
      </div>
    </div>
  );
}