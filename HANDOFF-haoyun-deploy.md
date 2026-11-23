# Handoff: publish 好运研究所 / Fortune Lab to xiantang.life

You are running on the machine that holds the live xiantang.life site (likely
`~/sites/xiantang.life`, the folder with `index.html` and `en/`) and knows how it is
deployed (nginx). A cloud session built and tested everything below. Your job: **add 2
files, add one nav link + one footer link to existing pages, publish, verify.** Ask the
user before publishing.

## Background (already done — don't redo)

- **Backend is live.** `https://mystar.xiantang.life/api/shop/checkout` (repo
  `xiziwansui/ziwei`, PR #138/#139). It prices the cart server-side, opens Stripe
  Checkout (collects address + phone, SG/MY), and on payment emails info@xiantang.life the
  packing details and the buyer a confirmation. CORS allows only `https://www.xiantang.life`
  and `https://xiantang.life`.
- **Products:** 8 符 at S$120; 镇宅大符 S$380 (with 风水勘察, not in the cart); 2 开运蜡烛 and
  聚钱袋 show 「即将推出 / Coming soon」 until 安妍老师 sets names and prices. Product cards use
  drawn placeholders (安妍老师 2026-11-23: keep them, no photos). New names: 安身烛 Grounding Candle, 和缘烛 Harmony Candle, 聚财福袋 Prosperity Pouch — still 即将推出 until priced.
- **English name: Fortune Lab** (安妍老师 2026-11-23).

## Step 1 — add 2 new files

Public repo `xiziwansui/xiantang-site`, branch `claude/tender-galileo-m8i7lz`. Run from the
site root. If either file already exists, stop and ask.

```bash
R=https://raw.githubusercontent.com/xiziwansui/xiantang-site/claude/tender-galileo-m8i7lz
mkdir -p en
for f in haoyun.html en/haoyun.html; do
  [ -e "$f" ] && { echo "EXISTS, stopping: $f"; break; }
  curl -fsSL -o "$f" "$R/$f" && echo "added $f"
done
sha256sum haoyun.html en/haoyun.html
```

| file | sha256 starts |
|---|---|
| haoyun.html | e3ceacdc30a9 |
| en/haoyun.html | 8167b7039524 |

The GitHub repo's **other** files are stale (last real sync May 2026). Do NOT copy or pull
anything else from it over the local site.

## Step 2 — link it from the other pages (edit in place, don't replace files)

Top-level `*.html` and `en/*.html` only (pages in `courses/`, `journal/` use other relative
paths; leave them). Skips any page that already links `haoyun.html`, so it's safe to re-run.

```bash
python3 - <<'PY'
import glob, re
ZH = ('服务', '风水', '好运研究所')
EN = ('Services', 'Feng Shui', 'Fortune Lab')
changed = []
for path in sorted(glob.glob('*.html') + glob.glob('en/*.html')):
    if path.endswith('haoyun.html'):
        continue
    s = open(path, encoding='utf-8').read()
    if 'haoyun.html' in s:
        continue
    svc, fs, name = EN if path.startswith('en/') else ZH
    # nav: right after the 服务 / Services item
    s2, n1 = re.subn(r'(<li><a href="services\.html"(?: class="active")?>%s</a></li>)' % re.escape(svc),
                     r'\1\n      <li><a href="haoyun.html">%s</a></li>' % name, s, count=1)
    # footer: last item of the services column
    s2, n2 = re.subn(r'(<li><a href="services\.html#fengshui">%s</a></li>)(</ul>)' % re.escape(fs),
                     r'\1<li><a href="haoyun.html">%s</a></li>\2' % name, s2, count=1)
    if n1 or n2:
        open(path, 'w', encoding='utf-8').write(s2)
        changed.append(f'{path} (nav {n1}, footer {n2})')
print('\n'.join(changed) or 'nothing changed')
PY
```

Expected: most top-level and `en/` pages report `nav 1, footer 1`. Show the user the list.

## Step 3 — publish

Publish the way the site is normally deployed. **Ask the user first.**

## Step 4 — verify on the live site

```bash
for u in haoyun.html en/haoyun.html services.html en/services.html; do
  printf '%s ' $u; curl -s -o /dev/null -w '%{http_code}\n' https://www.xiantang.life/$u
done
curl -s https://www.xiantang.life/services.html | grep -c 'haoyun.html'      # ≥ 2
curl -s https://www.xiantang.life/en/services.html | grep -c 'Fortune Lab'   # ≥ 2
```

Then in a browser: open https://www.xiantang.life/haoyun.html, add one 符 with ＋, press
去结账, fill a name and email, press 前往付款 — it should land on a Stripe checkout page
(S$120, with address and phone fields). **Don't pay**; close the tab. Repeat on
`/en/haoyun.html` (button reads "Go to payment").

Report back to the user: the files added, the pages edited, and the four HTTP codes.
