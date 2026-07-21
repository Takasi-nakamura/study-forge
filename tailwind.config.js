/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ベース：純黒ではなく僅かに青みを帯びた深い黒（画面が締まりすぎないように）
        ink: {
          950: '#08090c',
          900: '#0d0f14',
          850: '#12151b',
          800: '#181c24',
          700: '#22272f',
          600: '#333a45',
          500: '#4a525f',
        },
        mist: {
          400: '#6b7280',
          300: '#9aa2b1',
          200: '#c4c9d4',
          100: '#e7e9ee',
        },
        // アクセント：定番の緑/赤/オレンジを避け、深い電光シアン一色に絞る
        signal: {
          600: '#0891a8',
          500: '#14b8cf',
          400: '#3dd6e8',
          300: '#7ee6f2',
          glow: 'rgba(20, 184, 207, 0.35)',
        },
        warn: '#e0954a',
        danger: '#e0596a',
      },
      fontFamily: {
        display: ['"Zen Kaku Gothic New"', '"Space Grotesk"', 'sans-serif'],
        body: ['"Noto Sans JP"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(20,184,207,0.15), 0 0 24px rgba(20,184,207,0.18)',
        card: '0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 24px rgba(0,0,0,0.35)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        pulseRing: {
          '0%': { transform: 'scale(0.9)', opacity: '0.6' },
          '80%, 100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        pulseRing: 'pulseRing 2.4s cubic-bezier(0.4,0,0.6,1) infinite',
        fadeUp: 'fadeUp 0.4s ease-out both',
      },
    },
  },
  plugins: [],
}
