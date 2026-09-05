/* OK Service — фільтри каталогу: призначення та ціна. Працює разом із brands.js. */
(function () {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }

  function boot() { setTimeout(init, 400); }

  function num(v) {
    var s = '', t = v || '';
    for (var i = 0; i < t.length; i++) {
      var ch = t.charAt(i);
      if (ch >= '0' && ch <= '9') { s += ch; }
      else if (ch === ' ' && s) { continue; }
      else if (s) { break; }
    }
    return s ? parseInt(s, 10) : null;
  }

  function videoOf(c) {
    var r = '';
    var li = c.querySelectorAll('.lap-specs li');
    for (var i = 0; i < li.length; i++) {
      var k = li[i].querySelector('.k'), v = li[i].querySelector('.v');
      if (k && v && k.textContent.toLowerCase().indexOf('відео') >= 0) { r = v.textContent; }
    }
    return r.toLowerCase();
  }

  function init() {
    var grid = document.querySelector('#catalog .lap-grid');
    if (!grid) { return; }
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.lap'));
    if (cards.length < 6) { return; }

    var css = '.okf{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 14px;align-items:center}'
      + '.okf-t{font-family:"IBM Plex Mono",monospace;font-size:.72rem;letter-spacing:.08em;color:var(--muted);text-transform:uppercase;margin-right:4px}'
      + '.okf button{padding:7px 14px;border:1px solid var(--line);border-radius:999px;background:var(--surface);color:var(--muted);font:inherit;font-size:.9rem;font-weight:600;cursor:pointer}'
      + '.okf button:hover{border-color:var(--steel);color:var(--ink)}'
      + '.okf button.on{background:var(--steel);border-color:var(--steel);color:#fff}'
      + '.lap.okf-off{display:none !important}';
    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);

    var PL = [['p1', 'до 10 тис'], ['p2', '10–20 тис'], ['p3', '20–30 тис'], ['p4', 'понад 30 тис']];
    var TL = [['t1', 'Ігрові'], ['t2', 'Для роботи й навчання'], ['t3', 'Бюджетні']];
    var cp = {}, ct = {}, ap = '', at = '', rows = [];

    for (var i = 0; i < cards.length; i++) {
      var c = cards[i];
      var el = c.querySelector('.lap-price');
      var p = num(el ? el.textContent : '');
      var pk = '';
      if (p !== null) { pk = p < 10000 ? 'p1' : (p < 20000 ? 'p2' : (p < 30000 ? 'p3' : 'p4')); }
      var g = videoOf(c);
      var game = (g.indexOf('geforce') >= 0 || g.indexOf('rtx') >= 0 || g.indexOf('gtx') >= 0 || g.indexOf('radeon rx') >= 0) && g.indexOf('quadro') < 0;
      var tk = game ? 't1' : (p !== null && p < 10000 ? 't3' : 't2');
      c.setAttribute('data-p', pk);
      c.setAttribute('data-t', tk);
      if (pk) { cp[pk] = (cp[pk] || 0) + 1; }
      ct[tk] = (ct[tk] || 0) + 1;
    }

    function mark() {
      for (var r = 0; r < rows.length; r++) {
        var box = rows[r].el, kind = rows[r].kind;
        var kids = box.children;
        for (var j = 0; j < kids.length; j++) {
          var b = kids[j];
          if (b.tagName !== 'BUTTON') { continue; }
          var k = b.getAttribute('data-k');
          var on = (kind === 'p') ? (k === ap) : (k === at);
          if (on) { b.classList.add('on'); } else { b.classList.remove('on'); }
        }
      }
    }

    function apply() {
      var btn = document.getElementById('loadmore-btn');
      var wrap = document.getElementById('loadmore');
      if ((ap || at) && btn) {
        for (var n = 0; n < 15; n++) {
          if (wrap && !wrap.hidden) { btn.click(); } else { break; }
        }
      }
      for (var i = 0; i < cards.length; i++) {
        var c = cards[i];
        var ok = (!ap || c.getAttribute('data-p') === ap) && (!at || c.getAttribute('data-t') === at);
        if (ok) { c.classList.remove('okf-off'); } else { c.classList.add('okf-off'); }
      }
      if (wrap && (ap || at)) { wrap.hidden = true; }
      mark();
    }

    function row(kind, title, list, counts) {
      var have = [];
      for (var i = 0; i < list.length; i++) {
        if (counts[list[i][0]]) { have.push(list[i]); }
      }
      if (have.length < 2) { return; }

      var box = document.createElement('div');
      box.className = 'okf';

      var lab = document.createElement('span');
      lab.className = 'okf-t';
      lab.textContent = title;
      box.appendChild(lab);

      var all = document.createElement('button');
      all.type = 'button';
      all.setAttribute('data-k', '');
      all.textContent = 'Усі';
      box.appendChild(all);

      for (var j = 0; j < have.length; j++) {
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('data-k', have[j][0]);
        b.textContent = have[j][1] + ' (' + counts[have[j][0]] + ')';
        box.appendChild(b);
      }

      box.addEventListener('click', function (e) {
        var b = e.target;
        while (b && b.tagName !== 'BUTTON' && b !== box) { b = b.parentNode; }
        if (!b || b.tagName !== 'BUTTON') { return; }
        var k = b.getAttribute('data-k');
        if (kind === 'p') { ap = (ap === k) ? '' : k; } else { at = (at === k) ? '' : k; }
        apply();
        var s = document.getElementById('catalog');
        if (s) { s.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      });

      var br = document.getElementById('brands');
      if (br && br.parentNode) { br.parentNode.insertBefore(box, br.nextSibling); }
      else { grid.parentNode.insertBefore(box, grid); }
      rows.push({ el: box, kind: kind });
    }

    row('t', 'Призначення', TL, ct);
    row('p', 'Ціна', PL, cp);
    mark();
  }
})();
