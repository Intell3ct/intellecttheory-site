RICO RAMOS — personal blog (ricoramos.com)
=============================================

WHAT'S INSIDE
  index.html          The homepage. Post cards live here.
  posts/              One page per post. _template.html is the blank
                      to copy when you make a new post.
  css/styles.css      All styling. Change the colors/fonts at the top
                      under "VIBE CONTROL" to restyle everything.
  js/main.js          Carousel code (runs only when you add one) plus
                      room for future features.
  images/             Put your photos here.

HOW TO ADD A POST (it gets its own page)
  Every post has two parts: a card on the homepage and its own
  page under posts/. To add one:
  1. Copy posts/_template.html to posts/my-new-post.html
     (lowercase, dashes instead of spaces). Follow the
     instructions inside: title, tag, date, photos, words.
     To ADD to an existing post later, just open its page and
     paste new paragraphs/photos above the ADD MORE comment.
  2. In index.html, find the marker:  NEW POSTS GO HERE
     Copy one full "card" block (from CARD START to CARD END;
     use the "text-only" block for a words-only post) and paste
     it right after the marker. Newest post goes on top — it
     automatically becomes the big featured header.
  3. In that card, change the image, date badge, title, paragraph,
     and the "Read more" link to point at posts/my-new-post.html.
     Also set data-date="Month D, YYYY" on the <article> tag (the
     header reads the date from there).
  4. Drop your photo files into images/ first, then save. Done.

  TIP: after you edit css/styles.css or js/main.js, bump the
  ?v= number in those links (index.html and posts/*.html) up by
  one (?v=2 to ?v=3, ?v=3 to ?v=4...). It defeats stale caching
  so visitors see the new styles and features right away.

  The category pills (All / Photos / Thoughts / Travel) filter
  the homepage grid. A card's tag text decides its category, so
  new cards are picked up automatically — no code changes needed.

  SEO (always applied): every page has a unique <title>, a 1-2
  sentence meta description, a canonical URL pointing at
  https://intellecttheory.com (the preferred domain — both domains
  serve the same content), and Open Graph + Twitter Card tags so
  links shared on Facebook/Instagram/X show a title, description
  and photo. robots.txt and sitemap.xml live in the site root —
  add new post pages to sitemap.xml when you publish them.

  COMMENTS (Thoughts posts only): comments run on a Cloudflare
  Worker ("intellecttheory-comments") + KV namespace ("blog-comments")
  with Turnstile bot protection (free, invisible). The comment
  section lives in posts/_template.html — keep it on Thoughts
  posts, delete it for Photos/Travel. Set data-post="slug" to the
  post's filename. Readers need no account; new comments appear
  immediately. Moderate at /admin.html with the admin token
  (stored in the Worker's ADMIN_TOKEN secret).

HOW TO TURN ON THE PHOTO CAROUSEL
  1. In index.html, find the CAROUSEL instructions near the bottom.
  2. Delete the marker line that hides the gallery section
     (the instructions tell you exactly which lines).
  3. Put your photos in images/ and update the src="images/..."
     lines inside the gallery section.
  The slideshow (arrows, dots, phone swipe) works immediately —
  the JavaScript is already in place.

HOW TO ADD MORE STUFF LATER
  - New page section? Copy the About section pattern, give it an id,
    and add a link in the <nav>.
  - New interactive feature? Add a guarded block at the bottom of
    js/main.js (there's a commented example pattern).
  - Restyle? Edit only the :root variables at the top of styles.css.

HOW TO PUT IT ON RICORAMOS.COM
  1. Log in to your web hosting control panel (cPanel, etc.).
     (If ricoramos.com has no hosting attached yet, you'll need a
     hosting plan first — ask and I can walk you through it.)
  2. Open File Manager and go to the public_html folder
     (that's the folder ricoramos.com points to).
  3. Upload everything inside this folder — index.html, the css/
     folder, the js/ folder, and the images/ folder — keeping the
     same folder structure.
  4. Visit ricoramos.com. Your site is live.
  No build step, no database, no monthly fee — plain files.
