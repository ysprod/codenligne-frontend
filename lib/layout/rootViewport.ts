import type { Viewport } from "next";

/**
 * Viewport — CODENLIGNE
 * CDC §15 : thème clair uniquement, mobile-first (360, 390, 768, 1440 px),
 * zones tactiles ≥ 44 × 44 px, texte courant ≥ 16 px sur mobile.
 */
export const rootViewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // minimumScale volontairement retiré : les navigateurs mobiles modernes
  // l'ignorent de toute façon, et le laisser à 1 gêne le zoom accessibilité.
  maximumScale: 5,        // zoom autorisé pour l'accessibilité (WCAG 1.4.4)
  userScalable: true,
  viewportFit: "cover",
  // Thème clair uniquement (CDC §15 : blanc dominant, noir, rouge).
  // La palette sombre n'est pas prévue pour cette version.
  colorScheme: "light",
  themeColor: "#FFFFFF", // fond blanc dominant
  interactiveWidget: "resizes-visual",
};