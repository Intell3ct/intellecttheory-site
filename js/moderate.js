/* Comment moderation page (moderate.html) — GitHub-session admin client. */
var API = 'https://intellecttheory-comments.ajsrhs.workers.dev/api/admin';
var token = '';
function esc(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
// Sessions come from GitHub sign-in via the CMS auth bridge. The old
// static token is retired: drop it if this browser still holds one.
try { localStorage.removeItem('aj_admin_token'); } catch (e) {}
try { token = localStorage.getItem('aj_admin_session') || ''; } catch (e) {}
(function () {
  var m = window.location.search.match(/[?&]session=([^&]+)/);
  if (m) {
    try { token = decodeURIComponent(m[1]); localStorage.setItem('aj_admin_session', token); } catch (e) {}
    try { history.replaceState(null, '', window.location.pathname); } catch (e) {}
  }
})();
document.getElementById('signout').onclick = function () {
  token = '';
  try { localStorage.removeItem('aj_admin_session'); } catch (e) {}
  document.getElementById('panel').classList.add('hidden');
  document.getElementById('signout-wrap').classList.add('hidden');
  document.getElementById('login').classList.remove('hidden');
};
if (token) load();
function load() {
  token = token || document.getElementById('token').value;
  fetch(API + '?token=' + encodeURIComponent(token))
    .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
    .then(function (res) {
      if (!res.ok) {
        try { localStorage.removeItem('aj_admin_session'); } catch (e) {}
        token = '';
        alert('Session expired or not signed in. Sign in with GitHub.');
        return;
      }
      document.getElementById('login').classList.add('hidden');
      document.getElementById('signout-wrap').classList.remove('hidden');
      var panel = document.getElementById('panel');
      panel.classList.remove('hidden');
      var posts = res.d.posts, html = '';
      Object.keys(posts).forEach(function (slug) {
        html += '<div class="post"><h2>' + esc(slug) + '</h2>';
        var list = posts[slug];
        if (!list.length) html += '<p><i>No comments.</i></p>';
        var byId = {}, roots = [];
        list.forEach(function (c) { byId[c.id] = c; c._kids = []; });
        list.forEach(function (c) {
          if (c.parent_id && byId[c.parent_id]) byId[c.parent_id]._kids.push(c);
          else roots.push(c);
        });
        function row(c, isReply) {
          var h = '<div class="comment' + (isReply ? ' reply' : '') + '"><header><b>' + esc(c.name) + '</b> — ' +
            new Date(c.ts).toLocaleString() + '</header>' +
            '<div class="meta">score ' + (c.score || 0) + ' · ' + (c.reports || 0) + ' reports' + (c.parent_id ? ' · reply' : '') + '</div><p>' +
            esc(c.text).replace(/\n/g, '<br>') + '</p>';
          if ((c.reports || 0) > 0) h += '<p class="reported">⚠ reported ' + (c.reports || 0) + '×</p>';
          h += '<button data-post="' + esc(slug) + '" data-id="' + esc(c.id) + '">Delete</button>' +
            '<button class="replybtn" data-post="' + esc(slug) + '" data-id="' + esc(c.id) + '">Reply as admin</button></div>';
          (c._kids || []).forEach(function (k) { h += row(k, true); });
          return h;
        }
        roots.forEach(function (c) { html += row(c, false); });
        html += '</div>';
      });
      panel.innerHTML = html || '<p>No comments yet.</p>';
      panel.querySelectorAll('button').forEach(function (b) {
        if (b.classList.contains('replybtn')) {
          b.onclick = function () {
            var text = prompt('Reply as admin:');
            if (!text || !text.trim()) return;
            fetch(API, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: token, action: 'reply', post: b.getAttribute('data-post'), parent_id: b.getAttribute('data-id'), text: text.trim(), name: 'AJ' }),
            }).then(load);
          };
        } else {
          b.onclick = function () {
            if (!confirm('Delete this comment?')) return;
            fetch(API, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: token, action: 'delete', post: b.getAttribute('data-post'), id: b.getAttribute('data-id') }),
            }).then(load);
          };
        }
      });
    })
    .catch(function () { alert('Could not load. Check your connection.'); });
}
