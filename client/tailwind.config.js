import typography from '@tailwindcss/typography';

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        rose: {
          50: '#fff1f2',
          100: '#ffe4e6',
          300: '#fda4af',
          500: '#ec4899',
          700: '#be185d'
        },
        champagne: '#f8ede4',
        cream: '#fff9f6',
        luxury: '#362f2a'
      },
      boxShadow: {
        glass: '0 20px 50px rgba(116, 67, 153, 0.18)'
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Poppins', 'sans-serif']
      }
    }
  },
  plugins: [typography]
};
