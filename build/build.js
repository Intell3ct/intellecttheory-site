// Build for intellecttheory.com — renders Decap-managed posts (content/posts/*.md)
// through templates/post.html, splices refreshed cards into index.html,
// regenerates archive.html, sitemap.xml and js/search-index.json, and copies
// everything else verbatim into dist/.
//
// Unconverted (legacy) posts are still plain HTML in posts/. Their HTML is
// copied verbatim; their metadata is scraped from the HTML so related-cards,
// archive, sitemap and search stay complete during the migration.
//
// Standing rules enforced here (build FAILS if violated):
//  - canonical / og:url / sitemap URLs are extensionless (no ".html")
//  - comments on every post except all-dogs-go-to-heaven (Brady memorial)
//  - big Ko-fi tea badge only where frontmatter tea_badge: true
import {
  readFileSync, writeFileSync, mkdirSync, readdirSync,
  existsSync, rmSync, cpSync,
} from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { marked } from 'marked';
import { COMMENTS_BLOCK, TEA_BLOCK, ADD_MORE_COMMENT } from './fragments.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const SITE = 'https://intellecttheory.com';
const NO_COMMENTS_SLUG = 'all-dogs-go-to-heaven';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'];
const MONTHS_SHORT = MONTHS.map((m) => m.slice(0, 3));

const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const write = (p, s) => {
  const full = join(DIST, p);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, s);
};

// Escape a plain-text string the way titles/labels appear in the site's HTML.
// Smart about existing entities so scraped legacy titles pass through intact.
export function esc(s) {
  return String(s)
    .replace(/&(?!(amp|apos|eacute|mdash|ndash|rsquo|lsquo|ldquo|rdquo|hellip|rarr|copy|hellip);)/g, '&amp;')
    .replace(/é/g, '&eacute;')
    .replace(/’/g, '&rsquo;')
    .replace(/'/g, '&apos;');
}

// Inverse of esc(), for plain-text contexts (search index, JSON).
export function decode(s) {
  return String(s)
    .replace(/&eacute;/g, 'é')
    .replace(/&apos;/g, "'")
    .replace(/&rsquo;/g, '’')
    .replace(/&lsquo;/g, '‘')
    .replace(/&ldquo;/g, '“')
    .replace(/&rdquo;/g, '”')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&hellip;/g, '…')
    .replace(/&rarr;/g, '→')
    .replace(/&copy;/g, '©')
    .replace(/&amp;/g, '&');
}

function isoDate(d) {
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  return String(d).slice(0, 10);
}
function humanDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}
function badgeDate(iso) {
  const [, m, d] = iso.split('-').map(Number);
  return { day: String(d).padStart(2, '0'), mon: MONTHS_SHORT[m - 1] };
}

// ---------------------------------------------------------------- posts data
function loadConvertedPosts() {
  const dir = join(ROOT, 'content/posts');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const { data, content } = matter(readFileSync(join(dir, f), 'utf8'));
      const fm = data;
      return {
        slug: fm.slug,
        title: esc(fm.title),               // entity-escaped form for HTML
        titlePlain: String(fm.title),       // raw text for search index
        seoTitle: fm.seo_title || null,
        date: isoDate(fm.date),
        tag: fm.tag,
        description: fm.description || '',
        coverImage: fm.cover_image || '',
        comments: fm.comments !== false,
        teaBadge: fm.tea_badge === true,
        noHero: fm.no_hero === true,
        layout: fm.layout || 'standard',
        hero: fm.hero_image || null,
        card: fm.card !== false,
        twitterTitle: fm.twitter_title || null,
        twitterImage: fm.twitter_image || null,
        relatedOverrides: fm.related_overrides || [],
        cardExcerpt: fm.card_excerpt || '',
        cardImage: fm.card_image || null,
        cardImages: fm.card_images || null,
        officialLinks: fm.official_links || [],
        related: fm.related || [],
        bodyMd: content,
        converted: true,
      };
    });
}

