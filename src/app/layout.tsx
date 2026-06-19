import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Stayora | Luxury Travel & Premium Boutique Booking",
  description:
    "Experience world-class luxury stays, private villas, and curated boutique hotels around the globe. Stayora offers exclusive booking services for the discerning traveler.",
  keywords: "luxury villa, hotel booking, premium stays, boutique travel, boutique resort, private jet, holiday booking",
  openGraph: {
    title: "Stayora | Luxury Travel & Premium Boutique Booking",
    description: "Experience world-class luxury stays and curated boutique hotels around the globe.",
    url: "https://stayora.com",
    siteName: "Stayora",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stayora | Luxury Travel",
    description: "Curated luxury stays for the discerning traveler.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${outfit.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-luxury-cream text-luxury-black dark:bg-emerald-deep dark:text-luxury-cream font-sans">
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
