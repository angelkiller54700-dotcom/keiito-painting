import type { Metadata } from "next";
import "./globals.css";
import { sans, display, brush } from "@/fonts";
import { getSiteSettings } from "@/lib/settings";
import { SITE_URL } from "@/lib/env";

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getSiteSettings();
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: seo.defaultTitle,
      template: `%s | ${seo.siteName}`,
    },
    description: seo.defaultDescription,
    applicationName: seo.siteName,
    keywords: [
      "peinture figurines",
      "Warhammer 40K",
      "Age of Sigmar",
      "peintre miniatures",
      "commission painting",
      "Keiito Painting",
    ],
    openGraph: {
      type: "website",
      locale: "fr_FR",
      siteName: seo.siteName,
      title: seo.defaultTitle,
      description: seo.defaultDescription,
      url: SITE_URL,
    },
    twitter: {
      card: "summary_large_image",
      title: seo.defaultTitle,
      description: seo.defaultDescription,
    },
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${sans.variable} ${display.variable} ${brush.variable}`}>
      <body>{children}</body>
    </html>
  );
}
