import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import content from './src/data/portfolio.json' with { type: 'json' };

export default defineConfig({
  site: process.env.SITE_URL || content.site.url,
  base: process.env.BASE_PATH || '/',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
  integrations: [sitemap()],
});
