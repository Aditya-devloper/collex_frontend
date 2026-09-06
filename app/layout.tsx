import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { Toaster } from "sonner";
import Providers from "./providers";
import "./globals.css";
import StructuredData from "@/components/home/StructuredData";
import "react-phone-input-2/lib/style.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const siteUrl = "https://collexai.vercel.app"; // update to the real domain once live
const siteName = "Collex AI";
const title = "Collex AI — AI chatbot & follow-ups that never forget a lead";
const description =
  "Collex AI gives small sales teams an AI chatbot that captures leads automatically, tracks the pipeline, and reminds you to follow up  no more spreadsheet chaos.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s · Collex AI",
  },
  description,
  applicationName: siteName,
  keywords: [
    "AI lead management",
    "AI chatbot for business",
    "CRM for small business",
    "lead tracking software",
    "follow-up reminder app",
    "sales pipeline tool",
    "AI calling agent",
    "lead management India",
    "Collex AI",
  ],
  authors: [{ name: "Collex AI" }],
  creator: "Collex AI",
  publisher: "Collex AI",

  alternates: {
    canonical: "/",
  },

  icons: {
    icon: [
      { url: "/icon.png", type: "image/png", sizes: "192x192" },
      { url: "/favicon.ico", sizes: "48x48" },
    ],
    // apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.json",

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName,
    title,
    description,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Collex AI — AI chatbot and calling agent for small sales teams",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },

  category: "business software",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0d17",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body className={`${inter.className} antialiased`}>
        <StructuredData />
        <div className="ambient-glow" />
        <div className="noise-overlay" />
        <Providers>{children}</Providers>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
