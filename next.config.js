/** @type {import('next').NextConfig} */
const crypto = require('crypto');

function getApiUploadPattern() {
  const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:3001';

  try {
    const parsed = new URL(rawApiUrl);
    return {
      protocol: parsed.protocol.replace(':', ''),
      hostname: parsed.hostname,
      port: parsed.port,
      pathname: '/uploads/**',
    };
  } catch {
    return null;
  }
}

const apiUploadPattern = getApiUploadPattern();

const nextConfig = {
    // Image Docker légère : sortie autonome (.next/standalone + server.js)
    output: 'standalone',
    // Cache busting : buildId unique à chaque build
    generateBuildId: async () => {
      return crypto.randomBytes(8).toString('hex');
    },
  reactStrictMode: true,

  // ─── Proxy /api/v1/* vers le backend NestJS ───────────────────────────────
  // En dev, le cookie est posé par le backend sur localhost:3001 (cross-origin).
  // Les requêtes Axios/fetch depuis localhost:3000 ne l'envoient pas en SameSite=Lax.
  // Ce proxy fait transiter les requêtes API via le même domaine → cookie toujours envoyé.
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendUrl}/api/v1/:path*`,
      },
    ];
  },

  images: {
    remotePatterns: [
      ...(apiUploadPattern ? [apiUploadPattern] : []),
      // Autorise aussi les images sur /api/v1/uploads/** pour localhost:3001
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/api/v1/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'monetoile.org',
        port: '',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'www.genspark.ai',
        port: '',
        pathname: '/api/files/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        port: '',
        pathname: '/vi/**',
      },
      // Autorise placehold.co pour next/image
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 an de cache pour les images optimisées
  },
  
  // Headers de sécurité + cache optimisés
  async headers() {
    // En-têtes de sécurité appliqués à toutes les routes
    const securityHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-XSS-Protection', value: '1; mode=block' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      { key: 'X-DNS-Prefetch-Control', value: 'on' },
    ];

    return [
      // Sécurité globale sur toutes les routes
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      // Cache immutable pour les assets statiques Next.js
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Cache immutable pour les fichiers statiques
      {
        source: '/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Cache immutable pour les images
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Pas de cache pour les routes API
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
        ],
      },
      // Revalidation rapide pour les pages HTML (ISR-like)
      {
        source: '/:path((?!_next|static|api)[^.]*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, s-maxage=60, stale-while-revalidate=120' },
        ],
      },
    ];
  },
  
  // Experimental features pour performances
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'recharts', 'date-fns', '@react-pdf/renderer'],
  },
}

module.exports = nextConfig