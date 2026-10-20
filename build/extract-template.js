// One-off: extract templates/post.html + build/fragments.js from the pilot post.
// Reads the CURRENT live file; run once. Verbatim output guarantees
// the static chrome (header/footer/sidebar/scripts) is byte-identical.
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(ROOT, 'posts/current-addiction-pokemon-go.html'), 'utf8');

let tpl = src;
const DESC = "How three Pikachu billboard trucks on the Embarcadero ended my five-year Pokemon GO hiatus.";
tpl = tpl.split(DESC).join('{{DESCRIPTION}}');
tpl = tpl.split('https://intellecttheory.com/posts/current-addiction-pokemon-go').join('https://intellecttheory.com/posts/{{SLUG}}');
tpl = tpl.split('Getting Back Into Pokémon Go in 2026: Events, Community & Tips | Intellect Theory').join('{{SEO_TITLE_FULL}}');
tpl = tpl.split('Current Addiction: Pok&eacute;mon Go — Intellect Theory').join('{{TWITTER_TITLE}}');
tpl = tpl.split('https://intellecttheory.com/images/pogo-pikachu.jpg').join('https://intellecttheory.com/images/{{COVER_IMAGE}}');
tpl = tpl.split('<span class="tag">Gaming</span>').join('<span class="tag">{{TAG}}</span>');
tpl = tpl.split('<h1>Current Addiction: Pok&eacute;mon Go</h1>').join('<h1>{{TITLE}}</h1>');
tpl = tpl.split('<time datetime="2026-10-07">October 7, 2026</time>').join('<time datetime="{{DATE_ISO}}">{{DATE_HUMAN}}</time>');

// --- ARTICLE BODY: from after </time> up to the closing </article>
const bodyStart = tpl.indexOf('</time>\n') + '</time>\n'.length;
const bodyEnd = tpl.lastIndexOf('\n    </article>');
const bodySlice = tpl.slice(bodyStart, bodyEnd); // verify it's the expected chunk
if (!bodySlice.includes('post-links') || !bodySlice.includes('ADD MORE LATER')) {
  throw new Error('body slice did not capture the expected content');
}
tpl = tpl.slice(0, bodyStart) + '{{ARTICLE_BODY}}' + tpl.slice(bodyEnd);

// --- COMMENTS SECTION -> fragments.js constant (with %SLUG% token)
const cStart = tpl.indexOf('    <!-- ================= COMMENTS =================');
const cEndMarker = '    <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>';
const cEnd = tpl.indexOf(cEndMarker) + cEndMarker.length;
let commentsBlock = tpl.slice(cStart, cEnd);
commentsBlock = commentsBlock.split('data-post="current-addiction-pokemon-go"').join('data-post="%SLUG%"');
tpl = tpl.slice(0, cStart) + '{{COMMENTS_SECTION}}' + tpl.slice(cEnd);

// --- RELATED POSTS section -> placeholder (cards are regenerated from data)
const rStart = tpl.indexOf('    <section class="related-posts">');
const rEndMarker = '  <footer id="contact" class="site-footer">';
const rEnd = tpl.indexOf(rEndMarker);
const relatedSrc = tpl.slice(rStart, rEnd);
if (!relatedSrc.includes('related-grid')) throw new Error('related slice missed');
tpl = tpl.slice(0, rStart) + '{{RELATED_SECTION}}' + tpl.slice(rEnd);

// --- TEA BADGE + ADD-MORE comment from where-ive-been (the only tea-badge post)
const wib = readFileSync(join(ROOT, 'posts/where-ive-been.html'), 'utf8');
const tStart = wib.indexOf('      <div class="tip-jar">');
const tEndMarker = '      </div>\n\n      <aside class="post-links">';
const tEnd = wib.indexOf(tEndMarker) + '      </div>'.length;
const teaBlock = wib.slice(tStart, tEnd);
if (!teaBlock.includes('tip-jar-btn')) throw new Error('tea block missed');

const addMoreComment = `      <!-- ADD MORE LATER: paste new <p>...</p> paragraphs or
           <img class="post-photo" src="../images/....jpg" alt="..." loading="lazy" decoding="async">
           lines right above this comment. Newest additions go last,
           so the page grows downward like a journal. -->`;

mkdirSync(join(ROOT, 'templates'), { recursive: true });
writeFileSync(join(ROOT, 'templates/post.html'), tpl);

const frag = `// Fragments extracted verbatim from the live site (2026-10-19). Do not hand-edit.
export const COMMENTS_BLOCK = ${JSON.stringify(commentsBlock)};
export const TEA_BLOCK = ${JSON.stringify(teaBlock)};
export const ADD_MORE_COMMENT = ${JSON.stringify(addMoreComment)};
`;
writeFileSync(join(ROOT, 'build/fragments.js'), frag);
console.log('templates/post.html + build/fragments.js written');
console.log('template length:', tpl.length);
