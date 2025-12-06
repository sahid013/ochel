import type { Metadata } from "next";
import localFont from "next/font/local";
import { EB_Garamond, Forum, Oswald, Inter, Plus_Jakarta_Sans } from "next/font/google";
import { ClientProviders } from "@/components/providers";
import { DeliveryPopup } from "@/components/DeliveryPopup";
import { AuthErrorHandler } from "@/components/AuthErrorHandler";
import "./globals.css";

const satoshi = localFont({
  src: [
    {
      path: "./fonts/Satoshi-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Satoshi-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/Satoshi-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/Satoshi-Black.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-satoshi",
});

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-eb-garamond",
  weight: ["400", "500", "600", "700"],
});

const forum = Forum({
  subsets: ["latin"],
  variable: "--font-forum",
  weight: ["400"],
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

const loubag = localFont({
  src: [
    {
      path: "./fonts/Loubag-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Loubag-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/Loubag-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/Loubag-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/Loubag-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-loubag",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "",
  description: "",
  icons: {
    icon: '/icons/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script type="module" src="https://cdnjs.cloudflare.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js" async></script>
      </head>
      <body
        className={`${satoshi.variable} ${ebGaramond.variable} ${forum.variable} ${oswald.variable} ${inter.variable} ${loubag.variable} ${plusJakartaSans.variable} font-sans antialiased bg-white`}
      >
        <ClientProviders>
          {/* Global Auth Error Handler */}
          <AuthErrorHandler />
          {children}
          {/* Global Delivery Popup - Available on all pages */}
          <DeliveryPopup />
        </ClientProviders>
      </body>
    </html>
  );
}
