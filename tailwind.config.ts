import colors from 'tailwindcss/colors';
import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/pages/**/*.tsx', './src/components/**/*.tsx'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        inter: ['var(--font-inter)']
      },
      colors: {
        accent: {
          main: colors.blue[500],
          start: colors.blue[600],
          end: colors.cyan[400]
        }
      }
    }
  },
  plugins: [typography]
} satisfies Config;
