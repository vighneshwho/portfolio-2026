# Vighnesh’s portfolio

A single-column Astro portfolio with a homepage, a work index at `/works/`, and static project pages at `/work/<project-id>/`. Plain CSS, system fonts, native controls for project video files, and no first-party client-side JavaScript. The YouTube showreel uses an embedded player. Content is read and validated at build time.

## Run locally

Use Node 24 (or Node 22.22+).

```sh
npm ci
npm run dev
```

Open the local URL printed in the terminal. `npm run verify` checks the Astro/TypeScript files, runs the content and media-selection tests, and builds the site into `dist/`. `npm run preview` previews that production build.

## Edit the content

Everything visible is configured in **`src/data/portfolio.json`**:

| Key | What it changes |
| --- | --- |
| `site` | Name, page metadata, default social image, navigation, shared labels |
| `home` | Showreel, greeting, blurb, accessible company section label |
| `works` | Work index heading and SEO description |
| `companies` | Names, links, custom logo URLs, fallback icon marks |
| `projects` | Cards on `/works/` and complete project detail pages |
| `contact` | Handle and plain-text email address |

The six projects are populated from public product pages, store listings, and launch posts. Their references are recorded in `PROJECT_SOURCES.md`. Project covers and detail media remain empty until CDN assets are supplied. Company symbols are simple monochrome fallback marks; replace `logo` with your actual logo’s CDN URL whenever ready.

Projects and companies appear in array order. Duplicate a project object to add another project. By default, its `id` creates the route, for example `openlyy` produces `/work/openlyy/`. IDs must be unique, lowercase, and hyphenated. Remove an object to remove its card and detail page. The homepage contains the showreel, intro, companies, and footer; project cards appear only on `/works/`.

### Link directly to a project

Set a project’s `externalOnly` flag to `true` to have its card open `visitUrl` directly in a new tab:

```json
"visitUrl": "https://openlyy.me",
"externalOnly": true
```

No detail page or sitemap entry is generated for that project. Its `content`, `seo`, and `media` fields can be omitted. A valid `visitUrl` is required. Set `externalOnly` to `false` to generate a detail page and open that page from the card; the flag defaults to `false` when omitted. Set the flag on each project to choose whether it links directly or has a detail page. Changes take effect on the next build/deployment.

Writeups use `content` sections. Each section has a `heading` and an array of `paragraphs`, so text stays editable without HTML in your JSON. All text is rendered as escaped text.

## Add images and video

Use a full CDN URL, or a root-relative path for a file placed inside `public/`. For example, `public/images/cover.jpg` is referenced as `/images/cover.jpg`. Local paths automatically respect the GitHub Pages repository subpath.

The homepage showreel and project cover intentionally display gray CSS containers when their URLs are empty. No placeholder image files or external placeholder services are used.

Set `projects[].cover.src` to your cover image URL. `cover.alt` describes it; `width` and `height` describe the original image dimensions. The work index card keeps a consistent frame and displays the image with `object-fit: cover`.

Project detail media is independent of the work index cover:

```json
"media": {
  "video": "https://your-cdn.example.com/project.mp4",
  "poster": "https://your-cdn.example.com/project-poster.jpg",
  "captions": "",
  "images": [
    {
      "src": "https://your-cdn.example.com/project-screen.jpg",
      "alt": "Describe what the image shows",
      "width": 1600,
      "height": 1000,
      "caption": "An optional image caption"
    }
  ]
}
```

- If `video` has a URL, the detail page shows the video **instead of the image list**.
- If `video` is empty, the detail page shows the supplied images in order.
- `poster` is only the video's preview image. To display a standalone image, add it to `media.images` with its `src`, `alt`, `width`, and `height`.
- If `video` is empty and `images` is `[]`, the detail page has **no media section, placeholder, or reserved space**. A poster or cover alone does not create one.

Project detail videos use native controls, play inline, do not autoplay, and use `preload="none"`. `captions` can point to an English WebVTT file. Images fill their frames with `object-fit: cover`; supply their actual dimensions to establish the right aspect ratio and avoid layout shifts. Use appropriately compressed and resized files from your CDN.

Set `home.showreel.video` to a YouTube watch, short, or embed URL, or supply a video file URL. The configured showreel is `https://www.youtube.com/watch?v=uVKKV664CDU`. The showreel autoplays muted, loops, and hides playback controls. The YouTube embed disables keyboard and pointer interaction; single-video looping uses the same video ID as its playlist. YouTube can still briefly show its own title or branding during loading or restarting; use a direct CDN video URL for completely unbranded playback. No player SDK is added to this site. For video files, use `home.showreel.poster` for the poster. If only a showreel poster is provided, the homepage displays that image. An empty project `visitUrl` hides the visit button.

The build validates the JSON and reports field paths for errors such as duplicate IDs, missing text, unsafe link protocols, empty image sources, missing local assets, and invalid dimensions.

## Deploy to GitHub Pages

1. Push this folder to a GitHub repository using a `main` branch, including `package-lock.json`.
2. In the repository, go to **Settings → Pages → Build and deployment → Source** and select **GitHub Actions**.
3. Run the **Deploy portfolio to GitHub Pages** workflow under Actions, or push another commit to `main`.

The included workflow validates and builds before deployment. It reads the real site origin and base path from GitHub Pages, so both of these work without source changes:

- `YOUR_USERNAME.github.io` repository → `https://YOUR_USERNAME.github.io/`
- A regular repository → `https://YOUR_USERNAME.github.io/REPOSITORY/`

Add a custom domain under GitHub’s Pages settings and configure your domain’s DNS to use it. Subsequent workflow runs read the configured domain automatically. HTTPS is managed through GitHub Pages.

For builds outside GitHub Actions, set `site.url` in the JSON to your real site origin. A manual repository-subpath build can be checked with:

```sh
SITE_URL=https://yourusername.github.io BASE_PATH=/portfolio npm run build
```

All internal links, local asset paths, canonical URLs, robots, and sitemap use that configuration. Content changes require a new build, which happens automatically on pushes to `main`.

## Styling and SEO

`src/styles/global.css` contains the responsive layout and a few CSS variables for colors and corner radii. The design uses a gray canvas, rounded white panels, a restrained pink navigation accent, and system fonts.

The site generates unique titles and descriptions, canonical URLs, Open Graph/Twitter metadata, `robots.txt`, a sitemap, and a 404 page. Optional project `seo` values override the title and description; otherwise the project’s normal text is used. `site.socialImage` is optional and can be a CDN URL. Images and videos are never fetched to render the page’s text.
