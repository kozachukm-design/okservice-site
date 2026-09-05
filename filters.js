/* OK Service — фільтри каталогу: призначення, ціна, бренд.
   Працює поверх brands.js: додає підпис «БРЕНД», два свої ряди
   та рядок з активними фільтрами над каталогом. */
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
    var r = '', li = c.querySelectorAll('.lap-specs li');
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

    var css = '.okf{display:flex;flex-wrap:wrap;gap:7px;margin:0 0 16px;align-items:center}'
      + '.okf-t{font-family:"IBM Plex Mono",monospace;font-size:.7rem;letter-spacing:.09em;color:var(--muted);text-transform:uppercase;flex:0 0 116px;max-width:116px;line-height:1.3}'
      + '.okf button{padding:6px 13px;border:1px solid var(--line);border-radius:999px;background:#fff;color:var(--muted);font:inherit;font-size:.87rem;font-weight:600;cursor:pointer}'
      + '.okf button:hover{border-color:var(--steel);color:var(--ink)}'
      + '.okf button.on{background:var(--ink);border-color:var(--ink);color:#fff}'
      + '.okf .okf-n{font-family:"IBM Plex Mono",monospace;font-size:.76rem;opacity:.55;margin-left:5px}'
      + '.lap.okf-off{display:none !important}'
      + '.brands{margin-bottom:26px}'
      + '.brand-chip[data-b=""].is-on{background:#fff;border-color:var(--line);color:var(--muted)}'
      + '.okf-sum{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:0 0 18px;font-size:.92rem;color:var(--muted)}'
      + '.okf-sum b{color:var(--ink)}'
      + '.okf-sum .tag{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;background:var(--surface);border:1px solid var(--line);color:var(--ink);font-weight:600;font-size:.85rem}'
      + '.okf-sum .tag i{font-style:normal;cursor:pointer;color:var(--muted)}'
      + '.okf-sum .clr{background:none;border:0;color:var(--steel);font:inherit;font-size:.88rem;font-weight:600;cursor:pointer;text-decoration:underline}'
      + '@media(max-width:560px){.okf-t{min-width:100%;margin-bottom:2px}}';
    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);

    var PL = [['p1', 'до 10 тис'], ['p2', '10–20 тис'], ['p3', '20–30 тис'], ['p4', 'понад 30 тис']];
    var TL = [['t1', 'Ігрові'], ['t2', 'Для роботи й навчання'], ['t3', 'Бюджетні']];
    var cp = {}, ct = {}, ap = '', at = '', rows = [], sum = null;

    for (var i = 0; i < cards.length; i++) {
      var c = cards[i];
      var el = c.querySelector('.lap-price');
      var p = num(el ? el.textContent : '');
      var pk = '';
      if (p !== null) { pk = p < 10000 ? 'p1' : (p < 20000 ? 'p2' : (p < 30000 ? 'p3' : 'p4')); }
      var g = videoOf(c);
      var game = (g.indexOf('geforce') >= 0 || g.indexOf('rtx') >= 0 || g.indexOf('gtx') >= 0 || g.indexOf('radeon rx') >= 0) && g.indexOf('quadro') < 0;
      var tk = game ? 't1' : ((p !== null && p < 10000) ? 't3' : 't2');
      c.setAttribute('data-p', pk);
      c.setAttribute('data-t', tk);
      if (pk) { cp[pk] = (cp[pk] || 0) + 1; }
      ct[tk] = (ct[tk] || 0) + 1;
    }

    function brandNow() {
      var on = document.querySelector('#brands .brand-chip.is-on');
      return on ? (on.getAttribute('data-b') || '') : '';
    }

    function label(kind, key) {
      var list = (kind === 'p') ? PL : TL;
      for (var i = 0; i < list.length; i++) { if (list[i][0] === key) { return list[i][1]; } }
      return key;
    }

    function mark() {
      for (var r = 0; r < rows.length; r++) {
        var box = rows[r].el, kind = rows[r].kind, kids = box.children;
        for (var j = 0; j < kids.length; j++) {
          var b = kids[j];
          if (b.tagName !== 'BUTTON') { continue; }
          var k = b.getAttribute('data-k');
          var act = (kind === 'p') ? ap : at;
          var on = (k !== '') && (k === act);
          if (on) { b.classList.add('on'); } else { b.classList.remove('on'); }
        }
      }
    }

    function tag(text, onClear) {
      var s = document.createElement('span');
      s.className = 'tag';
      s.appendChild(document.createTextNode(text));
      var x = document.createElement('i');
      x.textContent = '×';
      x.setAttribute('role', 'button');
      x.setAttribute('aria-label', 'Прибрати фільтр');
      x.addEventListener('click', onClear);
      s.appendChild(x);
      return s;
    }

    function drawSum() {
      var bk = brandNow();
      var n = 0;
      for (var i = 0; i < cards.length; i++) {
        var c = cards[i];
        if (ap && c.getAttribute('data-p') !== ap) { continue; }
        if (at && c.getAttribute('data-t') !== at) { continue; }
        if (bk && c.getAttribute('data-brand') !== bk) { continue; }
        n++;
      }
      sum.innerHTML = '';
      if (!ap && !at && !bk) { sum.style.display = 'none'; return; }
      sum.style.display = 'flex';

      var word = (n === 1) ? 'ноутбук' : ((n > 1 && n < 5) ? 'ноутбуки' : 'ноутбуків');
      var head = document.createElement('span');
      head.innerHTML = 'Знайдено <b>' + n + '</b> ' + word;
      sum.appendChild(head);

      if (at) { sum.appendChild(tag(label('t', at), function () { at = ''; apply(); })); }
      if (ap) { sum.appendChild(tag(label('p', ap), function () { ap = ''; apply(); })); }
      if (bk) {
        var chip = document.querySelector('#brands .brand-chip.is-on span');
        sum.appendChild(tag(chip ? chip.textContent : 'Бренд', function () {
          var on = document.querySelector('#brands .brand-chip.is-on');
          if (on) { on.click(); }
        }));
      }

      var clr = document.createElement('button');
      clr.type = 'button';
      clr.className = 'clr';
      clr.textContent = 'Скинути все';
      clr.addEventListener('click', function () {
        ap = ''; at = '';
        var on = document.querySelector('#brands .brand-chip.is-on');
        if (on && on.getAttribute('data-b')) { on.click(); }
        apply();
      });
      sum.appendChild(clr);
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
      drawSum();
    }

    function row(kind, title, list, counts, before) {
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
        b.appendChild(document.createTextNode(have[j][1]));
        var n = document.createElement('span');
        n.className = 'okf-n';
        n.textContent = counts[have[j][0]];
        b.appendChild(n);
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

      if (before && before.parentNode) { before.parentNode.insertBefore(box, before); }
      else { grid.parentNode.insertBefore(box, grid); }
      rows.push({ el: box, kind: kind });
    }

    var br = document.getElementById('brands');
    if (br) {
      var bl = document.createElement('span');
      bl.className = 'okf-t';
      bl.textContent = 'Бренд';
      br.insertBefore(bl, br.firstChild);
      br.addEventListener('click', function () { setTimeout(drawSum, 60); });
    }

    sum = document.createElement('div');
    sum.className = 'okf-sum';
    sum.style.display = 'none';
    grid.parentNode.insertBefore(sum, grid);

    row('t', 'Призначення', TL, ct, br);
    row('p', 'Ціна', PL, cp, br);
    mark();
  }
})();
