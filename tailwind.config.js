const c = v => `rgb(var(--${v}) / <alpha-value>)`

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: c('bg'),          // latar halaman
        panel: c('surface-1'), // kartu / panel
        line: c('border'),     // pemisah 1px
        accent: c('accent'),   // lime identitas
        white: c('fg'),        // "putih" mengikuti tema (teks / overlay tipis)
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
      // Skala radius: tag -> kontrol -> blok -> kartu -> hero
      borderRadius: {
        DEFAULT: '6px',
        lg: '8px',
        xl: '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
      // Hanya weight 400 / 500 / 600 yang dimuat
      fontWeight: { bold: '600' },
    },
  },
  plugins: [],
}
