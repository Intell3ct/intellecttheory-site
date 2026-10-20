# Content model & shortcodes — intellecttheory.com CMS

Posts are markdown files in `content/posts/<slug>.md`. The build
(`npm run build` → `dist/`) renders them through `templates/post.html`.
Layout stays Danbo's job; this file is the contract for post CONTENT.

## Frontmatter

| Field          | Widget   | Notes                                                      |
| -------------- | -------- | ---------------------------------------------------------- |
| title          | text     | Plain text. Appears as the post H1, tab tooltip, cards.    |
| seo_title      | text     | Optional. Overrides title for `<title>` and og:title.       |
| slug           | text     | Filename + URL. Lowercase, dashes. Never change after publish. |
| date           | date     | YYYY-MM-DD. Drives grid/archive/sitemap order + card badge.|
| tag            | select   | Photos / Thoughts / Gaming / Entertainment / Travel        |
| description    | text     | 1–2 sentences. Google + link previews.                     |
| cover_image    | text     | Filename in `images/`, e.g. `pogo-pikachu.jpg`.            |
| card_excerpt   | text     | One line for the homepage card.                            |
| card_image     | object   | `src` (images/... path), `width`, `height`, `alt`.         |
| card_images    | list     | Optional. 4 images → the 2×2 gallery card style.          |
| comments       | boolean  | Default true. False only for the Brady memorial.           |
| tea_badge      | boolean  | Default false. The big "Buy me a tea" badge, meaningful posts only. |
| no_hero        | boolean  | Default false. Keeps the card out of the homepage hero.    |
| official_links | list     | `{label, url}` pairs. Renders the "Official links" box.    |
| related        | list     | Up to 3 post slugs. Renders "You might also like".         |
| related_overrides | list  | Optional `{slug, tag, title}` — preserves a hand-tuned related card whose label differs from the target post's own tag/title. |
| layout         | text     | `standard` (default) or `photo` — the photo-hero layout (templates/post-photo.html). |
| hero_image     | object   | Photo layout only. `{src, width, height, alt}` — src relative to `images/`. The big hero image with the title overlaid. |
| card           | boolean  | Default true. `false` = no homepage card, and the search-index entry is kept verbatim (Saturday in San Francisco). |
| twitter_title  | text     | Optional. Overrides the share-preview title only (default: title). |
| twitter_image  | text     | Optional. Overrides the share-preview image only (default: cover_image). Filename in `images/`. |

## Body markdown

Plain markdown: paragraphs, `##` subheads, `[text](url)` links
(external links automatically get `target="_blank" rel="noopener"`),
bold/italic. Write accented characters normally (Pokémon) — the build
escapes them the way the site already does.

## Photo shortcodes

Put each on its own line, separated by blank lines like paragraphs.

### Floated photo with caption (most common)

```
{{< side-photo src="optimized/pogo-pikachu-800.webp" width="1206" height="2622" alt="Describe the photo" caption="The one that started it all." >}}
```

`src` is relative to `images/`. Use the `-800.webp` optimized file.
Caption is optional.

### Full-width photo

```
{{< photo src="optimized/pogo-gotts-meal-800.webp" alt="Describe the photo" >}}
```

### Two-across grid

```
{{< photos-2 >}}
![Alt one](optimized/photo1-800.webp)
![Alt two](optimized/photo2-800.webp)
{{< /photos-2 >}}
```

## Photo layout (`layout: photo`)

Photo posts (Lucha is Life, Munchies, Saturday in San Francisco,
SF Snapshots) use a different page skeleton: a full-width hero image
with the tag/title/date overlaid (`hero_image` in frontmatter), then:

1. `{{< photo-desc >}}` — the intro text, rendered inside the
   `.photo-desc` box. Always first, always required.
2. Any middle markdown (e.g. the Munchies recipe).
3. The Official links box (from `official_links`).
4. `{{< photo-grid >}}` — the closing photo grid. Dimensions are
   required per image, in the `"WxH"` title slot:

```
{{< photo-grid >}}
![Alt text](optimized/photo-800.webp "1206x1608")
{{< /photo-grid >}}
```

The build wraps the body in `<!-- POST BODY -->` … `<!-- /POST BODY -->`
and the usual two ADD MORE comments automatically.

### Anything fancier (carousels, spoilers, hero collages)

Paste raw HTML blocks as they appear in older posts — markdown lets
HTML pass through untouched. These stay Danbo's territory; ask before
inventing a new layout.

## What the build does

- Renders each post page (extensionless canonicals + og:url, layout
  order: body → tea badge → Official links → Comments).
- Comments appear on every post except `all-dogs-go-to-heaven`.
- Splices the post's card into `index.html` (newest first), regenerates
  `archive.html`, `sitemap.xml`, and `js/search-index.json`.
- Copies everything else (css, js, images, admin/, the-wall.html,
  admin.html, about.html, robots.txt, _headers, _redirects) verbatim.
- Fails loudly if a canonical/og:url/sitemap entry contains ".html",
  if comments are missing where required, or if the tea badge appears
  where it shouldn't.

## Adding photos

Upload via the CMS media library (goes to `images/uploads/`). Ask Danbo
to move/optimize them into `images/optimized/` when the post is done —
filenames referenced in shortcodes must exist there.