// Scrape metadata for a not-yet-converted post from its HTML file.
// HTML comments are stripped first: some posts keep the old template
// instructions in a comment, and their placeholder text must not match.
function legacyMeta(slug) {
  const html = read(`posts/${slug}.html`).replace(/<!--[\s\S]*?-->/g, '');
  const title = html.match(/<h1>([\s\S]*?)<\/h1>/)[1].trim();
  const tag = html.match(/<span class="tag">([\s\S]*?)<\/span>/)[1].trim();
  const date = html.match(/<time datetime="([\d-]+)"/)[1];
  const ogImage = (html.match(/property="og:image" content="https:\/\/intellecttheory\.com\/(.*?)"/) || [])[1] || '';
  return {
    slug, title, titlePlain: decode(title), date, tag,
    coverImage: ogImage.replace(/^images\//, ''),
    comments: slug !== NO_COMMENTS_SLUG,
    teaBadge: html.includes('tip-jar-btn'),
    related: [], converted: false,
  };
}

function allPostSlugs() {
  return readdirSync(join(ROOT, 'posts'))
    .filter((f) => f.endsWith('.html') && f !== '_template.html')
    .map((f) => f.replace(/\.html$/, ''));
}

// Card image (src/alt/dims) for legacy posts, read out of the current index card.
function legacyCardData(indexHtml) {
  const out = {};
  const blocks = indexHtml.match(/<!-- CARD START[\s\S]*?<!-- CARD END -->/g) || [];
  for (const b of blocks) {
    const slugM = b.match(/href="posts\/([\w-]+)\.html"/);
    if (!slugM) continue;
    const imgM = b.match(/<img loading="lazy" decoding="async" width="(\d+)" height="(\d+)" src="([^"]+)" alt="([^"]*)"/);
    const excerptM = b.match(/<div class="card-body">[\s\S]*?<p>([\s\S]*?)<\/p>/);
    out[slugM[1]] = {
      cardImage: imgM ? { width: +imgM[1], height: +imgM[2], src: imgM[3], alt: imgM[4] } : null,
      cardExcerpt: excerptM ? excerptM[1] : '',
      noHero: / data-no-hero/.test(b),
      hasStrip: b.includes('card-strip'),
    };
  }
  return out;
}

// ---------------------------------------------------------------- body render
function parseArgs(str) {
  const out = {};
  for (const m of str.matchAll(/(\w[\w-]*)="([^"]*)"/g)) out[m[1]] = m[2];
  return out;
}

function renderBody(md, indent = 6) {
  const blocks = [];
  const stash = (html) => {
    blocks.push(html);
    return `\n\n@@BLOCK${blocks.length - 1}@@\n\n`;
  };
  let srcMd = md;

  // {{< side-photo src width height alt caption >}} — floated figure w/ caption
  srcMd = srcMd.replace(/\{\{<\s*side-photo\s+([^>]*?)\s*>\}\}/g, (_, argStr) => {
    const a = parseArgs(argStr);
    let h = '      <figure class="photo-side">\n';
    h += `   <img loading="lazy" decoding="async" width="${a.width}" height="${a.height}" src="../images/${a.src}" alt="${esc(a.alt || '')}">\n`;
    if (a.caption) h += `        <figcaption>${a.caption}</figcaption>\n`;
    h += '      </figure>';
    return stash(h);
  });

  // {{< photo src alt >}} — full-width photo
  srcMd = srcMd.replace(/\{\{<\s*photo\s+([^>]*?)\s*>\}\}/g, (_, argStr) => {
    const a = parseArgs(argStr);
    return stash(`      <img class="post-photo" src="../images/${a.src}" alt="${esc(a.alt || '')}" loading="lazy" decoding="async">`);
  });

  // {{< photos-2 >}} ![alt](file) x2 {{< /photos-2 >}} — two-across grid
  srcMd = srcMd.replace(/\{\{<\s*photos-2\s*>\}\}([\s\S]*?)\{\{<\s*\/photos-2\s*>\}\}/g, (_, inner) => {
    const imgs = [...inner.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)]
      .map((m) => `        <img src="../images/${m[2]}" alt="${esc(m[1])}" loading="lazy" decoding="async">`)
      .join('\n');
    return stash(`      <div class="post-photos-2">\n${imgs}\n      </div>`);
  });

  let html = marked.parse(srcMd);
  // External links open in a new tab, per site convention.
  html = html.replace(/<a href="(https?:\/\/[^"]+)">/g, '<a href="$1" target="_blank" rel="noopener">');
  // One blank line between blocks, fixed indent — matches the hand-made pages.
  const pad = ' '.repeat(indent);
  html = html.trim().split('\n').join('\n\n');
  html = html.split('\n').map((l) => (l ? pad + l : l)).join('\n');
  html = html.replace(new RegExp(`${pad}<p>@@BLOCK(\\d+)@@</p>`, 'g'), (_, i) => blocks[+i]);
  return html;
}

