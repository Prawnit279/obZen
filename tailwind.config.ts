import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        noir: {
          bg:      'var(--bg)',
          surface: 'var(--surface)',
          elevated:'var(--elevated)',
          border:  'var(--border)',
          strong:  'var(--border-strong)',
          dim:     'var(--dim)',
          muted:   'var(--muted)',
          accent:  'var(--accent)',
          white:   'var(--white)',
          red:     'var(--red)',
        },
        theme: {
          primary:      'var(--theme-primary)',
          secondary:    'var(--theme-secondary)',
          borderActive: 'var(--theme-border-active)',
          textActive:   'var(--theme-text-active)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        label: ['10px', { letterSpacing: '0.08em', lineHeight: '1.4' }],
        'label-sm': ['11px', { letterSpacing: '0.08em', lineHeight: '1.4' }],
        body: ['13px', { lineHeight: '1.6' }],
        'body-md': ['14px', { lineHeight: '1.6' }],
        heading: ['16px', { lineHeight: '1.3' }],
        'heading-lg': ['18px', { lineHeight: '1.3' }],
      },
      borderRadius: {
        DEFAULT: '2px',
        sm: '2px',
        md: '2px',
        lg: '2px',
      },
      borderWidth: {
        DEFAULT: '1px',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      screens: {
        xs: '375px',
      },
    },
  },
  plugins: [],
} satisfies Config
