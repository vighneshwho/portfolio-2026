import rawContent from '../data/portfolio.json' with { type: 'json' };
import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { portfolioSchema } from './schema';

const result = portfolioSchema.safeParse(rawContent);
if (!result.success) {
  const issues = result.error.issues.map((issue) => `  ${issue.path.join('.')}: ${issue.message}`).join('\n');
  throw new Error(`Please fix src/data/portfolio.json before building:\n${issues}`);
}

export const content = result.data;

// CDN assets are served directly. Catch missing local files while building.
function checkLocalAsset(value: string, field: string) {
  if (!value.startsWith('/')) return;
  const pathname = decodeURIComponent(new URL(value, 'https://assets.example.com').pathname);
  const file = resolve(process.cwd(), 'public', pathname.slice(1));
  if (!existsSync(file) || !statSync(file).isFile()) {
    throw new Error(`Missing local asset at ${field}: put ${pathname} inside public/ or supply a CDN URL.`);
  }
}

checkLocalAsset(content.site.socialImage, 'site.socialImage');
for (const key of ['video', 'poster', 'captions'] as const) checkLocalAsset(content.home.showreel[key], `home.showreel.${key}`);
for (const [index, company] of content.companies.entries()) checkLocalAsset(company.logo, `companies.${index}.logo`);
for (const [index, project] of content.projects.entries()) {
  checkLocalAsset(project.cover.src, `projects.${index}.cover.src`);
  if (project.externalOnly) continue;
  for (const key of ['video', 'poster', 'captions'] as const) checkLocalAsset(project.media[key], `projects.${index}.media.${key}`);
  for (const [imageIndex, image] of project.media.images.entries()) checkLocalAsset(image.src, `projects.${index}.media.images.${imageIndex}.src`);
}