// Photo-grid block (photo layout only): image lines with explicit dims,
// e.g. ![alt](optimized/photo-800.webp "1206x1608")
function buildPhotoGrid(inner, slug) {
  const imgs = [...inner.matchAll(/!\[([^\]]*)\]\(\s*([^)\s]+)\s*(?:"(\d+)x(\d+)")?\s*\)/g)];
  if (!imgs.length) throw new Error(`${slug}: photo-grid shortcode has no images`);
  const lines = imgs.map((m) => {
    if (!m[3] || !m[4]) throw new Error(`${slug}: photo-grid image missing "WxH" dims: ${m[2]}`);
    return `        <img width="${m[3]}" height="${m[4]}" src="../images/${m[2]}" alt="${esc(m[1])}" loading="lazy" decoding="async">`;
  });
  return `      <div class="photo-grid">\n${lines.join('\n')}\n      </div>`;
}

// Photo layout body (templates/post-photo.html): hero is in the template;
// here we assemble POST BODY comment + photo-desc + middle + tea + Official
// links + photo-grid + /POST BODY + the two ADD MORE comments, matching the
// hand-made photo pages byte for byte.
function renderPhotoBody(p) {
  let md = p.bodyMd;
  let gridHtml = '';
  md = md.replace(/\{\{<\s*photo-grid\s*>\}\}([\s\S]*?)\{\{<\s*\/photo-grid\s*>\}\}/g,
    (_, inner) => { gridHtml = buildPhotoGrid(inner, p.slug); return ''; });
  let descHtml = '';
  md = md.replace(/\{\{<\s*photo-desc\s*>\}\}([\s\S]*?)\{\{<\s*\/photo-desc\s*>\}\}/g,
    (_, inner) => { descHtml = renderBody(inner.trim(), 8); return ''; });
  if (!descHtml) throw new Error(`${p.slug}: layout "photo" needs a {{< photo-desc >}} block`);
  const middleHtml = md.trim() ? renderBody(md) : '';

  const parts = [`      <!-- POST BODY -->\n      <div class="photo-desc">\n${descHtml}\n      </div>`];
  if (middleHtml) parts.push(middleHtml);
  if (p.teaBadge) parts.push(TEA_BLOCK);
  if (p.officialLinks.length) parts.push(renderOfficialLinks(p.officialLinks));
  if (gridHtml) parts.push(gridHtml);
  return '\n' + parts.join('\n\n') + '\n      <!-- /POST BODY -->' +
    '\n\n' + ADD_MORE_COMMENT + '\n\n' + ADD_MORE_COMMENT;
}

function renderOfficialLinks(links) {
  const items = links
    .map((l) => `          <li><a href="${l.url}" target="_blank" rel="noopener">${esc(l.label)}</a></li>`)
    .join('\n');
  return `      <aside class="post-links">\n        <h3>Official links</h3>\n        <ul>\n${items}\n        </ul>\n      </aside>`;
}

function renderRelated(p, bySlug) {
  if (!p.related || !p.related.length) return '';
  const overrides = {};
  for (const o of p.relatedOverrides || []) overrides[o.slug] = o;
  const cards = p.related.map((s) => {
    const r = bySlug[s];
    if (!r) throw new Error(`related post not found: ${s} (in ${p.slug})`);
    const ov = overrides[s] || {};
    return `      <a href="${s}.html" class="related-card">\n        <span class="related-tag">${ov.tag || r.tag}</span>\n        <span class="related-title">${ov.title || r.title} — Intellect Theory</span>\n      </a>`;
  }).join('\n');
  return `    <section class="related-posts">\n      <h2>You might also like</h2>\n      <div class="related-grid">\n${cards}\n      </div>\n    </section>\n`;
}

