# -*- coding: utf-8 -*-
"""
OK Service — авто-збирач ноутбуків із Telegram-каналу.

Пише у ДВА файли:
  index.html             — перші INDEX_CARDS (найновіші), між <!--LAPTOPS:START-->…<!--LAPTOPS:END-->
  noutbuky-bu/index.html — усі до MAX_CARDS, між <!--LAPTOPS40:START-->…<!--LAPTOPS40:END-->

Фото зберігаються окремими файлами в теку img/ і підвантажуються ліниво
(loading="lazy") — сторінка відкривається швидко навіть на мобільному.

ВАЖЛИВО: чистка теки img/ видаляє ЛИШЕ файли виду 1234_0.jpg (фото ноутбуків).
Будь-які інші файли не чіпаються. Фото для сайту лежать окремо в теці foto/.
"""
import re, io, os, html, urllib.parse, requests
from bs4 import BeautifulSoup
from PIL import Image

CHANNEL = "ok_0683627070"
DM_LINK = "https://t.me/+380683627070"      # чат за номером — без передзаповнення
DM_USER = "OkServiceKhm"                    # ім'я користувача — лише воно дозволяє ?text=
INDEX = "index.html"
SHOP = "noutbuky-bu/index.html"

MAX_CARDS = 40          # скільки ноутбуків на сторінці /noutbuky-bu/
INDEX_CARDS = 8         # скільки найновіших показувати на головній
MAX_PAGES = 10          # скільки сторінок каналу гортати, щоб набрати MAX_CARDS
MAX_PHOTOS_PER_CARD = 6
IMG_DIR = "img"
IMG_MAXSIDE = 1000
IMG_QUALITY = 74
SKIP = ["продано", "prodano", "резерв", "reserve"]

# фото ноутбуків мають вигляд 5688_0.jpg — лише такі файли можна прибирати
PHOTO_NAME = re.compile(r"^\d+_\d+\.jpg$")

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                    "(KHTML, like Gecko) Chrome/124 Safari/537.36",
      "Referer": "https://t.me/"}

EMOJI = re.compile("[\U0001F000-\U0001FAFF\U00002600-\U000027BF\U0001F1E6-\U0001F1FF"
 "\U00002190-\U000021FF\U00002B00-\U00002BFF\U0000FE00-\U0000FE0F\U0000200D"
 "\U000023E9-\U000023FA\U00002B50\U0000274C\U00002705\U0000203C\U00002049]+", flags=re.UNICODE)

LB_MODEL = ("Виробник", "Модель")
LB_SCREEN = ("Екран", "Дисплей", "Матриця")
LB_CPU = ("Процесор", "CPU")
LB_RAM = ("Оперативна пам", "ОЗП", "RAM", "Оперативка", "Память", "Пам'ять")
LB_STORAGE = ("Накопичувач", "Диск", "SSD", "HDD", "Накопич")
LB_GPU = ("Відео", "Відеокарта", "Графіка", "GPU")
LB_PRICE = ("Ціна", "Вартість")


def clean(t):
    t = EMOJI.sub("", t or "")
    t = t.replace("\u2019", "'").replace("`", "'").replace("\u00b4", "'")
    return re.sub(r"[ \t]{2,}", " ", t).strip(" \u00a0·-—:!")


def esc(t):
    return html.escape(clean(t))


def field(text, labels):
    for line in text.splitlines():
        lc = clean(line); low = lc.lower()
        for lab in labels:
            if low.startswith(lab.lower()):
                return clean(lc.split(":", 1)[1] if ":" in lc else lc[len(lab):])
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
        out.append(f"стан {100-n}%" if re.search(r"знош|знос", line, re.I) else f"{n}%")
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
    return any(w in low for w in ("ціна", "вартість")) and not any(w in low for w in SKIP)


def fetch(url):
    r = requests.get(url, headers=UA, timeout=30)
    r.raise_for_status()
    return r.text


def parse(page):
    soup = BeautifulSoup(page, "html.parser"); msgs = []; ids = []
    for m in soup.select(".tgme_widget_message"):
        post = m.get("data-post")
        if not post or "/" not in post:
            continue
        pid = int(post.split("/")[1]); ids.append(pid)
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
    found = {}; url = f"https://t.me/s/{CHANNEL}"
    for _ in range(MAX_PAGES):
        msgs, min_id = parse(fetch(url))
        for it in msgs:
            found.setdefault(it["pid"], it)
        if len([i for i in found.values() if is_laptop(i["text"])]) >= MAX_CARDS or not min_id:
            break
        url = f"https://t.me/s/{CHANNEL}?before={min_id}"
    laptops = [i for i in found.values() if is_laptop(i["text"])]
    laptops.sort(key=lambda x: -x["pid"])
    return laptops[:MAX_CARDS]


def save_photo(url, pid, idx):
    """Завантажує фото, стискає й зберігає у теку img/. Повертає шлях і розміри."""
    fn = f"{IMG_DIR}/{pid}_{idx}.jpg"
    try:
        r = requests.get(url, headers=UA, timeout=40)
        if r.status_code != 200 or len(r.content) < 1000:
            return None
        im = Image.open(io.BytesIO(r.content)).convert("RGB")
        w, h = im.size
        k = min(1.0, IMG_MAXSIDE / max(w, h))
        if k < 1.0:
            im = im.resize((int(w * k), int(h * k)), Image.LANCZOS)
        os.makedirs(IMG_DIR, exist_ok=True)
        im.save(fn, "JPEG", quality=IMG_QUALITY, optimize=True, progressive=True)
        return {"src": fn, "w": im.size[0], "h": im.size[1]}
    except Exception:
        return None


