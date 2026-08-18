/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#F5F6F8', 100: '#E8EAEE', 200: '#D3D7DE', 300: '#AEB4C0',
          400: '#7C8698', 500: '#565F72', 600: '#3C4457', 700: '#2A3040',
          800: '#1B1F2B', 900: '#101422',
        },
        brand: {
          50: '#EEF2FB', 100: '#D7E1F5', 200: '#AFC3EB', 300: '#83A2DD',
          400: '#5B84CE', 500: '#2B4C7E', 600: '#233F6A', 700: '#1B3155',
          800: '#152643', 900: '#0F1B30',
        },
        success: { 50: '#E9F9F1', 100: '#C8F0DC', 400: '#34B879', 500: '#1F9D6C', 600: '#187E56' },
        warning: { 50: '#FBF3E4', 100: '#F5E1B8', 400: '#EFB84C', 500: '#E2A63B', 600: '#BD862A' },
        danger: { 50: '#FCEBEC', 100: '#F7CBCE', 400: '#E8636B', 500: '#D8404A', 600: '#B4313A' },
        paper: '#F7F8FA',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16, 20, 34, 0.04), 0 1px 8px rgba(16, 20, 34, 0.06)',
      },
      borderRadius: { xl2: '1rem' },
    },
  },
  plugins: [],
};
