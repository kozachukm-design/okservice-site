# -*- coding: utf-8 -*-
"""
OK Service — авто-збирач ноутбуків із Telegram-каналу.
Читає публічний перегляд каналу (t.me/s/...), прибирає смайли, розбирає
характеристики (у т.ч. «знос → стан»), тягне дату й усі фото альбому,
будує фірмові картки й вставляє їх у index.html між мітками
<!--LAPTOPS:START--> ... <!--LAPTOPS:END-->.
"""
import re, html, requests
from bs4 import BeautifulSoup

CHANNEL   = "ok_0683627070"                 # твій канал
DM_LINK   = "https://t.me/+380683627070"    # кнопка «Забронювати»
INDEX     = "index.html"
MAX_CARDS = 6                               # скільки найновіших показувати
MAX_PAGES = 3                               # скільки сторінок каналу переглянути, щоб набрати MAX_CARDS
SKIP      = ["продано", "prodano", "резерв", "reserve"]   # такі пости пропускаємо

UA = {"User-Agent": "Mozilla/5.0 (compatible; OKServiceBot/1.0)"}

EMOJI = re.compile(
    "[\U0001F000-\U0001FAFF\U00002600-\U000027BF\U0001F1E6-\U0001F1FF"
    "\U00002190-\U000021FF\U00002B00-\U00002BFF\U0000FE00-\U0000FE0F\U0000200D"
    "\U000023E9-\U000023FA\U00002B50\U0000274C\U00002705\U0000203C\U00002049]+",
    flags=re.UNICODE)

# синоніми підписів — щоб дрібні відхилення у постах не ламали розбір
LB_MODEL   = ("Виробник", "Модель")
LB_SCREEN  = ("Екран", "Дисплей", "Матриця")
LB_CPU     = ("Процесор", "CPU")
LB_RAM     = ("Оперативна пам", "ОЗП", "RAM", "Оперативка", "Память", "Пам'ять")
LB_STORAGE = ("Накопичувач", "Диск", "SSD", "HDD", "Накопич")
LB_GPU     = ("Відео", "Відеокарта", "Графіка", "GPU")
LB_PRICE   = ("Ціна", "Вартість")

def clean(t):
    t = EMOJI.sub("", t or "")
    t = t.replace("\u2019", "'").replace("`", "'").replace("\u00b4", "'")
    return re.sub(r"[ \t]{2,}", " ", t).strip(" \u00a0·-—:!")

def esc(t):
    return html.escape(clean(t))

def field(text, labels):
    for line in text.splitlines():
        lc = clean(line)
        low = lc.lower()
        for lab in labels:
            if low.startswith(lab.lower()):
                rest = lc.split(":", 1)[1] if ":" in lc else lc[len(lab):]
                return clean(rest)
    return ""

def battery(text):
    line = next((l for l in text.splitlines() if re.search(r"акумулятор|батаре", l, re.I)), "")
    if not line:
        return ""
    val = line.split(":", 1)[1] if ":" in line else line
    out = []
    mp = re.search(r"(\d{1,3})\s*%", val)
    if mp:
        n = int(mp.group(1))
        # «знош»/«знос» у рядку → це рівень зношення, показуємо позитивно (стан)
        out.append(f"стан {100 - n}%" if re.search(r"знош|знос", line, re.I) else f"{n}%")
    cap = re.search(r"(\d+)\s*(?:вт·год|вт|ват|wh)", val, re.I)
    if cap:
        out.append(f"{cap.group(1)} Вт·год")
    return clean(" · ".join(out)) if out else clean(val)

def price(text):
    raw = field(text, LB_PRICE)
    d = re.sub(r"\D", "", raw.split("грн")[0])
    return (f"{int(d):,}".replace(",", " ") + " грн") if d else clean(raw)

def is_laptop(text):
    low = text.lower()
    if not any(w in low for w in ("ціна", "вартість")):
        return False
    if any(w in low for w in SKIP):
        return False
    return True

def fetch(url):
    r = requests.get(url, headers=UA, timeout=30)
    r.raise_for_status()
    return r.text

