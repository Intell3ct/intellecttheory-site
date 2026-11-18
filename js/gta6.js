/* GTA 6 pages: answers search filter + progress tracker.
   Loaded only by gta-6-answers.html and gta-6-tracker.html.
   All visitor text is rendered with textContent, never innerHTML. */
(function () {
  'use strict';

  /* ---------------- answers: search filter ---------------- */
  var search = document.getElementById('qa-search');
  if (search) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.qa-card'));
    var empty = document.getElementById('qa-empty');
    search.addEventListener('input', function () {
      var q = search.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var hit = !q || card.textContent.toLowerCase().indexOf(q) !== -1;
        card.hidden = !hit;
        if (hit) visible += 1;
      });
      if (empty) empty.hidden = visible !== 0;
    });
  }

  /* ---------- launch countdown ---------- */
  var cdTime = document.getElementById('gta-countdown-time');
  if (cdTime) {
    var cdLabel = document.getElementById('gta-countdown-label');
    var launch = Date.UTC(2026, 10, 19, 5, 0, 0); // Nov 19, 2026, midnight ET
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var tick = function () {
      var diff = launch - Date.now();
      if (diff <= 0) {
        if (cdLabel) cdLabel.textContent = 'GTA 6 is out now';
        cdTime.textContent = 'Welcome to Leonida';
        return;
      }
      var d = Math.floor(diff / 86400000);
      var h = Math.floor(diff % 86400000 / 3600000);
      var m = Math.floor(diff % 3600000 / 60000);
      var sec = Math.floor(diff % 60000 / 1000);
      cdTime.textContent = (d > 0 ? d + 'd ' : '') + pad(h) + ':' + pad(m) + ':' + pad(sec);
      setTimeout(tick, 1000);
    };
    tick();
  }

  /* ---------------- tracker ---------------- */
  var root = document.getElementById('tracker-sections');
  if (!root) return;

  var KEY = 'it-gta6-tracker-v1';

  function seed() {
    return [
      { id: 'launch', title: 'Launch Night', items: [
        { id: 'l1', text: 'Game pre-loaded', note: '', done: false },
        { id: 'l2', text: 'Storage cleared for the download', note: '', done: false },
        { id: 'l3', text: 'Console system update done', note: '', done: false },
        { id: 'l4', text: 'Controller charged', note: '', done: false }
      ] },
      { id: 'story', title: 'Story Missions', items: [] },
      { id: 'side', title: 'Side Jobs', items: [] },
      { id: 'collectibles', title: 'Collectibles', items: [] },
      { id: 'vehicles', title: 'Vehicles', items: [] }
    ];
  }

  var storageOK = true;
  var memoryFallback = null;
  function load() {
    try {
      var raw = window.localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      storageOK = false;
      if (memoryFallback) return memoryFallback;
    }
    return seed();
  }
  function save() {
    if (!storageOK) { memoryFallback = state; return; }
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      storageOK = false;
      memoryFallback = state;
      showStorageNote();
    }
  }
  function showStorageNote() {
    var note = document.getElementById('tracker-storage-note');
    if (note) note.hidden = false;
  }

  var state = load();
  if (!storageOK) showStorageNote();

  function uid() {
    return 'i' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36);
  }
  function pctOf(items) {
    if (!items.length) return 0;
    var done = items.filter(function (i) { return i.done; }).length;
    return Math.round((done / items.length) * 100);
  }

  function render() {
    root.textContent = '';
    var totalAll = 0, doneAll = 0;

    state.forEach(function (section) {
      totalAll += section.items.length;
      doneAll += section.items.filter(function (i) { return i.done; }).length;

      var sec = document.createElement('section');
      sec.className = 'tracker-section';

      var headRow = document.createElement('div');
      headRow.className = 'tracker-section-head';
      var h = document.createElement('h2');
      h.textContent = section.title;
      var pct = document.createElement('span');
      pct.className = 'tracker-pct';
      pct.textContent = pctOf(section.items) + '%';
      headRow.appendChild(h);
      headRow.appendChild(pct);
      sec.appendChild(headRow);

      var bar = document.createElement('div');
      bar.className = 'tracker-bar';
      var fill = document.createElement('div');
      fill.className = 'tracker-fill';
      fill.style.width = pctOf(section.items) + '%';
      bar.appendChild(fill);
      sec.appendChild(bar);

      var list = document.createElement('ul');
      list.className = 'tracker-list';
      section.items.forEach(function (item) {
        var li = document.createElement('li');
        li.className = 'tracker-item' + (item.done ? ' tracker-item-done' : '');

        var check = document.createElement('input');
        check.type = 'checkbox';
        check.className = 'tracker-check';
        check.checked = !!item.done;
        check.setAttribute('aria-label', 'Mark done: ' + item.text);
        check.addEventListener('change', function () {
          item.done = check.checked;
          save();
          render();
        });

        var main = document.createElement('div');
        main.className = 'tracker-item-main';
        var label = document.createElement('span');
        label.className = 'tracker-item-text';
        label.textContent = item.text;
        var note = document.createElement('input');
        note.type = 'text';
        note.className = 'tracker-note';
        note.placeholder = 'Note (optional)';
        note.maxLength = 120;
        note.value = item.note || '';
        note.setAttribute('aria-label', 'Note for: ' + item.text);
        note.addEventListener('change', function () {
          item.note = note.value;
          save();
        });
        main.appendChild(label);
        main.appendChild(note);

        var del = document.createElement('button');
        del.type = 'button';
        del.className = 'tracker-del';
        del.textContent = '×';
        del.setAttribute('aria-label', 'Remove: ' + item.text);
        del.addEventListener('click', function () {
          section.items = section.items.filter(function (i) { return i.id !== item.id; });
          save();
          render();
        });

        li.appendChild(check);
        li.appendChild(main);
        li.appendChild(del);
        list.appendChild(li);
      });
      sec.appendChild(list);

      if (!section.items.length) {
        var emptyP = document.createElement('p');
        emptyP.className = 'tracker-empty';
        emptyP.textContent = 'Nothing here yet. Add the first one below.';
        sec.appendChild(emptyP);
      }

      var form = document.createElement('form');
      form.className = 'tracker-add';
      var input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 120;
      input.placeholder = 'Add to ' + section.title + '…';
      input.setAttribute('aria-label', 'Add to ' + section.title);
      var btn = document.createElement('button');
      btn.type = 'submit';
      btn.textContent = 'Add';
      form.appendChild(input);
      form.appendChild(btn);
      form.addEventListener('submit', function (ev) {
        ev.preventDefault();
        var text = input.value.trim();
        if (!text) return;
        section.items.push({ id: uid(), text: text, note: '', done: false });
        save();
        render();
      });
      sec.appendChild(form);

      root.appendChild(sec);
    });

    var overallPct = totalAll ? Math.round((doneAll / totalAll) * 100) : 0;
    var pctEl = document.getElementById('tracker-overall-pct');
    var fillEl = document.getElementById('tracker-overall-fill');
    var countEl = document.getElementById('tracker-overall-count');
    if (pctEl) pctEl.textContent = overallPct + '%';
    if (fillEl) fillEl.style.width = overallPct + '%';
    if (countEl) countEl.textContent = doneAll + ' of ' + totalAll + ' done';
  }

  var resetBtn = document.getElementById('tracker-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      if (!window.confirm('Clear your whole tracker and start over?')) return;
      try { window.localStorage.removeItem(KEY); } catch (e) { /* storage blocked */ }
      memoryFallback = null;
      state = seed();
      save();
      render();
    });
  }

  render();


})();
