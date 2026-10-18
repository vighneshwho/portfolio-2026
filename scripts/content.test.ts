import test from 'node:test';
import assert from 'node:assert/strict';
import rawContent from '../src/data/portfolio.json' with { type: 'json' };
import { portfolioSchema, mediaSchema, selectProjectMedia } from '../src/lib/schema.ts';

test('the starter content is valid', () => {
  assert.equal(portfolioSchema.safeParse(rawContent).success, true);
});

test('no media produces no detail media, even with a poster', () => {
  assert.equal(selectProjectMedia(mediaSchema.parse({})), null);
  assert.equal(selectProjectMedia(mediaSchema.parse({ poster: 'https://cdn.example.com/poster.jpg' })), null);
});

test('video takes preference when both video and images are configured', () => {
  const selected = selectProjectMedia(mediaSchema.parse({
    video: 'https://cdn.example.com/reel.mp4',
    images: [{ src: 'https://cdn.example.com/image.jpg', alt: 'An image' }],
  }));
  assert.equal(selected?.type, 'video');
  assert.equal(selected && 'video' in selected ? selected.video : null, 'https://cdn.example.com/reel.mp4');
});

test('images are selected when there is no video', () => {
  const selected = selectProjectMedia(mediaSchema.parse({ images: [{ src: 'https://cdn.example.com/image.jpg', alt: 'A project screen' }] }));
  assert.equal(selected?.type, 'images');
});

test('duplicate project IDs fail validation', () => {
  const data = structuredClone(rawContent);
  data.projects.push(structuredClone(data.projects[0]));
  assert.equal(portfolioSchema.safeParse(data).success, false);
});

test('invalid and reserved project IDs fail validation', () => {
  for (const id of ['Bad slug!', '404', 'index']) {
    const data = structuredClone(rawContent);
    data.projects[0].id = id;
    assert.equal(portfolioSchema.safeParse(data).success, false);
  }
});

test('unsafe link protocols and empty image URLs fail validation', () => {
  const data = structuredClone(rawContent);
  data.projects[0].visitUrl = 'javascript:alert(1)';
  assert.equal(portfolioSchema.safeParse(data).success, false);
  assert.equal(mediaSchema.safeParse({ images: [{ src: '', alt: 'Missing image' }] }).success, false);
});

test('homepage cover does not become detail media', () => {
  const data = structuredClone(rawContent);
  data.projects[0].cover.src = 'https://cdn.example.com/cover.jpg';
  const project = portfolioSchema.parse(data).projects[0];
  assert.equal(selectProjectMedia(project.media), null);
});

test('projects without an externalOnly flag keep their detail pages', () => {
  const { externalOnly, ...project } = rawContent.projects[0];
  const parsed = portfolioSchema.parse({ ...rawContent, projects: [project] });
  assert.equal(parsed.projects[0].externalOnly, false);
});

test('external-only projects do not need detail content, SEO, or media', () => {
  const project = { ...rawContent.projects[0], externalOnly: true, content: undefined, seo: undefined, media: undefined };
  const parsed = portfolioSchema.parse({ ...rawContent, projects: [project] });
  assert.equal(parsed.projects[0].externalOnly, true);
  assert.deepEqual(parsed.projects[0].content, []);
});

test('external-only projects require a valid visit URL', () => {
  for (const visitUrl of ['', 'not-a-url', 'javascript:alert(1)']) {
    const project = { ...rawContent.projects[0], externalOnly: true, visitUrl };
    const result = portfolioSchema.safeParse({ ...rawContent, projects: [project] });
    assert.equal(result.success, false);
    if (!result.success) assert(result.error.issues.some(issue => issue.path.includes('visitUrl')));
  }
});

test('projects with detail pages still require a writeup', () => {
  const project = { ...rawContent.projects[0], externalOnly: false, content: [] };
  const result = portfolioSchema.safeParse({ ...rawContent, projects: [project] });
  assert.equal(result.success, false);
  if (!result.success) assert(result.error.issues.some(issue => issue.path.includes('content')));
});

test('externalOnly accepts boolean values, not strings', () => {
  const project = { ...rawContent.projects[0], externalOnly: 'true' };
  assert.equal(portfolioSchema.safeParse({ ...rawContent, projects: [project] }).success, false);
});