function renderPost(p, bySlug) {
  const isPhoto = p.layout === 'photo';
  let tpl = read(isPhoto ? 'templates/post-photo.html' : 'templates/post.html');
  let articleBody;
  if (isPhoto) {
    articleBody = renderPhotoBody(p);
  } else {
    const parts = [renderBody(p.bodyMd)];
    if (p.teaBadge) parts.push(TEA_BLOCK);
    if (p.officialLinks.length) parts.push(renderOfficialLinks(p.officialLinks));
    parts.push(ADD_MORE_COMMENT);
    articleBody = '\n' + parts.join('\n\n');
  }

  tpl = tpl.replace('{{ARTICLE_BODY}}', () => articleBody);
  tpl = tpl.replaceAll('{{DESCRIPTION}}', p.description);
  tpl = tpl.replaceAll('{{SLUG}}', p.slug);
  tpl = tpl.replaceAll('{{SEO_TITLE_FULL}}', `${p.seoTitle || decode(p.title)} | Intellect Theory`);
  tpl = tpl.replaceAll('{{TWITTER_TITLE}}', `${p.twitterTitle || p.title} — Intellect Theory`);
  tpl = tpl.replaceAll('{{COVER_IMAGE}}', p.coverImage);
  tpl = tpl.replaceAll('{{TWITTER_IMAGE}}', p.twitterImage || p.coverImage);
  if (isPhoto) {
    if (!p.hero) throw new Error(`${p.slug}: layout "photo" needs hero_image frontmatter`);
    tpl = tpl.replace('{{HERO_WIDTH}}', String(p.hero.width));
    tpl = tpl.replace('{{HERO_HEIGHT}}', String(p.hero.height));
    tpl = tpl.replace('{{HERO_IMAGE}}', p.hero.src);
    tpl = tpl.replace('{{HERO_ALT}}', esc(p.hero.alt || ''));
  }
  tpl = tpl.replace('{{TAG}}', p.tag);
  tpl = tpl.replace('{{TITLE}}', p.title);
  tpl = tpl.replace('{{DATE_ISO}}', p.date);
  tpl = tpl.replace('{{DATE_HUMAN}}', humanDate(p.date));
  tpl = tpl.replace('{{COMMENTS_SECTION}}',
    () => (p.comments ? COMMENTS_BLOCK.replaceAll('%SLUG%', p.slug) : ''));
  tpl = tpl.replace('{{RELATED_SECTION}}', () => renderRelated(p, bySlug));
  return tpl;
}

// ------------------------------------------------------------------- cards
function renderCard(p) {
  const b = badgeDate(p.date);
  const noHero = p.noHero ? ' data-no-hero' : '';
  let media;
  let kind;
  if (p.cardImages && p.cardImages.length) {
    kind = 'gallery card';
    const imgs = p.cardImages.map((im) =>
      `            <img loading="lazy" decoding="async" width="${im.width}" height="${im.height}" src="${im.src}" alt="${im.alt}">`).join('\n');
    media = `          <div class="card-strip grid-2x2">\n${imgs}\n          </div>`;
  } else if (p.cardImage) {
    kind = 'photo card';
    const im = p.cardImage;
    media = `          <img loading="lazy" decoding="async" width="${im.width}" height="${im.height}" src="${im.src}" alt="${im.alt}">`;
  } else {
    kind = 'text card';
    media = '';
  }
  return `      <!-- CARD START : ${kind} -->
      <article class="card" data-date="${humanDate(p.date)}"${noHero}>
        <div class="card-media">
${media}
          <span class="date-badge"><b>${b.day}</b>${b.mon}</span>
        </div>
        <div class="card-body">
          <span class="tag">${p.tag}</span>
          <h3>${p.title}</h3>
          <p>${p.cardExcerpt}</p>
          <a class="read-more" href="posts/${p.slug}.html">Read more &rarr;</a>
        </div>
      </article>
      <!-- CARD END -->`;
}

