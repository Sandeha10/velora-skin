/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        velora: {
          canvas: '#F7F7F4',      // Soft linen / stone canvas
          surface: '#FFFFFF',     // Clean card white
          primary: '#1C1917',     // Deep charcoal typography
          muted: '#78716C',       // Warm stone secondary text
          border: '#E7E5E4',      // Ultra-subtle divider
          emerald: '#064E3B',     // Deep botanical green accent
          olive: '#2D3B2D',       // Secondary muted botanical
          gold: '#B45309',        // Warm amber / gold detail
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'sans-serif'],
      },
      letterSpacing: {
        editorial: '0.25em',
        luxury: '0.15em',
      }
    },
  },
  plugins: [],
}