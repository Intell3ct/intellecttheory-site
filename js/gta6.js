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

  function copyItem(i) { return { id: i.id, text: i.text, note: i.note, done: i.done }; }

  /* Vehicles Rockstar has officially named so far: the Ultimate
     Edition list and the Vintage Vice City Pack, via Rockstar Support
     and the official PlayStation/Xbox stores. Each note says where
     the vehicle comes from. */
  var CONFIRMED_VEHICLES = [
    { id: 'car1', text: '’95 Grotti Cheetah', note: 'Ultimate Edition', done: false },
    { id: 'car2', text: 'Dinka Enduro', note: 'Ultimate Edition, Jason’s safehouse', done: false },
    { id: 'car3', text: 'Crest Kayak', note: 'Ultimate Edition, Jason’s safehouse', done: false },
    { id: 'car4', text: 'Shitzu Squalo', note: 'Ultimate Edition', done: false },
    { id: 'car5', text: '’67 Vapid Dominator Buggy', note: 'Ultimate Edition, Paradise Garage, Watson Bay', done: false },
    { id: 'car6', text: '’55 Vapid Stanier Sedan', note: 'Vintage Vice City Pack, buy before Nov 20', done: false }
  ];

  /* Launch-week lists confirmed by reviewers (PowerPyx's full
     walkthrough, cross-checked with IGN and Games.gg). Rockstar has
     published no mission or collectible lists itself. */

  var CONFIRMED_STORY = [
    {"id": "s1", "text": "Prologue", "note": "", "done": false},
    {"id": "s2", "text": "Gone Fishing", "note": "", "done": false},
    {"id": "s3", "text": "Gear Up", "note": "", "done": false},
    {"id": "s4", "text": "Lab Fees", "note": "", "done": false},
    {"id": "s5", "text": "Just a Scratch", "note": "", "done": false},
    {"id": "s6", "text": "Unwanted Attention", "note": "", "done": false},
    {"id": "s7", "text": "Pipework", "note": "", "done": false},
    {"id": "s8", "text": "Hey Arnold!", "note": "", "done": false},
    {"id": "s9", "text": "Island Dreams", "note": "", "done": false},
    {"id": "s10", "text": "Feng Shui", "note": "", "done": false},
    {"id": "s11", "text": "Coming Home", "note": "", "done": false},
    {"id": "s12", "text": "Clean Up After Donnie", "note": "", "done": false},
    {"id": "s13", "text": "Buck Me", "note": "", "done": false},
    {"id": "s14", "text": "Down to Earth", "note": "", "done": false},
    {"id": "s15", "text": "Deposit Cash Into BuckMe", "note": "", "done": false},
    {"id": "s16", "text": "Save for the Future", "note": "", "done": false},
    {"id": "s17", "text": "Day Release", "note": "", "done": false},
    {"id": "s18", "text": "Clear Skies", "note": "", "done": false},
    {"id": "s19", "text": "Building a Life", "note": "", "done": false},
    {"id": "s20", "text": "Swamped", "note": "", "done": false},
    {"id": "s21", "text": "Don Gone", "note": "", "done": false},
    {"id": "s22", "text": "Donnie's Lost Drugs", "note": "", "done": false},
    {"id": "s23", "text": "Recalibration", "note": "", "done": false},
    {"id": "s24", "text": "Tourist Trap", "note": "", "done": false},
    {"id": "s25", "text": "Home Sweet Home", "note": "", "done": false},
    {"id": "s26", "text": "Discharge Time", "note": "", "done": false},
    {"id": "s27", "text": "What's in the Bag?", "note": "", "done": false},
    {"id": "s28", "text": "Take Care of Jason", "note": "", "done": false},
    {"id": "s29", "text": "Overnight Charges", "note": "", "done": false},
    {"id": "s30", "text": "Just Moved In", "note": "", "done": false},
    {"id": "s31", "text": "Girl's Trip", "note": "", "done": false},
    {"id": "s32", "text": "Moses", "note": "", "done": false},
    {"id": "s33", "text": "New Look", "note": "", "done": false},
    {"id": "s34", "text": "How Do I Look?", "note": "", "done": false},
    {"id": "s35", "text": "Painkiller Supplier", "note": "", "done": false},
    {"id": "s36", "text": "Ambulance Chaser", "note": "", "done": false},
    {"id": "s37", "text": "Behind on Payments", "note": "", "done": false},
    {"id": "s38", "text": "Slam Dunk", "note": "", "done": false},
    {"id": "s39", "text": "Daily Driver", "note": "", "done": false},
    {"id": "s40", "text": "Breakfast Run", "note": "", "done": false},
    {"id": "s41", "text": "Coffee Break", "note": "", "done": false},
    {"id": "s42", "text": "Prepare for Vice City", "note": "", "done": false},
    {"id": "s43", "text": "Afternoon Delight", "note": "", "done": false},
    {"id": "s44", "text": "Checking Out", "note": "", "done": false},
    {"id": "s45", "text": "Welcome to Vice City", "note": "", "done": false},
    {"id": "s46", "text": "Dealer's Choice", "note": "", "done": false},
    {"id": "s47", "text": "Dubious Provenance", "note": "", "done": false},
    {"id": "s48", "text": "Mami Knows Best", "note": "", "done": false},
    {"id": "s49", "text": "Here, Kitty Kitty", "note": "", "done": false},
    {"id": "s50", "text": "Send Money to Lorena", "note": "", "done": false},
    {"id": "s51", "text": "Encrypted Hard Drive", "note": "", "done": false},
    {"id": "s52", "text": "Boobie Time", "note": "", "done": false},
    {"id": "s53", "text": "Meet the Heders", "note": "", "done": false},
    {"id": "s54", "text": "Car Service", "note": "", "done": false},
    {"id": "s55", "text": "Send More Money to Lorena", "note": "", "done": false},
    {"id": "s56", "text": "Top Billing", "note": "", "done": false},
    {"id": "s57", "text": "First Impressions", "note": "", "done": false},
    {"id": "s58", "text": "Crosstown Traffic", "note": "", "done": false},
    {"id": "s59", "text": "Credit Check", "note": "", "done": false},
    {"id": "s60", "text": "Clonin' Keys, Makin' GS", "note": "", "done": false},
    {"id": "s61", "text": "Ride Or Die", "note": "", "done": false},
    {"id": "s62", "text": "Raul's Next Job", "note": "", "done": false},
    {"id": "s63", "text": "Caught Slipping", "note": "", "done": false},
    {"id": "s64", "text": "Sinfrontera National Bank", "note": "", "done": false},
    {"id": "s65", "text": "Security Expert", "note": "", "done": false},
    {"id": "s66", "text": "Heist Planning", "note": "", "done": false},
    {"id": "s67", "text": "Company Property", "note": "", "done": false},
    {"id": "s68", "text": "Safe Word", "note": "", "done": false},
    {"id": "s69", "text": "The Missing Link", "note": "", "done": false},
    {"id": "s70", "text": "Cooties", "note": "", "done": false},
    {"id": "s71", "text": "Hidden Charges", "note": "", "done": false},
    {"id": "s72", "text": "Bricked Up", "note": "", "done": false},
    {"id": "s73", "text": "South Leonida Real Estate", "note": "", "done": false},
    {"id": "s74", "text": "The Cartel Heist", "note": "", "done": false},
    {"id": "s75", "text": "Ocean Beach", "note": "", "done": false},
    {"id": "s76", "text": "Another Life", "note": "", "done": false},
    {"id": "s77", "text": "Pool Day", "note": "", "done": false},
    {"id": "s78", "text": "Company Cars", "note": "", "done": false},
    {"id": "s79", "text": "Lawyer Up", "note": "", "done": false},
    {"id": "s80", "text": "Heavy Lifting", "note": "", "done": false},
    {"id": "s81", "text": "Party Hard", "note": "", "done": false},
    {"id": "s82", "text": "Pay Abe's Fee", "note": "", "done": false},
    {"id": "s83", "text": "Photo/Shoot", "note": "", "done": false},
    {"id": "s84", "text": "Making Gainz", "note": "", "done": false},
    {"id": "s85", "text": "Blood Sweat and Gear", "note": "", "done": false},
    {"id": "s86", "text": "Watch It", "note": "", "done": false},
    {"id": "s87", "text": "Too Much Baggage", "note": "", "done": false},
    {"id": "s88", "text": "Amateur Hour", "note": "", "done": false},
    {"id": "s89", "text": "Call Nate", "note": "", "done": false},
    {"id": "s90", "text": "Cash Injections", "note": "", "done": false},
    {"id": "s91", "text": "Dirty Work", "note": "", "done": false},
    {"id": "s92", "text": "Nate Will Be in Touch", "note": "", "done": false},
    {"id": "s93", "text": "Adventures in Babysitting", "note": "", "done": false},
    {"id": "s94", "text": "Rafa's Kidnapping", "note": "", "done": false},
    {"id": "s95", "text": "Fresh Evidence", "note": "", "done": false},
    {"id": "s96", "text": "Child's Play", "note": "", "done": false},
    {"id": "s97", "text": "Power Play", "note": "", "done": false},
    {"id": "s98", "text": "Close Surveillance", "note": "", "done": false},
    {"id": "s99", "text": "Delivery Method", "note": "", "done": false},
    {"id": "s100", "text": "Team Building", "note": "", "done": false},
    {"id": "s101", "text": "Fully Catered", "note": "", "done": false},
    {"id": "s102", "text": "Heist Plans in Place", "note": "", "done": false},
    {"id": "s103", "text": "VCIA Takedown", "note": "", "done": false},
    {"id": "s104", "text": "Tie Up Loose Ends", "note": "", "done": false},
    {"id": "s105", "text": "Call Valentina Back", "note": "", "done": false},
    {"id": "s106", "text": "Sunset", "note": "", "done": false},
    {"id": "s107", "text": "Starting From Zero", "note": "", "done": false},
    {"id": "s108", "text": "Bird in the Hand", "note": "", "done": false},
    {"id": "s109", "text": "Taking Liberties", "note": "", "done": false},
    {"id": "s110", "text": "Doggie Bag", "note": "", "done": false},
    {"id": "s111", "text": "VC Baby", "note": "", "done": false},
    {"id": "s112", "text": "Operation Savage Glory", "note": "", "done": false},
    {"id": "s113", "text": "Honest Abe", "note": "", "done": false},
    {"id": "s114", "text": "Unfinished Business", "note": "", "done": false},
    {"id": "s115", "text": "Pay Abe's Fee", "note": "", "done": false},
    {"id": "s116", "text": "Protective Custody", "note": "", "done": false},
    {"id": "s117", "text": "The End of the Road", "note": "", "done": false}
  ];

  var CONFIRMED_SIDE = [
    {"id": "j1", "text": "Get Shirley's Rum", "note": "", "done": false},
    {"id": "j2", "text": "Steal the Scooter", "note": "", "done": false},
    {"id": "j3", "text": "Catch a Bigger Fish", "note": "", "done": false},
    {"id": "j4", "text": "Search for the Skunk Ape", "note": "", "done": false},
    {"id": "j5", "text": "Search for Tree Effigies", "note": "", "done": false},
    {"id": "j6", "text": "Help Kirk Find Mr. Mangrove", "note": "", "done": false},
    {"id": "j7", "text": "Check Out McKittrick Farm", "note": "", "done": false},
    {"id": "j8", "text": "Collect Chemicals for Kyle", "note": "", "done": false},
    {"id": "j9", "text": "Buddy?", "note": "", "done": false},
    {"id": "j10", "text": "Steal Vehicles for Moses", "note": "", "done": false},
    {"id": "j11", "text": "Collect Moses' Gift", "note": "", "done": false},
    {"id": "j12", "text": "Veteran Hunted", "note": "", "done": false},
    {"id": "j13", "text": "Bret's Hunting Decks", "note": "", "done": false},
    {"id": "j14", "text": "Thrillbillies", "note": "", "done": false},
    {"id": "j15", "text": "Twist Wrist, Smash, Grab", "note": "", "done": false},
    {"id": "j16", "text": "Mall Rats", "note": "", "done": false},
    {"id": "j17", "text": "The Impaler", "note": "", "done": false},
    {"id": "j18", "text": "Hometown Heroes", "note": "", "done": false},
    {"id": "j19", "text": "Join a Street Race", "note": "", "done": false},
    {"id": "j20", "text": "Bumper to Bumper", "note": "", "done": false},
    {"id": "j21", "text": "Race Against Yago", "note": "", "done": false},
    {"id": "j22", "text": "Brother to Brother", "note": "", "done": false},
    {"id": "j23", "text": "Climbing the Cellerichain", "note": "", "done": false},
    {"id": "j24", "text": "Pay the Cellerica Fee", "note": "", "done": false},
    {"id": "j25", "text": "Peach!", "note": "", "done": false},
    {"id": "j26", "text": "Read the Label", "note": "", "done": false},
    {"id": "j27", "text": "Puff Puff Pass", "note": "", "done": false},
    {"id": "j28", "text": "Yasmani's Jewelry Jobs", "note": "", "done": false},
    {"id": "j29", "text": "Yasmani's ATM Jobs", "note": "", "done": false},
    {"id": "j30", "text": "Yasmani's Payday Loans Jobs", "note": "", "done": false},
    {"id": "j31", "text": "Tail the Security Van", "note": "", "done": false},
    {"id": "j32", "text": "Randy's Wish List", "note": "", "done": false},
    {"id": "j33", "text": "Take Out Kitty Litter", "note": "", "done": false},
    {"id": "j34", "text": "Spin On This", "note": "", "done": false},
    {"id": "j35", "text": "Dunk's Robbery Tips", "note": "", "done": false},
    {"id": "j36", "text": "Attend Eddie Acosta's Party", "note": "", "done": false},
    {"id": "j37", "text": "The Last Mile: Passing the Torch", "note": "", "done": false},
    {"id": "j38", "text": "The Last Mile: Backseat Pilot", "note": "", "done": false},
    {"id": "j39", "text": "Pete's Deliveries: Southpoint Airfield", "note": "", "done": false},
    {"id": "j40", "text": "Pete's Deliveries: Avery Allen & Co.", "note": "", "done": false},
    {"id": "j41", "text": "Deliver Packages", "note": "", "done": false}
  ];

  var CONFIRMED_COLLECTIBLES = [
    {"id": "c1", "text": "Collectible Card Sets", "note": "", "done": false},
    {"id": "c2", "text": "Cocaine Flamingos", "note": "", "done": false},
    {"id": "c3", "text": "Underwater Discoveries", "note": "", "done": false},
    {"id": "c4", "text": "Kenton's Treasure Sets", "note": "", "done": false},
    {"id": "c5", "text": "Magazines, Books & Comics", "note": "", "done": false},
    {"id": "c6", "text": "Meditation Spots", "note": "", "done": false},
    {"id": "c7", "text": "WAiNK Locations Scanned", "note": "", "done": false},
    {"id": "c8", "text": "Unique Playlists", "note": "", "done": false},
    {"id": "c9", "text": "Discovered Styles", "note": "", "done": false},
    {"id": "c10", "text": "Stunts", "note": "", "done": false},
    {"id": "c11", "text": "Animals Studied", "note": "", "done": false},
    {"id": "c12", "text": "Base Model Vehicles Scanned", "note": "", "done": false}
  ];

  var CONFIRMED_VEHICLES_V3 = [
    { id: 'car7', text: 'Vapid Ganado', note: 'In game, confirmed by reviewers', done: false }
  ];

  function seed() {
    return [
      { id: 'launch', title: 'Launch Night', items: [
        { id: 'l1', text: 'Game pre-loaded', note: '', done: false },
        { id: 'l2', text: 'Up to 212 GB cleared for the download', note: '', done: false },
        { id: 'l3', text: 'Console system update done', note: '', done: false },
        { id: 'l4', text: 'Controller charged', note: '', done: false }
      ] },
      { id: 'story', title: 'Story Missions', items: CONFIRMED_STORY.map(copyItem) },
      { id: 'side', title: 'Side Jobs', items: CONFIRMED_SIDE.map(copyItem) },
      { id: 'collectibles', title: 'Collectibles', items: CONFIRMED_COLLECTIBLES.map(copyItem) },
      { id: 'vehicles', title: 'Vehicles', items: CONFIRMED_VEHICLES.concat(CONFIRMED_VEHICLES_V3).map(copyItem) }
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

  /* Collapsible cards: which sections are open. Long lists start
     closed so the page is not one endless scroll; the visitor's own
     choices are remembered in this browser. */
  var OPEN_KEY = 'it-gta6-tracker-open-v1';
  var openState = {};
  try {
    var rawOpen = window.localStorage.getItem(OPEN_KEY);
    if (rawOpen) openState = JSON.parse(rawOpen) || {};
  } catch (e) { /* storage blocked: defaults below still apply */ }
  function saveOpen() {
    try { window.localStorage.setItem(OPEN_KEY, JSON.stringify(openState)); } catch (e) { /* ignore */ }
  }

  /* One-time seed update: a tracker saved before the confirmed
     vehicles were published gets them merged in once, keeping
     everything the visitor already ticked or added. */
  var SEED2_FLAG = 'it-gta6-tracker-seed-v2';
  (function applySeedUpdates() {
    var applied = true;
    try { applied = !!window.localStorage.getItem(SEED2_FLAG); } catch (e) { /* storage blocked: skip */ }
    if (applied) return;
    state.forEach(function (sec) {
      if (sec.id !== 'vehicles') return;
      var have = {};
      sec.items.forEach(function (i) { have[i.id] = true; });
      CONFIRMED_VEHICLES.forEach(function (it) { if (!have[it.id]) sec.items.push(copyItem(it)); });
    });
    try { window.localStorage.setItem(SEED2_FLAG, '1'); } catch (e) { /* ignore */ }
    save();
  })();

  /* Second seed update (launch week): the reviewer-confirmed story,
     side job and collectible lists plus one more vehicle, merged in
     once under a new flag so existing ticks and notes survive. */
  var SEED3_FLAG = 'it-gta6-tracker-seed-v3';
  var SEED3_LISTS = { story: CONFIRMED_STORY, side: CONFIRMED_SIDE, collectibles: CONFIRMED_COLLECTIBLES, vehicles: CONFIRMED_VEHICLES_V3 };
  (function applySeed3() {
    var applied = true;
    try { applied = !!window.localStorage.getItem(SEED3_FLAG); } catch (e) { /* storage blocked: skip */ }
    if (applied) return;
    state.forEach(function (sec) {
      var adds = SEED3_LISTS[sec.id];
      if (!adds) return;
      var have = {};
      sec.items.forEach(function (i) { have[i.id] = true; });
      adds.forEach(function (it) { if (!have[it.id]) sec.items.push(copyItem(it)); });
    });
    try { window.localStorage.setItem(SEED3_FLAG, '1'); } catch (e) { /* ignore */ }
    save();
  })();

  state.forEach(function (sec) {
    if (!(sec.id in openState)) openState[sec.id] = sec.items.length <= 15;
  });

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
      var toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'tracker-toggle';
      toggle.setAttribute('aria-expanded', openState[section.id] ? 'true' : 'false');
      toggle.setAttribute('aria-label', 'Open or close: ' + section.title);
      var titleSpan = document.createElement('span');
      titleSpan.className = 'tracker-title';
      titleSpan.textContent = section.title;
      var pct = document.createElement('span');
      pct.className = 'tracker-pct';
      pct.textContent = pctOf(section.items) + '%';
      var chev = document.createElement('span');
      chev.className = 'tracker-chevron';
      chev.textContent = '▾';
      chev.setAttribute('aria-hidden', 'true');
      toggle.appendChild(titleSpan);
      toggle.appendChild(pct);
      toggle.appendChild(chev);
      headRow.appendChild(toggle);
      sec.appendChild(headRow);

      var bar = document.createElement('div');
      bar.className = 'tracker-bar';
      var fill = document.createElement('div');
      fill.className = 'tracker-fill';
      fill.style.width = pctOf(section.items) + '%';
      bar.appendChild(fill);
      sec.appendChild(bar);

      var body = document.createElement('div');
      body.className = 'tracker-body';
      body.hidden = !openState[section.id];
      toggle.addEventListener('click', function () {
        var nowOpen = body.hidden;
        body.hidden = !nowOpen;
        toggle.setAttribute('aria-expanded', nowOpen ? 'true' : 'false');
        openState[section.id] = nowOpen;
        saveOpen();
      });

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
      body.appendChild(list);

      if (!section.items.length) {
        var emptyP = document.createElement('p');
        emptyP.className = 'tracker-empty';
        emptyP.textContent = 'Nothing here yet. Add the first one below.';
        body.appendChild(emptyP);
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
      body.appendChild(form);

      sec.appendChild(body);
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
      try { window.localStorage.setItem(SEED2_FLAG, '1'); } catch (e) { /* storage blocked */ }
      try { window.localStorage.setItem(SEED3_FLAG, '1'); } catch (e) { /* ignore */ }
      save();
      render();
    });
  }

  render();


})();
