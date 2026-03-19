import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'deep-navy': '#0A192F',
        'navy-light': '#112240',
        'premium-gold': '#D4AF37',
        'gold-light': '#F3E5AB',
      },
    },
  },
  plugins: [],
}
export default config
