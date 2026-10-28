import { getRootMetadata } from "@/lib/layout/rootMetadata";
import { rootViewport } from "@/lib/layout/rootViewport";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { memo } from "react";
import { Providers, RootPortals, RootSkipLink } from "./providers";
import "./globals.css";

// ============================================================================
// CONSTANTES & CONFIGURATION
// ============================================================================

const SITE_CONFIG = {
  name: "CODENLIGNE",
  url: "https://www.codenligne.net",
  description:
    "Apprenez le code de la route à votre rythme. Cours structurés par thèmes, exercices QCM corrigés et suivi personnalisé de votre progression.",
  ogImage: "/logo.png",
  ogImageAlt: "CODENLIGNE — formation au code de la route",
  ogImageWidth: 512,
  ogImageHeight: 512,
} as const;

// ============================================================================
// FONTS
// ============================================================================

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
  adjustFontFallback: true,
  weight: ["400", "500", "700"],
  fallback: [
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "Oxygen",
    "Ubuntu",
    "Cantarell",
    "Helvetica Neue",
    "Arial",
    "sans-serif",
  ],
});

// ============================================================================
// COMPOSANTS MÉMOÏSÉS POUR LES MÉTA-DONNÉES
// ============================================================================

const RootHeadMeta = memo(function RootHeadMeta() {
  return (
    <>
      {/* PWA / Mobile */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="application-name" content={SITE_CONFIG.name} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_CONFIG.name} />
      <meta property="og:title" content="CODENLIGNE — Formation au code de la route" />
      <meta property="og:description" content={SITE_CONFIG.description} />
      <meta property="og:url" content={SITE_CONFIG.url} />
      <meta property="og:image" content={SITE_CONFIG.ogImage} />
      <meta property="og:image:alt" content={SITE_CONFIG.ogImageAlt} />
      <meta property="og:image:width" content={SITE_CONFIG.ogImageWidth.toString()} />
      <meta property="og:image:height" content={SITE_CONFIG.ogImageHeight.toString()} />
      <meta property="og:locale" content="fr_FR" />

      {/* Twitter Card — pas de handle CODENLIGNE pour l'instant */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="CODENLIGNE — Formation au code de la route" />
      <meta name="twitter:description" content={SITE_CONFIG.description} />
      <meta name="twitter:image" content={SITE_CONFIG.ogImage} />
      <meta name="twitter:image:alt" content={SITE_CONFIG.ogImageAlt} />
    </>
  );
});

RootHeadMeta.displayName = "RootHeadMeta";

// ============================================================================
// SCRIPTS OPTIMISÉS
// ============================================================================

/**
 * Force le thème clair côté client.
 * Le CDC §15 impose blanc dominant ; le mode sombre n'est pas prévu.
 * On neutralise explicitement toute classe `dark` résiduelle (héritée
 * d'un éventuel next-themes ou d'une préférence navigateur).
 */
const ThemeScript = memo(function ThemeScript() {
  return (
    <script
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              var root = document.documentElement;
              root.classList.remove('dark');
              root.style.colorScheme = 'light';
            } catch (e) {}
          })();
        `,
      }}
    />
  );
});

ThemeScript.displayName = "ThemeScript";

/**
 * JSON-LD Schema.org — CODENLIGNE
 * On décrit un site éducatif (EducationalOrganization) plutôt qu'une organisation
 * spirituelle. Pas de `sameAs` tant qu'aucun compte officiel n'existe.
 */
const SchemaScript = memo(function SchemaScript() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_CONFIG.url}/#website`,
        name: SITE_CONFIG.name,
        url: SITE_CONFIG.url,
        description: SITE_CONFIG.description,
        inLanguage: "fr-FR",
      },
      {
        "@type": "EducationalOrganization",
        "@id": `${SITE_CONFIG.url}/#organization`,
        name: SITE_CONFIG.name,
        url: SITE_CONFIG.url,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_CONFIG.url}/logo.png`,
          width: 512,
          height: 512,
        },
        areaServed: {
          "@type": "Country",
          name: "Côte d'Ivoire",
        },
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          availableLanguage: ["French"],
        },
      },
      {
        "@type": "WebPage",
        "@id": `${SITE_CONFIG.url}/#webpage`,
        url: SITE_CONFIG.url,
        name: "CODENLIGNE — Formation au code de la route",
        description: SITE_CONFIG.description,
        isPartOf: { "@id": `${SITE_CONFIG.url}/#website` },
        about: { "@id": `${SITE_CONFIG.url}/#organization` },
        inLanguage: "fr-FR",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
});

SchemaScript.displayName = "SchemaScript";

// ============================================================================
// COMPOSANT PRINCIPAL LAYOUT
// ============================================================================

const RootMain = memo(function RootMain({ children }: { children: React.ReactNode }) {
  return (
    <main
      id="main-content"
      className="relative"
      role="main"
      aria-label="CODENLIGNE"
    >
      {children}
    </main>
  );
});

RootMain.displayName = "RootMain";

export const metadata: Metadata = getRootMetadata();
export const viewport = rootViewport;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Palette neutre : fond blanc, texte noir, sélection rouge discrète.
  const bodyClasses = [
    inter.className,
    "antialiased",
    "bg-white",
    "text-ink",
    "selection:bg-primary/15",
    "selection:text-ink",
  ].join(" ");

  return (
    <html lang="fr" className={inter.variable} suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        {/*
          TODO : remplacer par la vraie balise de vérification Google Search Console
          une fois le domaine www.codenligne.net enregistré.
          L'ancienne valeur (Mon Étoile) est retirée.
        */}
        {/* <meta name="google-site-verification" content="..." /> */}

        <RootHeadMeta />
        <ThemeScript />
        <SchemaScript />
      </head>

      <body className={bodyClasses} suppressHydrationWarning>
        <RootSkipLink />
        <Providers>
          <RootMain>{children}</RootMain>
        </Providers>
        <RootPortals />
      </body>
    </html>
  );
}