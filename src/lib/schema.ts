import { z } from 'zod';

const text = z.string().trim().min(1);
const httpUrl = z.url().refine((value) => /^https?:\/\//i.test(value), 'Use an http or https URL.');
const optionalUrl = z.union([httpUrl, z.literal('')]);
const asset = z.string().trim().refine(
  (value) => {
    if (value === '' || /^\/(?!\/)/.test(value)) return true;
    try {
      const url = new URL(value);
      return ['http:', 'https:'].includes(url.protocol) && Boolean(url.hostname);
    } catch {
      return false;
    }
  },
  'Use a full CDN URL or a local path starting with /.',
);

const imageSchema = z.object({
  src: asset,
  alt: text,
  caption: z.string().optional(),
  width: z.number().int().positive().default(1440),
  height: z.number().int().positive().default(960),
});

export const mediaSchema = z.object({
  video: asset.default(''),
  poster: asset.default(''),
  captions: asset.default(''),
  images: z.array(imageSchema.extend({ src: asset.refine((value) => value !== '', 'An image needs a source URL.') })).default([]),
}).default({ video: '', poster: '', captions: '', images: [] });

const projectSchema = z.object({
  id: text.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use a lowercase, hyphenated project ID.'),
  title: text,
  description: text,
  cover: imageSchema,
  visitUrl: optionalUrl.default(''),
  externalOnly: z.boolean().default(false),
  seo: z.object({ title: z.string().default(''), description: z.string().default('') }).default({ title: '', description: '' }),
  media: mediaSchema,
  content: z.array(z.object({ heading: text, paragraphs: z.array(text).min(1) })).default([]),
}).superRefine((project, context) => {
  if (project.externalOnly && !project.visitUrl) {
    context.addIssue({ code: 'custom', path: ['visitUrl'], message: 'An external-only project needs a visit URL.' });
  }
  if (!project.externalOnly && project.content.length === 0) {
    context.addIssue({ code: 'custom', path: ['content'], message: 'Add a writeup for the detail page, or set externalOnly to true.' });
  }
});

export const portfolioSchema = z.object({
  site: z.object({
    name: text,
    url: httpUrl,
    title: text,
    description: text,
    socialImage: asset.default(''),
    navigation: z.object({ info: text, work: text, contact: text }),
    labels: z.object({ home: text, backToWork: text, visitProject: text, projectPlaceholder: text, notFoundTitle: text, notFoundDescription: text }),
  }),
  home: z.object({
    showreel: z.object({ video: asset, poster: asset, captions: asset.default(''), label: text, placeholder: text }),
    heading: text,
    blurb: text,
    companiesLabel: text,
  }),
  works: z.object({
    heading: text,
    description: text,
  }),
  companies: z.array(z.object({ name: text, icon: z.enum(['coffee', 'waveform', 'link', 'spark']).optional(), logo: asset.default(''), url: optionalUrl.default('') })),
  projects: z.array(projectSchema).superRefine((projects, context) => {
    const seen = new Set<string>();
    for (const [index, project] of projects.entries()) {
      if (seen.has(project.id) || ['404', 'index', 'robots', 'sitemap', 'sitemap-index', 'sitemap-0'].includes(project.id)) {
        context.addIssue({ code: 'custom', path: [index, 'id'], message: 'Project IDs must be unique and cannot use a reserved page name.' });
      }
      seen.add(project.id);
    }
  }),
  contact: z.object({
    handle: text,
    email: z.email(),
  }),
});

export type Portfolio = z.infer<typeof portfolioSchema>;
export type Project = Portfolio['projects'][number];
export type ProjectMedia = z.infer<typeof mediaSchema>;

/** A poster or a homepage cover alone is not detail-page media. */
export function selectProjectMedia(media: ProjectMedia) {
  if (media.video.trim()) return { type: 'video' as const, video: media.video, poster: media.poster, captions: media.captions };
  if (media.images.length) return { type: 'images' as const, images: media.images };
  return null;
}
