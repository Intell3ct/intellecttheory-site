/* ============================================================
   MY CORNER — main.js
   ------------------------------------------------------------
   Every feature below checks for its own HTML before running, so
   you can add future sections (carousel, lightbox, etc.) by just
   pasting the HTML — no JS changes needed.
   ============================================================ */

(function () {
  "use strict";

  /* ---------- photo carousel ----------
     Activates automatically when an element with [data-carousel]
     exists on the page (see the commented-out gallery section in
     index.html). Supports arrows, dots, and swipe. */
  document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
    var track = carousel.querySelector("[data-carousel-track]");
    var slides = track ? track.children.length : 0;
    if (!track || slides < 2) return;

    var dotsWrap = carousel.parentElement.querySelector("[data-carousel-dots]");
    var index = 0;

    function goTo(i) {
      index = (i + slides) % slides;
      track.style.transform = "translateX(-" + index * 100 + "%)";
      if (dotsWrap) {
        dotsWrap.querySelectorAll("button").forEach(function (d, di) {
          d.classList.toggle("active", di === index);
        });
      }
    }

    // dots
    if (dotsWrap) {
      for (var d = 0; d < slides; d++) {
        (function (di) {
          var btn = document.createElement("button");
          btn.setAttribute("aria-label", "Go to photo " + (di + 1));
          btn.addEventListener("click", function () { goTo(di); });
          dotsWrap.appendChild(btn);
        })(d);
      }
    }

    // arrows
    var prev = carousel.querySelector("[data-carousel-prev]");
    var next = carousel.querySelector("[data-carousel-next]");
    if (prev) prev.addEventListener("click", function () { goTo(index - 1); });
    if (next) next.addEventListener("click", function () { goTo(index + 1); });

    // swipe / touch
    var startX = 0;
    carousel.addEventListener("touchstart", function (e) {
      startX = e.touches[0].clientX;
    }, { passive: true });
    carousel.addEventListener("touchend", function (e) {
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) goTo(index + (dx < 0 ? 1 : -1));
    }, { passive: true });

    goTo(0);
  });

  /* ---------- hero carousel: cycles through all posts ----------
     Collects every card in #posts (newest first) and rotates the
     [data-hero-auto] feature through them: photo, tag, title, excerpt,
     date, link. Dots + arrows + swipe navigate; auto-advances every
     7.8s and pauses on hover/touch. The grid below is untouched —
     the hero is purely a highlight reel, it never hides or moves cards. */
  (function () {
    var hero = document.querySelector("[data-hero-auto]");
    var grid = document.getElementById("posts");
    if (!hero || !grid) return;
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".card:not([data-no-hero])"));
    /* skip the 2 most recent posts in the hero — they're already at the top of the grid */
    cards = cards.slice(2);
    if (!cards.length) { hero.style.display = "none"; return; }

    var slides = cards.map(function (card) {
      var img = card.querySelector(".card-media img");
      var tag = card.querySelector(".tag");
      var title = card.querySelector("h3");
      var text = card.querySelector(".card-body p");
      var link = card.querySelector(".read-more");
      return {
        src: img ? img.src : "",
        alt: img ? (img.alt || "") : "",
        tag: tag ? tag.textContent : "",
        title: title ? title.textContent : "",
        text: text ? text.textContent : "",
        date: card.getAttribute("data-date") || "",
        href: link ? link.getAttribute("href") : "#"
      };
    });

    /* controls: sliding-window dots (max 4 visible) + prev/next arrows.
       All slides still rotate; only 4 dots show, window follows idx. */
    var MAX_DOTS = 4;
    var dotsWrap = document.createElement("div");
    dotsWrap.className = "hero-dots";
    function paintDots(i) {
      dotsWrap.innerHTML = "";
      var n = Math.min(MAX_DOTS, slides.length);
      var start = Math.max(0, Math.min(i - 1, slides.length - n));
      for (var k = 0; k < n; k++) {
        (function (si) {
          var d = document.createElement("button");
          d.className = "hero-dot" + (si === i ? " active" : "");
          d.setAttribute("aria-label", "Show post " + (si + 1) + ": " + slides[si].title);
          d.addEventListener("click", function () { go(si, true); });
          dotsWrap.appendChild(d);
        })(start + k);
      }
    }
    paintDots(0);
    var prev = document.createElement("button");
    prev.className = "hero-arrow hero-prev";
    prev.setAttribute("aria-label", "Previous post");
    prev.textContent = "‹";
    var next = document.createElement("button");
    next.className = "hero-arrow hero-next";
    next.setAttribute("aria-label", "Next post");
    next.textContent = "›";
    prev.addEventListener("click", function () { go((idx - 1 + slides.length) % slides.length, true); });
    next.addEventListener("click", function () { go((idx + 1) % slides.length, true); });
    hero.appendChild(prev);
    hero.appendChild(next);
    hero.appendChild(dotsWrap);

    var heroImg = hero.querySelector(".hero-photo");
    var heroTag = hero.querySelector(".tag");
    var heroTitle = hero.querySelector("h1");
    var heroText = hero.querySelector(".hero-overlay p");
    var heroTime = hero.querySelector(".hero-overlay time");
    var heroLink = hero.querySelector(".hero-overlay .read-more");

    var idx = 0, timer = null, tx0 = null;
    function render(i) {
      var s = slides[i];
      hero.classList.add("hero-fade");
      setTimeout(function () {
        if (heroImg) {
          if (s.src) { heroImg.src = s.src; heroImg.alt = s.alt; heroImg.style.display = ""; }
          else { heroImg.style.display = "none"; }
        }
        hero.classList.toggle("hero--text", !s.src);
        if (heroTag) heroTag.textContent = s.tag;
        if (heroTitle) heroTitle.textContent = s.title;
        if (heroText) heroText.textContent = s.text;
        if (heroTime) {
          heroTime.textContent = s.date;
          heroTime.style.display = s.date ? "" : "none";
        }
        if (heroLink) heroLink.href = s.href;
        hero.classList.remove("hero-fade");
      }, 160);
      paintDots(i);
    }
    function go(i, manual) {
      idx = (i + slides.length) % slides.length;
      render(idx);
      if (manual) restart();
    }
    function restart() {
      if (timer) clearInterval(timer);
      timer = null;
      if (slides.length > 1) {
        timer = setInterval(function () { go(idx + 1, false); }, 6630);
      }
    }
    hero.addEventListener("mouseenter", function () {
      if (timer) { clearInterval(timer); timer = null; }
    });
    hero.addEventListener("mouseleave", restart);
    hero.addEventListener("touchstart", function (e) {
      if (timer) { clearInterval(timer); timer = null; }
      tx0 = e.touches[0].clientX;
    }, { passive: true });
    hero.addEventListener("touchend", function (e) {
      if (tx0 !== null) {
        var dx = e.changedTouches[0].clientX - tx0;
        if (Math.abs(dx) > 40) {
          go(idx + (dx < 0 ? 1 : -1), true);
          tx0 = null;
          return;
        }
      }
      tx0 = null;
      restart();
    });

    render(0);
    restart();
  })();

  /* ---------- category pills: filter + navigate ----------
     Clicking a pill (All / Photos / Thoughts / Travel / Gaming / Anime) filters the
     post grid to that category, scrolls to it, and sets the URL hash so
     sections are linkable (e.g. intellecttheory.com/#gaming). Loading the
     page with a category hash applies that filter automatically.
     Each card's .tag text decides which category it belongs to, so new
     cards are picked up automatically. The hero card is skipped. */
  (function () {
    var pills = document.querySelectorAll(".categories .pill");
    var grid = document.getElementById("posts");
    if (!pills.length || !grid) return;

    function applyFilter(cat, scroll) {
      pills.forEach(function (p) {
        p.classList.toggle("active", p.textContent.trim().toLowerCase() === cat);
      });
      grid.querySelectorAll(".card").forEach(function (card) {
        var tag = card.querySelector(".tag");
        var cardCat = tag ? tag.textContent.trim().toLowerCase() : "";
        card.style.display = (cat === "all" || cardCat === cat) ? "" : "none";
      });
      if (scroll) {
        grid.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    pills.forEach(function (pill) {
      pill.addEventListener("click", function () {
        var cat = pill.textContent.trim().toLowerCase();
        applyFilter(cat, true);
        try {
          history.replaceState(null, "", cat === "all" ? "#" : "#" + cat);
        } catch (e) {}
      });
    });

    /* deep-link: honor #photos / #thoughts / #travel / #gaming on load */
    var hash = (location.hash || "").replace("#", "").toLowerCase();
    if (hash) {
      var known = Array.prototype.map.call(pills, function (p) {
        return p.textContent.trim().toLowerCase();
      });
      if (known.indexOf(hash) !== -1) applyFilter(hash, false);
    }
  })();

  /* ---------- comments (Thoughts posts only) ----------
     Threaded comments with voting, powered by the comments Worker API.
     Readers need no account: avatars are generated from name initials,
     one vote per comment is remembered in localStorage, and Turnstile
     keeps bots out invisibly. The section only exists on Thoughts posts. */
  (function () {
    var section = document.querySelector("[data-comments]");
    if (!section) return;

    /* Turnstile can't verify on the Google Translate proxy domain,
       so show a friendly note instead of a broken form. */
    if (location.hostname.endsWith(".translate.goog")) {
      section.innerHTML = '<div class="translate-note"><p>Para dejar un comentario, <a href="#" id="back-to-en">cambia a la versión en inglés</a>.</p></div>';
      var backBtn = document.getElementById("back-to-en");
      if (backBtn) backBtn.addEventListener("click", function (e) {
        e.preventDefault();
        var url = new URL(location.href);
        url.hostname = location.hostname.slice(0, -".translate.goog".length).replace(/-/g, ".");
        ["_x_tr_sl","_x_tr_tl","_x_tr_hl","_x_tr_pto"].forEach(function (p) { url.searchParams.delete(p); });
        location.href = url.toString();
      });
      return;
    }

    var slug = section.getAttribute("data-post");
    var api = section.getAttribute("data-api");
    var list = section.querySelector("[data-comment-list]");
    var form = section.querySelector("[data-comment-form]");
    if (!slug || !api || !list || !form) return;

    var sitekey = (function () {
      var w = form.querySelector(".cf-turnstile");
      return w ? w.getAttribute("data-sitekey") : "";
    })();

    /* one vote per comment per browser, remembered locally */
    var myVotes = {};
    try { myVotes = JSON.parse(localStorage.getItem("it-votes") || "{}"); } catch (e) {}
    function saveVotes() {
      try { localStorage.setItem("it-votes", JSON.stringify(myVotes)); } catch (e) {}
    }
    var reported = {};
    try { reported = JSON.parse(localStorage.getItem("it-reported") || "{}"); } catch (e) {}

    function esc(s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": '&#39;' }[c];
      });
    }
    function timeAgo(ts) {
      var s = Math.floor((Date.now() - ts) / 1000);
      if (s < 60) return "just now";
      var m = Math.floor(s / 60);
      if (m < 60) return m + (m === 1 ? " minute ago" : " minutes ago");
      var h = Math.floor(m / 60);
      if (h < 24) return h + (h === 1 ? " hour ago" : " hours ago");
      var d = Math.floor(h / 24);
      if (d < 30) return d + (d === 1 ? " day ago" : " days ago");
      var mo = Math.floor(d / 30);
      if (mo < 12) return mo + (mo === 1 ? " month ago" : " months ago");
      var y = Math.floor(mo / 12);
      return y + (y === 1 ? " year ago" : " years ago");
    }
    /* deterministic pastel avatar color per name */
    var PALETTE = ["#aed6c9", "#f2c9a0", "#c3b8e6", "#f5a8b8", "#a8c8ec", "#f7dd8b", "#b8e0a8"];
    function avatarBg(name) {
      var h = 0;
      for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
      return PALETTE[h % PALETTE.length];
    }
    function initials(name) {
      var parts = name.trim().split(/\s+/);
      var a = parts[0] ? parts[0][0] : "";
      var b = parts.length > 1 ? parts[parts.length - 1][0] : "";
      return (a + b).toUpperCase() || "?";
    }

    var UP = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"/></svg>';
    var DOWN = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';

    function commentHTML(c) {
      var vote = myVotes[c.id] || 0;
      var kids = (c._kids || []).map(commentHTML).join("");
      var kidsWrap = kids ? '<div class="comment-children">' + kids + '</div>' : "";
      var replyForm = '<div class="reply-form-wrap" hidden>' +
        '<form class="reply-form" data-reply-to="' + esc(c.id) + '">' +
        '<input type="text" name="name" required maxlength="50" autocomplete="name" placeholder="Your name">' +
        '<textarea name="text" required maxlength="2000" rows="3" placeholder="Write a reply…"></textarea>' +
        '<div class="cf-turnstile-reply"></div>' +
        '<div class="reply-form-row"><button type="submit">Reply</button>' +
        '<button type="button" class="reply-cancel">Cancel</button></div>' +
        '</form></div>';
      var reportedMsg = reported[c.id]
        ? '<span class="report-thanks">Thanks — we\'ll take a look.</span>'
        : '<button type="button" class="comment-report" data-report="' + esc(c.id) + '">Report</button>';
      var isAdmin = c.admin === true;
      var adminBadge = isAdmin ? ' <span class="admin-badge"><span class="pokeball" aria-hidden="true"></span>Admin</span>' : '';
      return '<article class="comment' + (isAdmin ? " comment-admin" : "") + '" data-comment-id="' + esc(c.id) + '">' +
        '<div class="comment-avatar" style="background:' + avatarBg(c.name) + '">' + esc(initials(c.name)) + '</div>' +
        '<div class="comment-body">' +
        '<div class="comment-meta"><b>' + esc(c.name) + '</b>' + adminBadge + '<time>' + esc(timeAgo(c.ts)) + '</time></div>' +
        '<p class="comment-text">' + esc(c.text).replace(/\n/g, "<br>") + '</p>' +
        '<div class="comment-actions">' +
        '<button type="button" class="vote vote-up' + (vote === 1 ? " active" : "") + '" data-vote="1" data-id="' + esc(c.id) + '" aria-label="Upvote">' + UP + '</button>' +
        '<span class="vote-score">' + (c.score || 0) + '</span>' +
        '<button type="button" class="vote vote-down' + (vote === -1 ? " active" : "") + '" data-vote="-1" data-id="' + esc(c.id) + '" aria-label="Downvote">' + DOWN + '</button>' +
        '<button type="button" class="comment-reply" data-reply="' + esc(c.id) + '">Reply</button>' +
        reportedMsg +
        '</div>' + replyForm + '</div></article>' + kidsWrap;
    }

    function render(comments) {
      if (!comments.length) {
        list.innerHTML = '<p class="comments-empty">No comments yet — say something nice.</p>';
        return;
      }
      /* build the thread tree: one level of nesting */
      var byId = {}, roots = [];
      comments.forEach(function (c) { byId[c.id] = c; c._kids = []; });
      comments.forEach(function (c) {
        var p = c.parent_id && byId[c.parent_id];
        if (p) {
          /* attach to the top-level ancestor to keep threads shallow */
          var top = p;
          while (top.parent_id && byId[top.parent_id]) top = byId[top.parent_id];
          if (top.id !== c.id) top._kids.push(c); else roots.push(c);
        } else {
          roots.push(c);
        }
      });
      roots.sort(function (a, b) { return b.ts - a.ts; });
      list.innerHTML = roots.map(commentHTML).join("");
    }

    function load() {
      fetch(api + "?post=" + encodeURIComponent(slug))
        .then(function (r) { return r.json(); })
        .then(function (d) { render(d.comments || []); })
        .catch(function () {
          list.innerHTML = '<p class="comments-empty">Could not load comments.</p>';
        });
    }

    function postComment(payload, done) {
      fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (res) {
          if (res.ok) { done(null); }
          else { done(res.d.error || "could not post your comment."); }
        })
        .catch(function () { done("could not post your comment."); });
    }

    /* top-level form */
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.querySelector('[name="name"]').value.trim();
      var text = form.querySelector('[name="text"]').value.trim();
      var tokenField = form.querySelector('[name="cf-turnstile-response"]');
      var token = tokenField ? tokenField.value : "";
      if (!name || !text) return;
      if (!token) {
        alert("Please wait a moment for the bot check to finish, then try again.");
        return;
      }
      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      postComment({ post: slug, name: name, text: text, token: token }, function (err) {
        btn.disabled = false;
        if (window.turnstile) { try { turnstile.reset(); } catch (err2) {} }
        if (err) { alert("Sorry — " + err + " Please try again."); return; }
        form.reset();
        load();
      });
    });

    /* delegated clicks: votes, reply toggles, reports */
    list.addEventListener("click", function (e) {
      var voteBtn = e.target.closest("[data-vote]");
      if (voteBtn) {
        var id = voteBtn.getAttribute("data-id");
        var want = parseInt(voteBtn.getAttribute("data-vote"), 10);
        var prev = myVotes[id] || 0;
        var next = (prev === want) ? 0 : want; /* click again to retract */
        var scoreEl = voteBtn.parentElement.querySelector(".vote-score");
        fetch(api + "/vote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ post: slug, id: id, delta: next, prev: prev }),
        })
          .then(function (r) { return r.json(); })
          .then(function (d) {
            if (typeof d.score === "number" && scoreEl) scoreEl.textContent = d.score;
            if (next === 0) delete myVotes[id]; else myVotes[id] = next;
            saveVotes();
            var wrap = voteBtn.parentElement;
            wrap.querySelector(".vote-up").classList.toggle("active", next === 1);
            wrap.querySelector(".vote-down").classList.toggle("active", next === -1);
          })
          .catch(function () {});
        return;
      }
      var replyBtn = e.target.closest("[data-reply]");
      if (replyBtn) {
        var article = replyBtn.closest(".comment");
        var wrapEl = article.querySelector(".reply-form-wrap");
        var opening = wrapEl.hidden;
        /* close any other open reply forms */
        list.querySelectorAll(".reply-form-wrap").forEach(function (w) { w.hidden = true; });
        wrapEl.hidden = !opening;
        if (opening && sitekey && window.turnstile) {
          var slot = wrapEl.querySelector(".cf-turnstile-reply");
          slot.innerHTML = "";
          try { turnstile.render(slot, { sitekey: sitekey }); } catch (err3) {}
          var input = wrapEl.querySelector('[name="name"]');
          if (input) input.focus();
        }
        return;
      }
      var cancelBtn = e.target.closest(".reply-cancel");
      if (cancelBtn) {
        cancelBtn.closest(".reply-form-wrap").hidden = true;
        return;
      }
      var reportBtn = e.target.closest("[data-report]");
      if (reportBtn) {
        var rid = reportBtn.getAttribute("data-report");
        if (!confirm("Report this comment for review?")) return;
        fetch(api + "/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ post: slug, id: rid }),
        }).then(function () {
          reported[rid] = true;
          try { localStorage.setItem("it-reported", JSON.stringify(reported)); } catch (err4) {}
          var span = document.createElement("span");
          span.className = "report-thanks";
          span.textContent = "Thanks — we'll take a look.";
          reportBtn.replaceWith(span);
        }).catch(function () {});
        return;
      }
    });

    /* reply form submits (delegated, forms are rendered dynamically) */
    list.addEventListener("submit", function (e) {
      var rform = e.target.closest(".reply-form");
      if (!rform) return;
      e.preventDefault();
      var parentId = rform.getAttribute("data-reply-to");
      var name = rform.querySelector('[name="name"]').value.trim();
      var text = rform.querySelector('[name="text"]').value.trim();
      var tokenField = rform.querySelector('[name="cf-turnstile-response"]');
      var token = tokenField ? tokenField.value : "";
      if (!name || !text) return;
      if (!token) {
        alert("Please wait a moment for the bot check to finish, then try again.");
        return;
      }
      var btn = rform.querySelector('button[type="submit"]');
      btn.disabled = true;
      postComment({ post: slug, parent_id: parentId, name: name, text: text, token: token }, function (err) {
        btn.disabled = false;
        if (err) { alert("Sorry — " + err + " Please try again."); return; }
        load();
      });
    });

    load();
  })();


  /* ---------- back to top: footer logo scrolls up ----------
     The footer logo doubles as a scroll-to-top button. */
  (function () {
    document.addEventListener("click", function (e) {
      if (e.target.closest("[data-scroll-top]")) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  })();

  /* ============================================================
     News sidebars — rotating headlines.
     Gaming News <- Worker /api/news ; Sports <- Worker /api/sports.
     Shows 4 at a time, rotates every 7s with dots. A widget hides
     itself quietly if its feed is unreachable.
     ============================================================ */
  (function () {
    var WORKER = "https://intellecttheory-comments.ajsrhs.workers.dev";
    var PER_PAGE = 4, ROTATE_MS = 7000;

    function esc(s) {
      return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    }
    function ago(ts) {
      if (!ts) return "";
      var m = Math.max(1, Math.round((Date.now() - ts) / 60000));
      if (m < 60) return m + "m ago";
      var h = Math.round(m / 60);
      if (h < 24) return h + "h ago";
      return Math.round(h / 24) + "d ago";
    }

    function initWidget(listId, dotsId, apiPath) {
      var list = document.getElementById(listId);
      if (!list) return;
      var dots = document.getElementById(dotsId);

      var onDotsRendered = null;
      function render(items, page) {
        var html = "";
        var slice = items.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);
        slice.forEach(function (n) {
          var thumb = n.img
            ? '<img class="news-thumb" src="' + esc(n.img) + '" alt="" loading="lazy">'
            : '<span class="news-thumb-fallback">' + esc((n.source || "?").charAt(0)) + "</span>";
          html += '<a class="news-item" href="' + esc(n.link) + '" target="_blank" rel="noopener">'
            + thumb
            + '<div><h4>' + esc(n.title) + '</h4>'
            + '<span class="news-meta"><b>' + esc(n.source) + "</b> &middot; " + esc(ago(n.ts)) + "</span></div></a>";
        });
        list.innerHTML = html;
        if (dots) {
          var pages = Math.ceil(items.length / PER_PAGE), dh = "";
          for (var i = 0; i < pages; i++) dh += '<button type="button" data-page="' + i + '" class="' + (i === page ? "on" : "") + '" aria-label="Show stories ' + (i * PER_PAGE + 1) + '-' + Math.min(items.length, (i + 1) * PER_PAGE) + '"></button>';
          dots.innerHTML = dh;
          if (onDotsRendered) onDotsRendered();
        }
      }

      function start(items) {
        var page = 0, pages = Math.ceil(items.length / PER_PAGE), timer = null;
        function show(p) {
          list.classList.add("fading");
          setTimeout(function () {
            page = p;
            render(items, page);
            list.classList.remove("fading");
          }, 350);
        }
        function goTo(p) {
          if (p === page) return;
          show(p);
          if (timer) { clearInterval(timer); timer = arm(); }
        }
        function arm() {
          return setInterval(function () { show((page + 1) % pages); }, ROTATE_MS);
        }
        onDotsRendered = function () {
          Array.prototype.forEach.call(dots.children, function (b) {
            b.addEventListener("click", function () { goTo(parseInt(b.getAttribute("data-page"), 10)); });
          });
        };
        /* swipe left/right to change pages (mobile-friendly, dots stay clickable) */
        var tx0 = null;
        list.addEventListener("touchstart", function (e) {
          if (e.touches.length === 1) tx0 = e.touches[0].clientX;
        }, { passive: true });
        list.addEventListener("touchend", function (e) {
          if (tx0 == null || !e.changedTouches.length) return;
          var dx = e.changedTouches[0].clientX - tx0;
          tx0 = null;
          if (Math.abs(dx) < 40) return;
          if (dx < 0) goTo((page + 1) % pages);
          else goTo((page - 1 + pages) % pages);
        }, { passive: true });
        render(items, 0);
        if (pages < 2) { onDotsRendered = null; return; }
        timer = arm();
      }

      (async function init() {
        var items = null;
        try {
          var r = await fetch(WORKER + apiPath, { cache: "no-store" });
          if (r.ok) {
            var d = await r.json();
            if (d && d.items && d.items.length) items = d.items;
          }
        } catch (e) { /* worker unreachable */ }
        if (!items || !items.length) {
          list.innerHTML = '<p class="news-empty">No stories right now.</p>';
          return;
        }
        start(items);
      })();
    }

    initWidget("news-list", "news-dots", "/api/news");
    initWidget("sports-list", "sports-dots", "/api/sports");
  })();

  /* ============================================================
     FUTURE FEATURES — paste new guarded blocks below this line.
     Pattern: query for your element, return early if it is missing.
     Example:
       var el = document.querySelector("[data-my-widget]");
       if (!el) return;
       ... your code ...
     ============================================================ */

  /* ---------- AJ's personal note (loads from note.html) ---------- */
  (function () {
    var el = document.getElementById("aj-note-body");
    if (!el) return;
    fetch("note.html")
      .then(function (r) { return r.text(); })
      .then(function (html) { el.innerHTML = html; })
      .catch(function () { el.innerHTML = ""; });
  })();

  /* ---------- language toggle (EN <-> ES via Google Translate proxy) ---------- */  (function () {
    var btn = document.getElementById("lang-toggle");
    if (!btn) return;
    var PROXY_SUFFIX = ".translate.goog";
    var isTranslated = location.hostname.endsWith(PROXY_SUFFIX);

    function originalHost() {
      return location.hostname.slice(0, -PROXY_SUFFIX.length).replace(/-/g, ".");
    }
    function translatedHost() {
      return location.hostname.replace(/\./g, "-") + PROXY_SUFFIX;
    }

    // Set initial label
    btn.textContent = isTranslated ? "EN" : "ES";

    btn.addEventListener("click", function () {
      if (isTranslated) {
        // Go back to original: strip proxy host, drop translate params
        var url = new URL(location.href);
        url.hostname = originalHost();
        url.searchParams.delete("_x_tr_sl");
        url.searchParams.delete("_x_tr_tl");
        url.searchParams.delete("_x_tr_hl");
        url.searchParams.delete("_x_tr_pto");
        location.href = url.toString();
      } else {
        // Go to Spanish via translate proxy
        var tUrl = new URL(location.href);
        tUrl.hostname = translatedHost();
        tUrl.searchParams.set("_x_tr_sl", "en");
        tUrl.searchParams.set("_x_tr_tl", "es");
        tUrl.searchParams.set("_x_tr_hl", "es");
        location.href = tUrl.toString();
      }
    });
  })();
})();