def parse(page):
    """Повертає (список повідомлень, найменший id на сторінці)."""
    soup = BeautifulSoup(page, "html.parser")
    msgs, ids = [], []
    for m in soup.select(".tgme_widget_message"):
        post = m.get("data-post")
        if not post or "/" not in post:
            continue
        pid = int(post.split("/")[1])
        ids.append(pid)
        te = m.select_one(".tgme_widget_message_text")
        text = te.get_text("\n") if te else ""
        if not text.strip():
            continue
        photos = []
        for w in m.select(".tgme_widget_message_photo_wrap"):
            mm = re.search(r"background-image:url\('([^']+)'\)", w.get("style", ""))
            if mm:
                photos.append(mm.group(1))
        t = m.select_one(".tgme_widget_message_date time")
        date = t.get("datetime") if t and t.get("datetime") else ""
        msgs.append(dict(pid=pid, post=post, text=text, photos=photos, date=date))
    return msgs, (min(ids) if ids else None)

def collect():
    found = {}
    url = f"https://t.me/s/{CHANNEL}"
    for _ in range(MAX_PAGES):
        msgs, min_id = parse(fetch(url))
        for it in msgs:
            found.setdefault(it["pid"], it)
        laptops = [i for i in found.values() if is_laptop(i["text"])]
        if len(laptops) >= MAX_CARDS or not min_id:
            break
        url = f"https://t.me/s/{CHANNEL}?before={min_id}"
    laptops = [i for i in found.values() if is_laptop(i["text"])]
    laptops.sort(key=lambda x: -x["pid"])
    return laptops[:MAX_CARDS]

def fmt_date(dt):
    m = re.match(r"(\d{4})-(\d{2})-(\d{2})", dt or "")
    return f"{m.group(3)}.{m.group(2)}.{m.group(1)}" if m else ""

def card(it):
    text = it["text"]
    title = field(text, LB_MODEL) or "Ноутбук"
    rows = [
        ("Екран", field(text, LB_SCREEN)),
        ("Процесор", field(text, LB_CPU)),
        ("ОЗП", field(text, LB_RAM)),
        ("Накопичувач", field(text, LB_STORAGE)),
        ("Відео", field(text, LB_GPU)),
        ("Акумулятор", battery(text)),
    ]
    specs = "".join(
        f'<li><span class="k">{esc(k)}</span><span class="v">{esc(v)}</span></li>'
        for k, v in rows if v
    )
    imgs = "".join(
        f'<img src="{html.escape(u)}" alt="{esc(title)}" loading="lazy">'
        for u in (it["photos"] or [])
    ) or '<img alt="Фото у Telegram">'
    date = fmt_date(it["date"])
    date_html = f'<div class="lap-date">Додано {date}</div>' if date else ""
    post_url = f"https://t.me/{it['post']}"
    return f'''      <article class="lap">
        <div class="lap-gallery">{imgs}</div>
        <div class="lap-body">
          {date_html}
          <h3>{esc(title)}</h3>
          <ul class="lap-specs">{specs}</ul>
          <div class="lap-price">{esc(price(text))}</div>
          <div class="lap-cta">
            <a class="btn btn-tg" href="{DM_LINK}" target="_blank" rel="noopener">Забронювати</a>
            <a class="lap-more" href="{post_url}" target="_blank" rel="noopener">деталі →</a>
          </div>
        </div>
      </article>'''

def main():
    items = collect()
    if not items:
        print("Не знайдено жодного ноутбука — index.html не змінюю.")
        return
    grid = '<div class="lap-grid">\n' + "\n".join(card(i) for i in items) + "\n      </div>"
    src = open(INDEX, encoding="utf-8").read()
    a, b = "<!--LAPTOPS:START-->", "<!--LAPTOPS:END-->"
    i, j = src.index(a), src.index(b)
    new = src[:i] + a + "\n      " + grid + "\n      " + src[j:]
    if new != src:
        open(INDEX, "w", encoding="utf-8").write(new)
        print(f"Оновлено: {len(items)} ноутбуків.")
    else:
        print("Змін немає.")

if __name__ == "__main__":
    main()