function spliceCard(indexHtml, p) {
  const gridStart = indexHtml.indexOf('<section id="posts" class="post-grid">');
  const gridEnd = indexHtml.indexOf('</section>', gridStart);
  let grid = indexHtml.slice(gridStart, gridEnd);
  const idx = grid.indexOf(`href="posts/${p.slug}.html"`);
  const card = renderCard(p);
  if (idx === -1) {
    // New post: newest goes first, right after the section opening tag.
    const openEnd = grid.indexOf('>') + 1;
    grid = grid.slice(0, openEnd) + '\n' + card + grid.slice(openEnd);
  } else {
    const blockStart = grid.lastIndexOf('      <!-- CARD START', idx);
    const blockEnd = grid.indexOf('<!-- CARD END -->', idx) + '<!-- CARD END -->'.length;
    // Keep the hand-written CARD START comment verbatim; only the card
    // body is regenerated.
    const origStart = grid.slice(blockStart, grid.indexOf('\n', blockStart));
    const kept = origStart + card.slice(card.indexOf('\n'));
    grid = grid.slice(0, blockStart) + kept + grid.slice(blockEnd);
  }
  return indexHtml.slice(0, gridStart) + grid + indexHtml.slice(gridEnd);
}

// ------------------------------------------------------------------ archive
function renderArchive(archiveHtml, posts) {
  const byMonth = new Map();
  for (const p of [...posts].sort((a, b) => b.date.localeCompare(a.date))) {
    const key = p.date.slice(0, 7);
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key).push(p);
  }
  const groups = [...byMonth.entries()].map(([key, ps], i) => {
    const [y, m] = key.split('-').map(Number);
    const lis = ps.map((p) =>
      `        <li><a href="posts/${p.slug}.html"><span class="archive-date">${humanDate(p.date)}</span><span class="tag tag-sm">${p.tag}</span><span class="archive-title">${p.title}</span></a></li>`
    ).join('\n');
    return `      <details class="archive-group"${i === 0 ? ' open' : ''}>\n        <summary class="archive-month">${MONTHS[m - 1]} ${y} <span class="archive-count">(${ps.length} post${ps.length === 1 ? '' : 's'})</span></summary>\n      <ul class="archive-list">\n${lis}\n      </ul>\n      </details>`;
  }).join('\n');
  const secStart = archiveHtml.indexOf('    <section class="archive">');
  const secEnd = archiveHtml.indexOf('\n    </section>', secStart);
  return archiveHtml.slice(0, secStart) +
    `    <section class="archive">\n${groups}` +
    archiveHtml.slice(secEnd);
}

