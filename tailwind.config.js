/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './js/**/*.js'],
  theme: {
    extend: {
      colors: {
        // Never overridden anywhere — base canvas of the whole site
        charcoal: '#0A0A0E',
        neon: {
          DEFAULT: '#FF1493',
          deep: '#FF007F',
        },
        baby: '#FFB6C1',
        aqua: '#22D3EE',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        script: ['Caveat', 'ui-rounded', 'cursive'],
        mono: ['"Fira Code"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        'neon-pink': '0 0 24px rgba(255, 20, 147, 0.45), 0 0 60px rgba(255, 20, 147, 0.18)',
        'neon-cyan': '0 0 24px rgba(34, 211, 238, 0.4), 0 0 60px rgba(34, 211, 238, 0.15)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.37)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translate3d(0,0,0)' },
          '100%': { transform: 'translate3d(-50%,0,0)' },
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        marquee: 'marquee 48s linear infinite',
        'marquee-rev': 'marquee 60s linear infinite reverse',
        floaty: 'floaty 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
