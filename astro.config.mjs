// @ts-check
import { defineConfig } from 'astro/config'
import cloudflare from '@astrojs/cloudflare'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Descomentar la configuración de cloudflare cuando se despliegue y se requiera (ej. para SSR o imageService)
  // adapter: cloudflare({
  //   imageService: 'cloudflare',
  // }),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
})