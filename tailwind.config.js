import defaultTheme from 'tailwindcss/defaultTheme'

const spacing = Object.fromEntries(
  Object.entries(defaultTheme.spacing).filter(([k]) => !['1.5', '2.5', '3.5'].includes(k))
)
const c = v => `rgb(var(--${v}) / <alpha-value>)`

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    spacing,
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.75rem', { lineHeight: '2rem' }],
      '4xl': ['2.5rem', { lineHeight: '1.1' }],
      display: ['3.5rem', { lineHeight: '1.05' }],
    },
    extend: {
      colors: {
        ink: c('bg'),
        panel: c('surface-1'),
        line: c('border'),
        accent: c('accent'),
        white: c('fg'),
        zinc: {
          100: c('fg'),
          300: c('fg-2'),
          400: c('fg-3'),
          500: c('fg-4'),
          600: c('fg-5'),
        },
        amber: { 300: c('warning-soft'), 400: c('warning') },
        red: { 300: c('danger-soft'), 400: c('danger') },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },

      borderRadius: {
        DEFAULT: '6px',
        lg: '8px',
        xl: '12px',
        '2xl': '16px',
        '3xl': '20px',
      },

      fontWeight: { bold: '600' },
    },
  },
  plugins: [],
}
