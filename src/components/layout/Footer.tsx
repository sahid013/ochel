'use client';

import Link from 'next/link';
import Image from 'next/image';

export interface FooterSection {
  title: string;
  items: Array<{
    icon?: string,
    label: string;
    href?: string;
    text?: string;
    external?: boolean;
    highlight?: boolean;
  }>;
}

export interface FooterProps {
  brandInfo?: {
    name: string;
    description: string;
  };
  logo?: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
  sections?: FooterSection[];
  socialLinks?: Array<{
    label: string;
    href: string;
    icon: 'facebook' | 'instagram' | 'tiktok';
  }>;
  copyright?: string;
  backgroundColor?: string;
  className?: string;
}

const defaultBrandInfo = {
  name: 'lm',
  description: 'Restaurant gastronomique situé au cœur d\'Ivry-sur-Seine, proposant une cuisine d\'exception dans un cadre élégant et raffiné.',
};

const defaultSections: FooterSection[] = [
  {
    title: 'NOUS SITUER',
    items: [
      { label: '63 Bd Paul Vaillant Couturier', text: '63 Bd Paul Vaillant Couturier' },
      { label: '94200 Ivry-sur-Seine, France', text: '94200 Ivry-sur-Seine, France' },
      { label: 'Tél: 01 49 59 00 94', text: 'Tél: 01 49 59 00 94' },
      { label: 'compte.magnifiko@gmail.com', text: 'compte.magnifiko@gmail.com' },
    ],
  },
  {
    title: 'HORAIRES',
    items: [
      { label: 'Lundi - Dimanche', text: 'Lundi - Dimanche' },
      { label: '11h00 - 00h00', text: '11h00 - 00h00' },
      { label: 'Service continu', text: 'Service continu', highlight: true },
    ],
  },
];

const defaultSocialLinks = [
  { label: 'Facebook', href: '#', icon: 'facebook' as const },
  { label: 'Instagram', href: '#', icon: 'instagram' as const },
  { label: 'TikTok', href: '#', icon: 'tiktok' as const },
];

const SocialIcon = ({ icon }: { icon: 'facebook' | 'instagram' | 'tiktok' }) => {
  // Map icon names to actual file names
  const iconMap: Record<string, string> = {
    facebook: 'Facebook',
    instagram: 'Instagram',
    tiktok: 'Tiktok',
  };

  const iconPath = `/icons/${iconMap[icon]}.svg`;

  return (
    <div className="w-5 h-5 relative">
      <Image
        src={iconPath}
        alt={icon}
        width={20}
        height={20}
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default function Footer({
  brandInfo = defaultBrandInfo,
  logo,
  sections = defaultSections,
  socialLinks = defaultSocialLinks,
  copyright = '© 2024 Restaurant LM. Tous droits réservés.',
  backgroundColor = 'bg-[#1a1612]',
  className = '',
}: FooterProps) {
  return (
    <footer className={`${backgroundColor} py-16 w-full overflow-hidden ${className}`}>
      <div className="max-w-[1420px] mx-auto px-6">
        <div className="grid md:grid-cols-5 gap-12">
          {/* Brand Section */}
          {(brandInfo || logo) && (
            <div className="md:col-span-2">
              {logo ? (
                <div className="mb-6">
                  <Link href="/">
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      width={logo.width || 100}
                      height={logo.height || 34}
                      className="object-contain cursor-pointer"
                    />
                  </Link>
                </div>
              ) : (
                <Link href="/">
                  <div className="font-eb-garamond text-3xl font-bold tracking-wider mb-6 cursor-pointer">
                    {brandInfo?.name}
                  </div>
                </Link>
              )}
              {brandInfo && (
                <p className="font-forum text-[#c9b99b] mb-6 leading-relaxed">
                  {brandInfo.description}
                </p>
              )}
            </div>
          )}

          {/* Dynamic Sections */}
          {sections.map((section, index) => (
            <div key={index}>
              <h3 style={{
                color: '#FFF2CC',
                fontFamily: 'Forum',
                fontSize: '1.125rem',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: '1.6rem',
                textTransform: 'uppercase',
                marginBottom: '1.5rem'
              }} suppressHydrationWarning>
                {section.title}
              </h3>
              <div className="space-y-3 text-[#c9b99b] font-forum">
                {section.items.map((item, itemIndex) => {
                  if (item.href) {
                    return (
                      <Link
                        key={itemIndex}
                        href={item.href}
                        className="block hover:text-[#d4af37] transition-colors"
                        {...(item.external && { target: '_blank', rel: 'noopener noreferrer' })}
                      >
                        {item.label}
                      </Link>
                    );
                  }
                  
                  return (
                    <div
                      key={itemIndex}
                      className='flex items-start gap-2'
                    >
                      {item.icon && (
                        <div className="w-5 h-5 flex-shrink-0 relative mt-0.5">
                          <Image
                            src={item.icon}
                            alt={"footer-icon"}
                            width={20}
                            height={20}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                      <p
                        className={`flex-1 ${item.highlight ? 'text-[#d4af37] mt-4' : ''}`}
                      >
                        {item.text || item.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-[#4a3f35] mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="font-forum text-[#8a7a68] text-sm">
            {copyright}
          </p>
          
          {/* Social Links */}
          {socialLinks && socialLinks.length > 0 && (
            <div className="flex space-x-6 mt-4 md:mt-0">
              {socialLinks.map((social, index) => (
                <Link 
                  key={index}
                  href={social.href} 
                  className="text-[#8a7a68] hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sr-only">{social.label}</span>
                  <SocialIcon icon={social.icon} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

// Named export for convenience
export const RestaurantFooter = Footer;