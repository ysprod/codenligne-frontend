import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ─── IDENTITÉ CODENLIGNE ────────────────────────────
        // Blanc dominant, noir structurant, rouge pour les actions
        // Palette issue du CDC §15 : #FFFFFF / #111111 / #E00000 / #F5F5F5

        // Actions principales, sélection, CTA
        primary: {
          DEFAULT: '#E00000',
          light:   '#FF3333', // survol clair, à utiliser avec parcimonie
          dark:    '#B00000', // survol/pressed, contraste renforcé
        },

        // Structure : typographie, navigation, entêtes
        secondary: {
          DEFAULT: '#111111',
          light:   '#333333',
          dark:    '#000000',
        },

        // Alias conservé pour compatibilité des composants existants
        // (remplace l'ancien accent or/améthyste — ne pas réintroduire d'indigo)
        accent: {
          DEFAULT: '#E00000',
          light:   '#FF3333',
          dark:    '#B00000',
        },

        // Neutres : fonds, séparations, textes secondaires
        neutral: {
          50:  '#FFFFFF',
          100: '#F5F5F5', // gris clair CDC — séparations, cartes alternées
          200: '#EDEDED',
          300: '#DDDDDD',
          400: '#BBBBBB',
          500: '#888888',
          600: '#555555',
          700: '#333333',
          800: '#111111',
          900: '#000000',
        },

        // Surfaces sémantiques (fond de page, cartes, alternance)
        surface: {
          DEFAULT: '#FFFFFF', // fond principal
          alt:     '#F5F5F5', // sections alternées, cartes secondaires
        },

        // Bordures et séparateurs
        border: {
          DEFAULT: '#EDEDED',
          strong:  '#DDDDDD',
        },

        // Texte
        ink: {
          DEFAULT: '#111111', // texte principal
          soft:    '#333333', // texte secondaire
          muted:   '#555555', // légendes, métadonnées
          inverse: '#FFFFFF', // texte sur fond rouge/noir
        },

        // États (toujours accompagner d'un texte + icône, jamais couleur seule)
        state: {
          success: '#1A7F37',
          error:   '#E00000',
          warning: '#9A6700',
          info:    '#0A5C8A',
        },
      },

      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },

      fontSize: {
        // CDC §15 : texte courant ≥ 16 px sur mobile
        // Les tailles < 16 px sont réservées aux métadonnées non essentielles
        xs:   ['0.75rem',  { lineHeight: '1rem' }],      // 12px — usage restreint
        sm:   ['0.875rem', { lineHeight: '1.25rem' }],   // 14px — métadonnées
        base: ['1rem',     { lineHeight: '1.5rem' }],    // 16px — minimum courant mobile
        lg:   ['1.125rem', { lineHeight: '1.75rem' }],   // 18px — corps confortable
        xl:   ['1.25rem',  { lineHeight: '1.75rem' }],
        '2xl':['1.5rem',   { lineHeight: '2rem' }],
        '3xl':['1.875rem', { lineHeight: '2.25rem' }],
        '4xl':['2.25rem',  { lineHeight: '2.5rem' }],
        '5xl':['3rem',     { lineHeight: '1.1' }],
        '6xl':['3.75rem',  { lineHeight: '1.1' }],
      },

      spacing: {
        // Zones tactiles minimales CDC §15 (44 × 44 px)
        touch:   '2.75rem', // 44px
        'touch-y': '2.75rem',
        'touch-x': '2.75rem',
      },

      minHeight: {
        touch: '2.75rem', // 44px
      },

      minWidth: {
        touch: '2.75rem', // 44px
      },

      borderRadius: {
        // Sobre, moderne, aéré — pas de "pill" systématique
        sm:  '0.25rem',
        DEFAULT: '0.375rem',
        md:  '0.5rem',
        lg:  '0.75rem',
        xl:  '1rem',
      },

      boxShadow: {
        // Ombres discrètes pour cartes et focus
        card:  '0 1px 2px 0 rgba(17, 17, 17, 0.05), 0 1px 3px 0 rgba(17, 17, 17, 0.06)',
        focus: '0 0 0 3px rgba(224, 0, 0, 0.35)',
      },

      ringColor: {
        DEFAULT: '#E00000',
      },

      ringOffsetColor: {
        DEFAULT: '#FFFFFF',
      },

      outlineColor: {
        DEFAULT: '#E00000',
      },

      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },

      // Suppression des fonds dégradés identitaires (indigo/améthyste/or)
      // Si tu veux un fond d'ambiance, utilise bg-surface ou bg-surface-alt.
      backgroundImage: {
        'hero-fade': 'linear-gradient(180deg, #FFFFFF 0%, #F5F5F5 100%)',
      },
    },
  },
  plugins: [],
};

export default config;