/* photo carousel: arrows, dots, swipe (scroll-snap) */
document.querySelectorAll('.photo-carousel').forEach(function (car) {
  var track = car.querySelector('.pc-track');
  var slides = Array.prototype.slice.call(car.querySelectorAll('.pc-slide'));
  var dots = Array.prototype.slice.call(car.querySelectorAll('.pc-dot'));
  if (!track || !slides.length) return;
  function slideX(i) {
    var r = slides[i].getBoundingClientRect(), t = track.getBoundingClientRect();
    return r.left - t.left + track.scrollLeft;
  }
  function current() {
    var best = 0, bestDist = Infinity;
    slides.forEach(function (s, i) {
      var d = Math.abs(slideX(i) - track.scrollLeft);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    return best;
  }
  function go(i) {
    i = Math.max(0, Math.min(i, slides.length - 1));
    track.scrollTo({ left: slideX(i), behavior: 'smooth' });
  }
  function paint() {
    var i = current();
    dots.forEach(function (d, j) { d.classList.toggle('is-active', j === i); });
  }
  var prev = car.querySelector('.pc-prev'), next = car.querySelector('.pc-next');
  if (prev) prev.addEventListener('click', function () { go(current() - 1); });
  if (next) next.addEventListener('click', function () { go(current() + 1); });
  dots.forEach(function (d) {
    d.addEventListener('click', function () { go(parseInt(d.getAttribute('data-slide'), 10)); });
  });
  track.addEventListener('scroll', paint, { passive: true });
  paint();
});

/* image lightbox: click any post/gallery photo to view full size */
(function () {
  var lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-label', 'Photo viewer');
  var lbImg = document.createElement('img');
  lb.appendChild(lbImg);
  document.body.appendChild(lb);
  function open(src, alt) {
    lbImg.src = src;
    lbImg.alt = alt || '';
    lb.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    lb.classList.remove('is-open');
    document.body.style.overflow = '';
    lbImg.removeAttribute('src');
  }
  lb.addEventListener('click', close);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lb.classList.contains('is-open')) close();
  });
  document.querySelectorAll('article.post img, .photo-grid img').forEach(function (img) {
    img.classList.add('zoomable');
    img.addEventListener('click', function () { open(img.currentSrc || img.src, img.alt); });
  });
})();

