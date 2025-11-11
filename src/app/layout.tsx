import type { Metadata } from "next";
import localFont from "next/font/local";
import { EB_Garamond, Forum } from "next/font/google";
import { ClientProviders } from "@/components/providers";
import { DeliveryPopup } from "@/components/DeliveryPopup";
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

export const metadata: Metadata = {
  title: "",
  description: "",
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
        className={`${satoshi.variable} ${ebGaramond.variable} ${forum.variable} font-sans antialiased`}
      >
        <ClientProviders>
          {children}
          {/* Global Delivery Popup - Available on all pages */}
          <DeliveryPopup />
        </ClientProviders>
      </body>
    </html>
  );
}
