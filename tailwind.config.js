module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    screens: {
      'mobile': '300px',
      'tablet': '768px',
      'laptop': '1024px',
      'desktop': '1440px',
    },
    fontSize: {
      xs: '0.75rem',
      base: '1rem',
      xl: '1.25rem',
      '2xl': ['1.5rem', {
        lineHeight: '1.5rem',
        letterSpacing: '-0.01em',
        fontWeight: '500',
      }],
      '3xl': ['1.875rem', {
        lineHeight: '1.875rem',
        letterSpacing: '-0.02em',
        fontWeight: '700',
      }],
    },
    extend: {
      colors: {
        'ulk-green': '#8fbc8f',
      },
    },
  },
  plugins: [],
}