/* newsletter slide-in: appears at 60% scroll on post pages, once per visitor */
(function () {
  // only on post pages (have article.post)
  if (!document.querySelector('article.post')) return;
  if (localStorage.getItem('nl-slide-dismissed')) return;

  var slide = document.createElement('div');
  slide.className = 'nl-slidein';
  slide.innerHTML =
    '<button class="nl-slide-close" aria-label="Close">&times;</button>' +
    '<h3>The Monthly Drop</h3>' +
    '<p>One email a month. New posts, photos, and what I\'m into.</p>' +
    '<form class="nl-slide-form" action="https://buttondown.email/api/emails/embed-subscribe/intellecttheory" method="post" target="_blank">' +
    '<input type="email" name="email" placeholder="your@email.com" required aria-label="Email address">' +
    '<button type="submit">Subscribe</button>' +
    '</form>';
  document.body.appendChild(slide);

  function dismiss(permanent) {
    slide.classList.remove('is-visible');
    if (permanent) {
      try { localStorage.setItem('nl-slide-dismissed', '1'); } catch (e) {}
    }
  }
  slide.querySelector('.nl-slide-close').addEventListener('click', function () { dismiss(true); });
  slide.querySelector('.nl-slide-form').addEventListener('submit', function () {
    setTimeout(function () { dismiss(true); }, 500);
  });

  var shown = false;
  function onScroll() {
    if (shown) return;
    var h = document.documentElement;
    var scrolled = (h.scrollTop + window.innerHeight) / h.scrollHeight;
    if (scrolled >= 0.6) {
      shown = true;
      slide.classList.add('is-visible');
      window.removeEventListener('scroll', onScroll, { passive: true });
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
})();

  /* ============================================================
     Anime Schedule widget (static, Fall 2026).
     15 shows, 4 per page, rotates with dots like news/sports.
     ============================================================ */
  (function () {
    var ANIME = [
      { t: "The Apothecary Diaries S3", d: "Fridays", l: "https://animeschedule.net/anime/kusuriya-no-hitorigoto-zoku-hen" },
      { t: "Black Clover S2", d: "Saturdays", l: "https://animeschedule.net/anime/black-clover-2nd-season", w: 1 },
      { t: "A Returner's Magic Should Be Special S2", d: "Wednesdays", l: "https://animeschedule.net/anime/kikansha-no-mahou-wa-tokubetsu-desu-season-2", w: 1 },
      { t: "The Detective Is Already Dead S2", d: "Wednesdays", l: "https://animeschedule.net/anime/tantei-wa-mou-shindeiru-season-2" },
      { t: "OVERGEARED", d: "Sundays", l: "https://animeschedule.net/anime/overgeared" },
      { t: "Tougen Anki: Nikko Kegon no Taki-hen", d: "Fridays", l: "https://animeschedule.net/anime/tougen-anki-nikko-kegon-no-taki-hen", w: 1 },
      { t: "The Iceblade Sorcerer S2", d: "Thursdays", l: "https://animeschedule.net/anime/hyouken-no-mahou-ga-sekai-wo-suberu-2nd-season", w: 1 },
      { t: "The Wall of Ice S2", d: "Thursdays", l: "https://animeschedule.net/anime/koori-no-jouheki-2nd-season" },
      { t: "Seitokai ni mo Ana wa Aru!", d: "Saturdays", l: "https://animeschedule.net/anime/seitokai-ni-mo-ana-wa-aru" },
      { t: "PSYREN", d: "Mondays", l: "https://animeschedule.net/anime/psyren" },
      { t: "Nia Liston: The Merciless Maiden", d: "Tuesdays", l: "https://animeschedule.net/anime/kyouran-reijou-nia-liston" },
      { t: "Romelia Senki", d: "Saturdays", l: "https://animeschedule.net/anime/romelia-senki" },
      { t: "Tensei Goblin dakedo Shitsumon Aru?", d: "Mondays", l: "https://animeschedule.net/anime/tensei-goblin-dakedo-shitsumon-aru", w: 1 },
      { t: "The World's Strongest Witch", d: "Wednesdays", l: "https://animeschedule.net/anime/sekai-saikyou-no-majo-hajimemashita", w: 1 },
      { t: "Shinja Zero no Megami-sama", d: "Sundays", l: "https://animeschedule.net/anime/shinja-zero-no-megami-sama-to-hajimeru-isekai-kouryaku" }
    ];
    var PER_PAGE = 4, ROTATE_MS = 7000;
    var list = document.getElementById("anime-list");
    var dots = document.getElementById("anime-dots");
    if (!list) return;

    function esc(s) {
      return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    }

    function render(page) {
      var html = "";
      ANIME.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE).forEach(function (a) {
        var watching = a.w ? ' anime-watching' : '';
        html += '<a class="news-item' + watching + '" href="' + esc(a.l) + '" target="_blank" rel="noopener">'
          + '<span class="news-thumb-fallback">' + esc(a.t.charAt(0)) + '</span>'
          + '<div><h4>' + esc(a.t) + '</h4>'
          + '<span class="news-meta">Airs <b>' + esc(a.d) + '</b></span></div></a>';
      });
      list.innerHTML = html;
      if (dots) {
        var pages = Math.ceil(ANIME.length / PER_PAGE), dh = "";
        for (var i = 0; i < pages; i++) dh += '<button type="button" data-page="' + i + '" class="' + (i === page ? "on" : "") + '" aria-label="Show anime ' + (i * PER_PAGE + 1) + '-' + Math.min(ANIME.length, (i + 1) * PER_PAGE) + '"></button>';
        dots.innerHTML = dh;
        Array.prototype.forEach.call(dots.children, function (b) {
          b.addEventListener("click", function () {
            show(parseInt(b.getAttribute("data-page"), 10));
            if (timer) { clearInterval(timer); timer = arm(); }
          });
        });
      }
    }

    var page = 0, timer = null;
    function show(p) {
      list.classList.add("fading");
      setTimeout(function () {
        page = p;
        render(page);
        list.classList.remove("fading");
      }, 350);
    }
    function arm() {
      return setInterval(function () { show((page + 1) % Math.ceil(ANIME.length / PER_PAGE)); }, ROTATE_MS);
    }

    render(0);
    timer = arm();

    /* pause on hover/touch like the other widgets */
    list.addEventListener("mouseenter", function () { if (timer) clearInterval(timer); });
    list.addEventListener("mouseleave", function () { timer = arm(); });
  })();

  /* mobile show more button */
  (function () {
    var btn = document.getElementById("showMoreBtn");
    var grid = document.getElementById("posts");
    if (!btn || !grid) return;
    btn.addEventListener("click", function () {
      grid.classList.add("show-all");
    });
  })();

  /* site search */
  (function () {
    var input = document.getElementById("site-search");
    var results = document.getElementById("search-results");
    if (!input || !results) return;
    var index = null;

    function esc(s) {
      return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    }

    fetch("js/search-index.json")
      .then(function (r) { return r.json(); })
      .then(function (data) { index = data; })
      .catch(function () { index = []; });

    function doSearch(q) {
      q = q.trim().toLowerCase();
      if (!q || !index) { results.hidden = true; return; }
      var hits = index.filter(function (p) {
        return (p.title + " " + p.tag + " " + p.text).toLowerCase().indexOf(q) !== -1;
      }).slice(0, 8);
      if (!hits.length) {
        results.innerHTML = '<p class="search-no-results">No posts found.</p>';
      } else {
        results.innerHTML = hits.map(function (p) {
          var img = p.img ? '<img src="' + esc(p.img) + '" alt="" loading="lazy">' : '';
          return '<a class="search-result" href="' + esc(p.url) + '">'
            + img
            + '<span><span class="sr-tag">' + esc(p.tag) + '</span>'
            + '<span class="sr-title">' + esc(p.title) + '</span></span></a>';
        }).join("");
      }
      results.hidden = false;
    }

    var debounce = null;
    input.addEventListener("input", function () {
      clearTimeout(debounce);
      debounce = setTimeout(function () { doSearch(input.value); }, 200);
    });
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".search-wrap")) results.hidden = true;
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { results.hidden = true; input.blur(); }
    });
  })();
