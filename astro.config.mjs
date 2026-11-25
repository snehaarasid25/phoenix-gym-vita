// @ts-check
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

// ⚠️ Keep in sync with `site.url` in src/config/site.ts (used for canonical URLs + sitemap)
// Temporary Netlify address; switch to the real domain (e.g. https://www.phoenixgymvita.in) once bought
const SITE_URL = 'https://phoenixgymvita.netlify.app'

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  // Pages are emitted as /privacy/index.html → clean URLs on every static host
  trailingSlash: 'ignore',
  integrations: [
    // React is used only for interactive islands; everything else ships as plain HTML
    react(),
    sitemap({ filter: (page) => !page.includes('/404') && !page.includes('/admin') }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  prefetch: true,
  // The floating Astro dev toolbar overlapped the hero while previewing
  devToolbar: { enabled: false },
})
