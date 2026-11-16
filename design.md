# Intellect Theory — Design System

The single source of truth for how intellecttheory.com looks, reads, and is
built. When a new page or post is created, start here. When a design
decision changes, update this file in the same commit as the change.

Last updated: November 16, 2026.

## Brand

- **Name:** Intellect Theory. The site is a *website*, never called a blog.
- **The author introduces himself as Intellect** ("Hello, my name is
  Intellect."). The personal identity stays semi-separated from the brand:
  no real name in site copy, and personal outing photos stay hidden unless
  AJ says otherwise.
- **Signature idea:** *sonder* — "the realization that every stranger has a
  life as vivid as your own." It anchors the homepage and the meta
  description.
- **Footer line:** "Video games, events, and shooting the shit. Smile,
  think positive, and own the world."
- **Logo:** hand-lettered brush script reading "Intellect Theory," stacked
  in two lines, deep teal-green with mint accents. Never the Intel
  corporation logo.
- **Location rule:** never publish AJ's current living location. "Bay
  Area" and a Marin County upbringing are fine.

## Colors

All colors live as CSS variables in `css/styles.css` (`:root`). Never
hard-code a hex in a new page; use the variable.

| Variable | Value | Used for |
|---|---|---|
| `--bg` | `#ffffff` | page background |
| `--surface` | `#f7f5f1` | cards and panels (warm paper) |
| `--text` | `#1d1a16` | main text |
| `--muted` | `#8a8178` | dates, secondary text |
| `--line` | `#e9e2d8` | borders |
| `--mint` | `#aed6c9` | brand mint: tags, tip jar, selection color |
| `--mint-wash` | `#eef7f3` | whisper-light mint panels |
| `--amber` | `#e8a838` | newsletter button, hero accents |
| `--amber-dark` | `#c78f2b` | amber shading |
| `--accent` | `#c9602f` | burnt orange: read-more links, highlights |
| `--radius` | `18px` | default corner roundness |

Text selected by the visitor highlights in mint (`::selection`).

## Typography

- **Headings:** Georgia, "Times New Roman", serif (`--font-head`),
  line-height 1.2.
- **Body:** "Helvetica Neue", Arial, sans-serif (`--font-body`),
  line-height 1.6.
- **System fonts only. No webfonts, ever** — nothing is fetched from
  Google Fonts or any font CDN (privacy and speed).
- **Tag label** (the small pill above card and post titles): 0.72rem,
  bold, uppercase, letter-spacing 0.14em, dark text on mint, pill radius.

## Layout

- Content column: max-width 1140px (`--max-width`), centered.
- **Header:** logo dead-center at every width. Left nav: Posts, The Wall.
  Right nav: Archive, Contact. Search toggle in the header.
- Responsive breakpoints in use: 768px, 640px, 600px, 480px. Design
  mobile-first enough that nothing overflows at 360px wide.

## Components

### Post cards
Warm surface background, 18px radius. On hover the card lifts with a soft
shadow (`0 12px 30px rgba(0,0,0,0.10)`). Card titles are `h2`. The whole
card is clickable through the read-more link.

### Buttons — the premium lighting recipe
Real call-to-action buttons fake light from above. Pill radius (999px),
a gentle top-to-bottom gradient (light tint, base color, deeper shade),
and four shadows:

1. `inset 0 1px 0 rgba(255,255,255,0.6–0.75)` — highlight on the top edge
2. `inset 0 -2px 0 rgba(0,0,0,0.08–0.10)` — shade on the bottom edge
3. `0 2px 4px rgba(0,0,0,0.18)` — tight contact shadow underneath
4. `0 12px 28px` in the button's own color at ~0.45–0.55 alpha — soft glow

Hover: lift 1–2px, glow deepens. Pressed (`:active`): the flip — top
highlight gone, gradient reversed, button sinks 1px, shadow tightens to
`0 1px 2px rgba(0,0,0,0.15)`.

Applied to: the tip jar button (mint) and the newsletter button (amber).
Text links like "Read more" stay plain accent-colored text, not buttons.

### Tip jar
"Buy me a tea" — never coffee, AJ can't have caffeine. The big badge
appears only on meaningful posts (frontmatter `tea_badge: true`); the
small Ko-fi footer icon is the sitewide presence. Note under the badge:
"If this meant something to you, a tea keeps me writing."

### Newsletter
"The Monthly Drop" lives in the footer of every page: one email a month,
amber premium button, served by Buttondown.

### Comments
Every post has comments except the Brady memorial (his boundary, no
exceptions). Under each form, two small notes: the Turnstile bot check,
and the public/moderation note ("Comments are public, so please don't
post anyone's personal info. Anything posted may be moderated or
removed."). The Wall uses the same pattern with "Messages."

### Filter pills
Homepage and archive filter by: All, Photos, Thoughts, Gaming,
Entertainment.

## Imagery

- Photos are optimized WebP at 800px wide in `images/optimized/`, always
  `loading="lazy"` and `decoding="async"`, always with width/height and
  real alt text.
- Image work routes through PhotoCraft (local, free) unless AJ asks
  otherwise.

## Voice and content rules

- Casual first-person, the way AJ talks. Short punchy fragments after
  longer builds. Minimal em dashes — commas and periods do the work.
- Preview before publish, no exceptions: draft, show AJ the preview,
  publish only on his word.
- For each *new* post, ask AJ which socials announce it (never for
  revisions). Gaming posts never go to Instagram; Instagram gets up to 5
  most-relevant hashtags.
- Internal links only where they read naturally.
- Nate goes by "Enjii" in posts.

## URLs and SEO

- Canonical tags, `og:url`, and sitemap entries are **always
  extensionless**. The build fails if `.html` sneaks into any of them.
- Every content page: unique meta title and description, OG tags, exactly
  one `h1`, headings in order, BlogPosting schema on posts, Organization
  schema ("Intellect Theory") on the homepage.
- `llms.txt` and `llms-full.txt` are generated on every build.
- `noindex` only where it belongs: 404, /admin, /backend, /moderate.

## Build conventions

- Static site, custom Node build (`npm run build` → `dist/`), hosted on
  Cloudflare Pages, auto-deploys on push to `main`.
- CSS and JS are minified during the build. **Any CSS or JS content
  change must bump its `?v=` cache-buster** in every HTML file and
  template (assets are cached a year, immutable).
- Posts are Markdown in `content/posts/`, edited through Decap CMS at
  /admin or through git — never both on the same post at once.
- Design changes ship on a preview branch first (Cloudflare preview
  link), AJ approves, then merge.
- This file is excluded from the published site via the build's EXCLUDE
  list. It lives in the repo for builders, human or AI, not for visitors.

## Scoped exception: the GTA 6 pages

`/gta-6-answers` and `/gta-6-tracker` deliberately break the main system
with a dark Rockstar-palette theme in `css/gta6.css`: background
`#2a2a4b`, panels `#23233f`, lines `#45456e`, pink `#fe96b1`, lavender
`#cab9f2`, dim lavender `#a9a2d3`, and a sunset gradient
(`linear-gradient(100deg, #d780b0, #f19595 30%, #fcb595 50%, #ee9298 75%,
#d881af)`), glass cards, palm silhouettes, and a launch countdown pill.
This palette is for GTA pages only — never let it leak into the main
site, and never let the main palette leak into them.