def fmt_date(dt):
    m = re.match(r"(\d{4})-(\d{2})-(\d{2})", dt or "")
    return f"{m.group(3)}.{m.group(2)}.{m.group(1)}" if m else ""


def card(it, shop=False):
    """shop=True — картка для сторінки /noutbuky-bu/ (кнопка «Замовити» з копіюванням тексту)."""
    text = it["text"]
    title = field(text, LB_MODEL) or "Ноутбук"
    pr = price(text)
    rows = [("Екран", field(text, LB_SCREEN)),
            ("Процесор", field(text, LB_CPU)),
            ("Оперативна пам'ять", field(text, LB_RAM)),
            ("Накопичувач", field(text, LB_STORAGE)),
            ("Відео", field(text, LB_GPU)),
            ("Акумулятор", battery(text))]
    # підпис (k) — наш власний текст, екранувати не треба; значення (v) — з Telegram, екрануємо
    specs = "".join(f'<li><span class="k">{k}</span><span class="v">{esc(v)}</span></li>'
                    for k, v in rows if v)
    imgs = "".join(
        f'<img src="/{p["src"]}" alt="{esc(title)}" width="{p["w"]}" height="{p["h"]}" '
        f'loading="lazy" decoding="async">'
        for p in it.get("photos_local", [])
    ) or '<img alt="Фото у Telegram">'
    date = fmt_date(it["date"])
    date_html = f'<div class="lap-date">Додано {date}</div>' if date else ""
    post_url = f"https://t.me/{it['post']}"

    if shop:
        raw = f"Добрий день! Цікавить {clean(title)} — {clean(pr)}"
        href = f"https://t.me/{DM_USER}?text={urllib.parse.quote(raw)}"
        cta = (f'<a class="btn btn-tg lap-order" href="{href}" target="_blank" rel="noopener" '
               f'data-msg="{html.escape(raw, quote=True)}">Замовити</a>')
        cta = f'<a class="btn btn-tg" href="{DM_LINK}" target="_blank" rel="noopener">Забронювати</a>'

    return f'''      <article class="lap">
        <div class="lap-gallery">{imgs}</div>
        <div class="lap-body">
          {date_html}
          <h3>{esc(title)}</h3>
          <ul class="lap-specs">{specs}</ul>
          <div class="lap-price">{esc(pr)}</div>
          <div class="lap-cta">
            {cta}
            <a class="lap-more" href="{post_url}" target="_blank" rel="noopener">деталі →</a>
          </div>
        </div>
      </article>'''


def write_block(path, start, end, grid, label):
    """Обережний запис: якщо файлу чи міток немає — просто попереджаємо й нічого не ламаємо."""
    if not os.path.isfile(path):
        print(f"! {label}: файлу {path} немає — пропускаю.")
        return False
    src = open(path, encoding="utf-8").read()
    if start not in src or end not in src:
        print(f"! {label}: у {path} немає міток {start}/{end} — пропускаю.")
        return False
    i, j = src.index(start), src.index(end)
    if j < i:
        print(f"! {label}: мітки у {path} стоять у неправильному порядку — пропускаю.")
        return False
    new = src[:i] + start + "\n      " + grid + "\n      " + src[j:]
    if new != src:
        open(path, "w", encoding="utf-8").write(new)
        print(f"  {label}: оновлено ({path})")
    else:
        print(f"  {label}: без змін ({path})")
    return True


def main():
    items = collect()
    if not items:
        print("Не знайдено ноутбуків — сторінки не змінюю.")
        return

    used, total = set(), 0
    for it in items:
        local = []
        for idx, u in enumerate(it["photos"][:MAX_PHOTOS_PER_CARD]):
            p = save_photo(u, it["pid"], idx)
            if p:
                local.append(p)
                used.add(p["src"])
        it["photos_local"] = local
        total += len(local)

    # прибрати знімки, яких уже немає серед актуальних (лише файли виду 1234_0.jpg)
    if os.path.isdir(IMG_DIR):
        for f in os.listdir(IMG_DIR):
            if not PHOTO_NAME.match(f):
                continue
            p = f"{IMG_DIR}/{f}"
            if p not in used:
                try:
                    os.remove(p)
                except OSError:
                    pass

    # 1) головна — перші INDEX_CARDS
    top = items[:INDEX_CARDS]
    grid_index = ('<div class="lap-grid">\n'
                  + "\n".join(card(i, shop=False) for i in top)
                  + "\n      </div>")
    ok_index = write_block(INDEX, "<!--LAPTOPS:START-->", "<!--LAPTOPS:END-->",
                           grid_index, f"головна ({len(top)} шт.)")

    # 2) сторінка магазину — усі
    grid_shop = ('<div class="lap-grid">\n'
                 + "\n".join(card(i, shop=True) for i in items)
                 + "\n      </div>")
    write_block(SHOP, "<!--LAPTOPS40:START-->", "<!--LAPTOPS40:END-->",
                grid_shop, f"магазин ({len(items)} шт.)")

    if not ok_index:
        print("! УВАГА: головну не оновлено. Перевір мітки LAPTOPS:START / LAPTOPS:END.")

    print(f"Готово: {len(items)} ноутбуків, фото збережено: {total}.")


if __name__ == "__main__":
    main()
