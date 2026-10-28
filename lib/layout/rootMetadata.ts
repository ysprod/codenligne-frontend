/**
 * Métadonnées racine — CODENLIGNE
 * CDC §15 : nom visible CODENLIGNE, logo, blanc dominant, aucun paiement.
 */
import type { Metadata } from "next";

const SITE = {
  name: "CODENLIGNE",
  url: process.env.NEXT_PUBLIC_BASE_URL || "https://www.codenligne.net",
  description:
    "Apprenez le code de la route à votre rythme. Cours structurés par thèmes, exercices QCM corrigés et suivi personnalisé de votre progression.",
  ogImage: "/logo.png",
  ogImageAlt: "CODENLIGNE — formation au code de la route",
  ogImageWidth: 512,
  ogImageHeight: 512,
  locale: "fr_FR",
} as const;

const faviconAnySize = "any";

export function getRootMetadata(): Metadata {
  return {
    metadataBase: new URL(SITE.url),

    title: {
      default: "CODENLIGNE — Formation au code de la route",
      template: "%s | CODENLIGNE",
    },

    description: SITE.description,

    applicationName: SITE.name,

    authors: [{ name: "CODENLIGNE" }],
    creator: "CODENLIGNE",
    publisher: "CODENLIGNE",

    // Le CDC impose un accès gratuit sur validation administrative : pas d'indexation
    // de tarifs, pas de page de paiement. On laisse l'indexation ouverte sur le public.
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },

    alternates: {
      canonical: "/",
    },

    openGraph: {
      type: "website",
      locale: SITE.locale,
      url: "/",
      siteName: SITE.name,
      title: "CODENLIGNE — Formation au code de la route",
      description: SITE.description,
      images: [
        {
          url: SITE.ogImage,
          width: SITE.ogImageWidth,
          height: SITE.ogImageHeight,
          alt: SITE.ogImageAlt,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: "CODENLIGNE — Formation au code de la route",
      description: SITE.description,
      images: [SITE.ogImage],
      // Pas de handle Twitter : aucun compte officiel CODENLIGNE n'est mentionné
      // dans le CDC. À ajouter plus tard si un compte est créé.
    },

    icons: {
      icon: [
        { url: "/favicon.ico", sizes: faviconAnySize },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
        { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
      // mask-icon en rouge CODENLIGNE (CDC §15 : #E00000)
      other: [{ rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#E00000" }],
    },

    manifest: "/site.webmanifest",

    appleWebApp: {
      capable: true,
      title: SITE.name,
      statusBarStyle: "default" as const,
    },

    formatDetection: {
      telephone: true,
      email: true,
      address: false,
    },

    other: {
      "mobile-web-app-capable": "yes",
      "apple-mobile-web-app-capable": "yes",
    },
  };
}