// ------------------------------------------------------------------ sitemap
function renderSitemap(existing, posts) {
  const entry = (loc, freq, prio) =>
    `  <url><loc>${loc}</loc><changefreq>${freq}</changefreq><priority>${prio}</priority></url>`;
  const known = new Map();
  for (const m of existing.matchAll(/<loc>(.*?)<\/loc><changefreq>(.*?)<\/changefreq><priority>(.*?)<\/priority>/g)) {
    known.set(m[1], { freq: m[2], prio: m[3] });
  }
  const lines = [];
  const seen = new Set();
  // Preserve existing order; insert brand-new post URLs at the front of the list.
  const newPosts = posts.filter((p) => !known.has(`${SITE}/posts/${p.slug}`));
  for (const p of newPosts.sort((a, b) => b.date.localeCompare(a.date))) {
    lines.push(entry(`${SITE}/posts/${p.slug}`, 'monthly', '0.8'));
    seen.add(`${SITE}/posts/${p.slug}`);
  }
  for (const m of existing.matchAll(/<loc>(.*?)<\/loc><changefreq>(.*?)<\/changefreq><priority>(.*?)<\/priority>/g)) {
    lines.push(entry(m[1], m[2], m[3]));
    seen.add(m[1]);
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${lines.join('\n')}\n</urlset>\n`;
}

// -------------------------------------------------------------- search index
function renderSearchIndex(existingJson, posts, legacyCards) {
  const existing = JSON.parse(existingJson);
  const bySlug = new Map(posts.map((p) => [p.slug, p]));
  const out = existing.map((e) => {
    const slug = e.url.replace('posts/', '').replace('.html', '');
    const p = bySlug.get(slug);
    // Only converted posts are rebuilt; legacy entries stay verbatim so
    // hand-tuned fields (e.g. Saturday's fallback search image) survive.
    // card: false posts keep their legacy entry verbatim for the same reason.
    if (!p || !p.converted || p.card === false) return e;
    return {
      title: p.titlePlain,
      tag: p.tag,
      date: p.date,
      text: '',
      url: `posts/${p.slug}.html`,
      img: (p.cardImage && p.cardImage.src) || `images/${p.coverImage}`,
    };
  });
  const knownSlugs = new Set(existing.map((e) => e.url.replace('posts/', '').replace('.html', '')));
  for (const p of posts) {
    if (p.card === false) continue;
    if (!knownSlugs.has(p.slug)) {
      out.unshift({
        title: p.titlePlain, tag: p.tag, date: p.date, text: '',
        url: `posts/${p.slug}.html`,
        img: (p.cardImage && p.cardImage.src) || `images/${p.coverImage}`,
      });
    }
  }
  return JSON.stringify(out, null, 2);
}

// --------------------------------------------------------------------- build
function main() {
  const converted = loadConvertedPosts();
  const convertedSlugs = new Set(converted.map((p) => p.slug));
  const slugs = allPostSlugs();

  const bySlug = {};
  for (const p of converted) bySlug[p.slug] = p;
  for (const s of slugs) if (!bySlug[s]) bySlug[s] = legacyMeta(s);
  const allPosts = slugs.map((s) => bySlug[s]);

  // 1. Copy the whole site verbatim (except build machinery + output).
  rmSync(DIST, { recursive: true, force: true });
  mkdirSync(DIST, { recursive: true });
  const EXCLUDE = new Set(['.git', 'node_modules', 'dist', 'content', 'build',
    'templates', 'package.json', 'package-lock.json', '.gitignore', 'hidden_files']);
  for (const entry of readdirSync(ROOT)) {
    if (EXCLUDE.has(entry)) continue;
    cpSync(join(ROOT, entry), join(DIST, entry), { recursive: true });
  }

  // 2. Render converted posts over the verbatim copies.
  for (const p of converted) write(`posts/${p.slug}.html`, renderPost(p, bySlug));

  // 3. Index: splice refreshed cards for converted posts (card: false
  // posts — e.g. Saturday — intentionally have no homepage card).
  const legacyCards = legacyCardData(read('index.html'));
  let indexHtml = read('index.html');
  for (const p of converted) if (p.card !== false) indexHtml = spliceCard(indexHtml, p);
  write('index.html', indexHtml);

  // 4. Archive + sitemap + search index, regenerated from the post data.
  write('archive.html', renderArchive(read('archive.html'), allPosts));
  write('sitemap.xml', renderSitemap(read('sitemap.xml'), allPosts));
  write('js/search-index.json', renderSearchIndex(read('js/search-index.json'), allPosts, legacyCards));

  // ------------------------------------------------------------ validation
  const errors = [];
  for (const f of readdirSync(join(DIST, 'posts')).filter((x) => x.endsWith('.html'))) {
    const html = readFileSync(join(DIST, 'posts', f), 'utf8');
    const slug = f.replace(/\.html$/, '');
    const canon = html.match(/rel="canonical" href="([^"]+)"/);
    if (canon && canon[1].includes('.html')) errors.push(`${f}: canonical has .html`);
    const og = html.match(/property="og:url" content="([^"]+)"/);
    if (og && og[1].includes('.html')) errors.push(`${f}: og:url has .html`);
    const hasComments = html.includes('data-comments');
    if (slug !== NO_COMMENTS_SLUG && slug !== '_template' && !hasComments) {
      errors.push(`${f}: comments section missing`);
    }
    if (slug === NO_COMMENTS_SLUG && hasComments) errors.push(`${f}: Brady post must not have comments`);
    const tea = html.includes('tip-jar-btn');
    const meta = bySlug[slug];
    if (meta && meta.converted && tea !== meta.teaBadge) {
      errors.push(`${f}: tea badge mismatch (frontmatter tea_badge=${meta.teaBadge})`);
    }
  }
  const sm = readFileSync(join(DIST, 'sitemap.xml'), 'utf8');
  if (/\.html<\/loc>/.test(sm)) errors.push('sitemap.xml: .html in a <loc>');
  if (errors.length) {
    console.error('BUILD VALIDATION FAILED:\n' + errors.map((e) => ' - ' + e).join('\n'));
    process.exit(1);
  }
  console.log(`Build OK → dist/ (${converted.length} converted post(s), ${slugs.length} total)`);
}

main();
