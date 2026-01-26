// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Wormhole-inspired gradient colors
        'wh-primary-start': '#6F4FF2',
        'wh-primary-end': '#3B82F6',
        
        // Background colors
        'wh-bg-dark': '#0A0A0F',
        'wh-bg-card': '#151520',
        'wh-bg-card-hover': '#1A1A27',
        'wh-bg-input': '#0D0D14',
        
        // Text colors
        'wh-text-primary': '#FFFFFF',
        'wh-text-secondary': '#9CA3AF',
        'wh-text-muted': '#6B7280',
        
        // Chain colors
        'chain-ethereum': '#627EEA',
        'chain-polygon': '#8247E5',
        'chain-arbitrum': '#28A0F0',
        'chain-solana': '#14F195',
        
        // Protocol colors
        'protocol-aave': '#B6509E',
        'protocol-solend': '#14F195',
        'protocol-compound': '#00D395',
        
        // Status colors
        'success': '#10B981',
        'warning': '#F59E0B',
        'danger': '#EF4444',
        'info': '#3B82F6',
      },
      backgroundImage: {
        'wh-gradient': 'linear-gradient(135deg, #6F4FF2 0%, #3B82F6 100%)',
        'wh-gradient-hover': 'linear-gradient(135deg, #7F5FF2 0%, #4B92F6 100%)',
        'card-gradient': 'linear-gradient(180deg, rgba(111, 79, 242, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(111, 79, 242, 0.3)',
        'glow-md': '0 0 20px rgba(111, 79, 242, 0.4)',
        'glow-lg': '0 0 30px rgba(111, 79, 242, 0.5)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
      },
      borderRadius: {
        'wh': '12px',
        'wh-lg': '16px',
        'wh-xl': '24px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(111, 79, 242, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(111, 79, 242, 0.6)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
    },
  },
  plugins: [],
}