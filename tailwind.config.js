/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(79,70,229,0.2)' },
          '50%': { boxShadow: '0 0 25px rgba(79,70,229,0.5)' },
        },
        skeletonPattern: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' }
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'slide-up': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pop-in': 'popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'pulse-glow': 'pulseGlow 2s infinite',
        'skeleton': 'skeletonPattern 1.5s infinite linear',
      },
    },
  },
  plugins: [],
}