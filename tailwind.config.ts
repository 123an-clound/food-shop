import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        burgundy: '#7A1F2B',
        gold: '#C9A24B',
        charcoal: '#1C1A17',
        ivory: '#F5F0E6',
      },
      fontFamily: {
        heading: ['var(--font-playfair)', 'serif'],
        body: ['var(--font-be-vietnam-pro)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
