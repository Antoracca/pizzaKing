import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1.5rem',
        xs: '1.75rem',
        sm: '2rem',
        md: '2.5rem',
        lg: '3rem',
        xl: '3.5rem',
        '2xl': '4rem',
      },
      screens: {
        xs: '540px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1400px',
        '3xl': '1600px',
        '4xl': '1920px',
      },
    },
    screens: {
      xs: '480px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1440px',
      '3xl': '1680px',
      '4xl': '1920px',
    },
    extend: {
      screens: {
        short: { raw: '(max-height: 700px)' },
        tall: { raw: '(min-height: 900px)' },
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      fontFamily: {
        sans: ['"Inter"', ...defaultTheme.fontFamily.sans],
        display: ['"Inter"', ...defaultTheme.fontFamily.sans],
        mono: [...defaultTheme.fontFamily.mono],
      },
      fontSize: {
        'fluid-xs': [
          'clamp(0.75rem, 0.7rem + 0.1vw, 0.875rem)',
          { lineHeight: '1.45' },
        ],
        'fluid-sm': [
          'clamp(0.875rem, 0.8rem + 0.2vw, 1rem)',
          { lineHeight: '1.6' },
        ],
        'fluid-base': [
          'clamp(1rem, 0.9rem + 0.3vw, 1.25rem)',
          { lineHeight: '1.65' },
        ],
        'fluid-lg': [
          'clamp(1.125rem, 1rem + 0.45vw, 1.5rem)',
          { lineHeight: '1.7' },
        ],
        'fluid-xl': [
          'clamp(1.25rem, 1.1rem + 0.7vw, 1.875rem)',
          { lineHeight: '1.2' },
        ],
        'fluid-2xl': [
          'clamp(1.5rem, 1.2rem + 1vw, 2.25rem)',
          { lineHeight: '1.15' },
        ],
      },
      spacing: {
        15: '3.75rem',
        18: '4.5rem',
        22: '5.5rem',
        26: '6.5rem',
        30: '7.5rem',
        34: '8.5rem',
        38: '9.5rem',
      },
      maxWidth: {
        'screen-3xl': '1600px',
        'screen-4xl': '1920px',
        readable: '72ch',
      },
      minHeight: {
        screen: '100vh',
        'screen-dynamic': '100dvh',
      },
      lineHeight: {
        'tight-plus': '1.2',
        relaxed: '1.75',
      },
      boxShadow: {
        'soft-lg': '0 24px 50px -25px rgba(15, 23, 42, 0.35)',
        glow: '0 0 0 3px rgba(248, 113, 113, 0.25)',
      },
      aspectRatio: {
        square: '1 / 1',
        '4/3': '4 / 3',
        '3/2': '3 / 2',
        hero: '5 / 2',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        'in-expo': 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
      },
      transitionDuration: {
        0: '0ms',
        2000: '2000ms',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      typography: ({ theme }) => {
        const fluid2xl = theme('fontSize.fluid-2xl') as [
          string,
          { lineHeight: string },
        ];
        const fluidXl = theme('fontSize.fluid-xl') as [
          string,
          { lineHeight: string },
        ];
        const fluidLg = theme('fontSize.fluid-lg') as [
          string,
          { lineHeight: string },
        ];

        return {
          DEFAULT: {
            css: {
              color: theme('colors.foreground'),
              maxWidth: theme('maxWidth.readable'),
              a: {
                color: theme('colors.primary.DEFAULT'),
                textDecoration: 'none',
                fontWeight: '600',
                transition: `color ${theme('transitionDuration.200')} ${theme('transitionTimingFunction.smooth')}`,
                '&:hover': {
                  color: theme('colors.primary.foreground'),
                },
              },
              h1: {
                fontSize: fluid2xl[0],
                lineHeight: fluid2xl[1].lineHeight,
                fontWeight: '700',
              },
              h2: {
                fontSize: fluidXl[0],
                lineHeight: fluidXl[1].lineHeight,
                fontWeight: '700',
              },
              h3: {
                fontSize: fluidLg[0],
                lineHeight: fluidLg[1].lineHeight,
                fontWeight: '600',
              },
              img: {
                borderRadius: theme('borderRadius.lg'),
              },
            },
          },
          invert: {
            css: {
              a: {
                color: theme('colors.primary.foreground'),
                '&:hover': {
                  color: theme('colors.primary.DEFAULT'),
                },
              },
            },
          },
        };
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
