import React from 'react';
import Image from 'next/image';

interface MenuCardProps {
  title: string;
  description: string;
  note?: string;
  image: string;
}

export default function MenuCard({ title, description, note, image }: MenuCardProps) {
  return (
    <div className="flex flex-col h-full" style={{ gap: '16px' }}>
      <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover rounded-lg"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
      <div style={{
        display: 'flex',
        padding: '1rem',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '0.5625rem',
        alignSelf: 'stretch',
        borderRadius: '0.75rem',
        background: '#101010',
        border: '1px solid rgba(255, 255, 255, 0.10)',
        flex: '1'
      }}>
        <h3 style={{
          color: '#FFF2CC',
          fontFamily: 'Forum',
          fontSize: '1.25rem',
          fontStyle: 'normal',
          fontWeight: 400,
          lineHeight: '1.5rem',
          textTransform: 'uppercase'
        }} suppressHydrationWarning>{title}</h3>
        <p style={{
          color: 'rgba(234, 234, 234, 0.70)',
          fontFamily: 'Forum',
          fontSize: '0.875rem',
          fontStyle: 'normal',
          fontWeight: 400,
          lineHeight: '1.25rem'
        }}>
          {description}
        </p>
        {note && (
          <div className="text-[#d4af37] text-sm">{note}</div>
        )}
      </div>
    </div>
  );
}