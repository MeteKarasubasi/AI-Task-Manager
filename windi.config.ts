import { defineConfig } from 'windicss/helpers'

export default defineConfig({
  extract: {
    include: ['src/**/*.{js,jsx,ts,tsx,vue}'],
  },
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F46E5',
          dark: '#4338CA',
        },
        secondary: {
          DEFAULT: '#10B981',
          dark: '#059669',
        },
        background: {
          light: '#F9FAFB',
          dark: '#1F2937',
        }
      }
    },
  },
}) 