/**
 * Phoenix Professional — Design System
 * --------------------------------------------------------------
 * NOTA: Este proyecto usa Tailwind CSS v4. La fuente de verdad de
 * los tokens vive en `src/index.css` dentro del bloque `@theme`.
 * Este archivo es un ESPEJO para documentación y compatibilidad
 * con herramientas (IntelliSense, plugins, linters). Mantener
 * ambos sincronizados.
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary — Deep Navy Blue
        primary: {
          DEFAULT: '#0f2a44',
          container: '#0f2a44',
          soft: '#1e3a5f',
          on: '#ffffff',
          'on-container': '#76849f',
          fixed: '#d6e3ff',
          'fixed-dim': '#b9c7e4',
        },
        // Secondary — Vibrant Orange
        secondary: {
          DEFAULT: '#fe9511',
          deep: '#9d4300',
          on: '#ffffff',
          'fixed-dim': '#ffb690',
        },
        // Acento dorado premium
        gold: {
          DEFAULT: '#fec627',
          soft: '#e7c873',
        },
        // Superficies
        background: '#f9f9ff',
        surface: {
          DEFAULT: '#ffffff',
          soft: '#f8f9fa',
          variant: '#dce2f3',
          'container-lowest': '#ffffff',
          'container-low': '#f0f3ff',
          container: '#e7eefe',
          'container-high': '#e2e8f8',
          'container-highest': '#dce2f3',
        },
        // Texto
        'on-surface': '#151c27',
        'on-surface-variant': '#44474d',
        outline: { DEFAULT: '#75777e', variant: '#c5c6cd' },
        // Estados
        error: { DEFAULT: '#ba1a1a', container: '#ffdad6', 'on-container': '#93000a' },
        success: '#1b7d3f',
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['34px', { lineHeight: '40px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-xl': ['28px', { lineHeight: '34px', letterSpacing: '-0.015em', fontWeight: '700' }],
        'headline-lg': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'headline-md': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'title': ['17px', { lineHeight: '24px', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '26px', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '22px', fontWeight: '400' }],
        'label-lg': ['14px', { lineHeight: '18px', fontWeight: '600' }],
        'label-sm': ['12px', { lineHeight: '16px', fontWeight: '500' }],
      },
      borderRadius: {
        sm: '0.5rem',
        md: '0.75rem',
        lg: '1rem',      // botones/inputs
        xl: '1.25rem',
        '2xl': '1.5rem', // tarjetas
        '3xl': '1.75rem',// hero cards
        full: '9999px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(10,25,47,0.04), 0 1px 2px rgba(10,25,47,0.03)',
        elevated: '0 8px 24px -6px rgba(10,25,47,0.12), 0 2px 6px -2px rgba(10,25,47,0.06)',
        hero: '0 20px 40px -12px rgba(10,25,47,0.35)',
      },
      spacing: {
        'margin-mobile': '20px',
        gutter: '16px',
        'stack-sm': '12px',
        'stack-md': '24px',
        'stack-lg': '40px',
      },
    },
  },
  plugins: [],
}
