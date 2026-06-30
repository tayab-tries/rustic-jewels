import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Rustic Jewels | Fine Handcrafted Jewellery Catalogue",
  description: "Browse our handpicked collection of exquisite artisan jewellery. Explore detailed product pages and contact us directly on Instagram for inquiries.",
  keywords: ["jewellery", "handmade jewelry", "luxury rings", "vintage necklaces", "instagram jewellery", "rustic jewels"],
  authors: [{ name: "Rustic Jewels" }],
  openGraph: {
    title: "Rustic Jewels | Fine Handcrafted Jewellery Catalogue",
    description: "Browse our handpicked collection of exquisite artisan jewellery.",
    type: "website",
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
      className={`${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-brand-charcoal text-brand-champagne selection:bg-gold-500 selection:text-brand-charcoal">
        {children}
      </body>
    </html>
  );
}
