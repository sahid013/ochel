'use client';

import { Footer } from '@/components/layout';
import { useTranslation } from '@/contexts/LanguageContext';

export function PublicFooter() {
  const { t } = useTranslation();

  return (
    <div id="contact">
      <Footer
        logo={{
          src: "/icons/MagnifikoLogo.png",
          alt: "Magnifiko Restaurant",
          width: 100,
          height: 34
        }}
        brandInfo={{
          name: "Magnifiko",
          description: t('footer.description')
        }}
        backgroundColor="bg-black"
        sections={[
          {
            title: t('footer.quickLinks'),
            items: [
              { label: t('footer.home'), href: '/' },
              { label: t('footer.menu'), href: '/menu' },
              { label: t('footer.about'), href: '#about' },
              { label: t('footer.contact'), href: '#contact' },
            ],
          },
          {
            title: t('footer.information'),
            items: [
              { icon: "/icons/footer/location.svg", label: '63 Bd Paul Vaillant Couturier,', text: '63 Bd Paul Vaillant Couturier, 94200 Ivry-sur-Seine, France' },
              { icon: "/icons/footer/phone.svg", label: '01 49 59 00 94', text: '01 49 59 00 94' },
              { icon: "/icons/footer/envelop.svg", label: 'compte.magnifiko@gmail.com', text: 'compte.magnifiko@gmail.com' },
            ],
          },
          {
            title: t('footer.hours'),
            items: [
              { label: t('footer.openDaily'), text: t('footer.openDaily') },
              { label: t('footer.hours1'), text: t('footer.hours1') },
              { label: t('footer.friday'), text: t('footer.friday') },
              { label: t('footer.hours2'), text: t('footer.hours2') },
            ],
          },
        ]}
        socialLinks={[
          { label: 'Instagram', href: '#', icon: 'instagram' },
          { label: 'Facebook', href: '#', icon: 'facebook' },
          { label: 'TikTok', href: '#', icon: 'tiktok' },
        ]}
        copyright={t('footer.copyright')}
      />
    </div>
  );
}
