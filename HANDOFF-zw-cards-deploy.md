# Handoff: publish 紫微牌卡两日速成班 popup + online sign-up to xiantang.life

> **Already published the first round? Jump to [Update 2](#update-2--course-page-faq--button-2026-11-13).**

You are running on the machine that holds the live xiantang.life site (likely
`~/sites/xiantang.life`) and knows how it is deployed. A cloud session built and
tested everything below; your job is to **add 5 files, make 3 small edits, publish,
and verify**. Ask the user before publishing.

## Background (already done — don't redo)

- **Backend is live.** `https://mystar.xiantang.life/api/workshop/checkout` (repo
  `xiziwansui/ziwei`, PR #135, merged + deployed 2026-11-13). It prices tickets
  server-side, opens Stripe Checkout, and on payment records the seat and emails the
  student a confirmation **CC info@xiantang.life**. CORS allows only
  `https://www.xiantang.life` and `https://xiantang.life`.
- **Event:** 紫微牌卡两日速成班 · Sun 6 & 13 Dec 2026, 10am–5pm · Singapore in person ·
  15 seats. Early bird S$588 through 6 Dec 23:59 SGT, then S$880 to 15 Dec;
  两人同行 S$538 × 2 (early bird only); 去年旧生 S$50. Registration closes 16 Dec 00:00 SGT.
- **Popup** shows on the homepage (zh + en) until 15 Dec 23:59 SGT, then switches itself
  off. Shown once a day per visitor; `?event=1` forces it for checking.
- Sign-ups are **not** via WhatsApp (WhatsApp is for 咨询 only).
- The live site is served by nginx (not Vercel), so `/courses/<slug>` pretty URLs 404 —
  everything uses `courses/course.html?slug=…`.

## Step 1 — add 5 new files (fetch from GitHub)

Public repo `xiziwansui/xiantang-site`, branch `claude/fervent-lovelace-4y023t`. Run from
the site root (the folder containing `index.html`). None of these exist yet — if one
does, stop and ask.

```bash
R=https://raw.githubusercontent.com/xiziwansui/xiantang-site/claude/fervent-lovelace-4y023t
mkdir -p assets courses/data courses/images
for f in workshop-signup.html assets/event-popup.js courses/data/zw-cards-2026.md \
         courses/images/zw-cards-cover.jpg courses/images/zw-cards-popup.jpg; do
  [ -e "$f" ] && { echo "EXISTS, stopping: $f"; break; }
  curl -fsSL -o "$f" "$R/$f" && echo "added $f"
done
```

Expected sha256 prefixes (verify with `sha256sum`):

| file | sha256 starts |
|---|---|
| workshop-signup.html | 7f5f35251db3 |
| assets/event-popup.js | 19711afd322c |
| courses/data/zw-cards-2026.md | cf41cb1d433f |
| courses/images/zw-cards-cover.jpg | 1c02eed84a28 |
| courses/images/zw-cards-popup.jpg | 3662a57ccd0b |

Note: the GitHub repo's **other** files are stale (last real sync May 2026). Do NOT
copy or pull anything else from it over the local site.

## Step 2 — three small edits to existing pages (edit, don't replace)

**`index.html` and `en/index.html`** — add this line just before `</body>` (once each):

```html
  <script src="/assets/event-popup.js?v=20261113" defer></script>
```

**`courses.html`** — in 安妍老师's section (`<section class="teacher-band" id="anyan">`),
inside `<div class="courses-list">`, insert this card **directly above** the existing
`<a class="course-tile honey reveal" href="courses/course.html?slug=anyan-live">`:

```html
          <a class="course-tile reveal" href="courses/course.html?slug=zw-cards-2026">
            <div class="course-cover">
              <img class="cover-photo" src="courses/images/zw-cards-cover.jpg" alt="紫微牌卡两日速成班" style="object-position:50% 60%;" />
              <span class="cover-num">安妍 · 2026 年末限定</span>
              <span class="cover-title">紫微牌卡<br />两日速成班</span>
            </div>
            <div class="course-body">
              <div class="course-meta-row">
                <span class="course-tag">早鸟价 · 12/6 截止</span>
                <span class="course-tag sage">零基础可学</span>
                <span class="course-tag gray">新加坡线下 · 限 15 人</span>
              </div>
              <h4>紫微牌卡两日速成班</h4>
              <p class="course-summary">12月6日 &amp; 13日（周日）10am – 5pm。两个周日，从零基础到能独立为自己和朋友解牌。不用排盘，也能读懂紫微。</p>
              <div class="course-foot">
                <span class="course-price">早鸟 SGD 588 <s style="opacity:.5;font-weight:400;font-size:.8em;">880</s></span>
                <span class="course-cta-mini">了解详情 →</span>
              </div>
            </div>
          </a>

```

(If `en/courses.html` exists, ask the user whether they want an English card too — it
wasn't part of the tested set.)

## Step 3 — check locally before publishing

```bash
python3 -m http.server 8000   # from the site root
```

- `http://localhost:8000/?event=1` → popup with the classroom photo, 早鸟 S$588 / S$880
  crossed out, 立即报名 → `/workshop-signup.html?slug=zw-cards-2026`.
- `http://localhost:8000/en/?event=1` → English popup.
- `http://localhost:8000/courses.html#anyan` → new card first, with photo.
- `http://localhost:8000/courses/course.html?slug=zw-cards-2026` → course page, button
  「立即报名 · 线上付款」.
- `http://localhost:8000/workshop-signup.html?slug=zw-cards-2026` → three tickets.
  **Don't submit from localhost** — CORS only allows xiantang.life, so it will show an
  error there; that's expected.

## Step 4 — publish

Deploy the changed/added files the way this site is normally published (ask the user if
it isn't obvious from the folder — e.g. an rsync/scp script, FTP, or a control panel).
Only these 8 paths change:

```
index.html
en/index.html
courses.html
workshop-signup.html
assets/event-popup.js
courses/data/zw-cards-2026.md
courses/images/zw-cards-cover.jpg
courses/images/zw-cards-popup.jpg
```

## Step 5 — verify live

```bash
for p in workshop-signup.html assets/event-popup.js courses/data/zw-cards-2026.md \
         courses/images/zw-cards-cover.jpg courses/images/zw-cards-popup.jpg; do
  curl -s -o /dev/null -w "%{http_code} $p\n" "https://www.xiantang.life/$p"; done
curl -s https://www.xiantang.life/ | grep -c event-popup.js      # expect 1
curl -s https://www.xiantang.life/en/ | grep -c event-popup.js   # expect 1
```

Then ask the user to do one **real S$50 payment** (旧生 ticket) on
`https://www.xiantang.life/workshop-signup.html?slug=zw-cards-2026` and confirm:
1. Stripe Checkout opens, payment goes through, page shows 「报名成功 · 课堂上见！」.
2. Student email 「报名成功 — 紫微牌卡两日速成班」 arrives, **CC info@xiantang.life**.
3. info@xiantang.life also gets 「【禧安堂】新报名（已付款）」 showing 名额：已报 1 / 15.
4. Afterwards: refund it in Stripe, and delete that row from Supabase
   `mystar_appointments` (service `workshop:zw-cards-2026`) so it doesn't hold a seat.

## Later

- **7 Dec:** course page (`courses/data/zw-cards-2026.md`: `priceNow`, `priceWas`,
  `dealLabel`, the 学费 table) and the `courses.html` card still say 早鸟 S$588 — change
  to S$880 by hand. Popup and sign-up page switch automatically.
- **After 15 Dec:** popup turns itself off; the script tag can stay or be removed.
- Next workshop: add an entry to `lib/ziwei/workshops.ts` (ziwei repo) and to the
  `WORKSHOPS` / `CONFIG` blocks in `workshop-signup.html` and `assets/event-popup.js`.

## Update 2 — course page FAQ + button (2026-11-13)

Problem on the live course page (`courses/course.html?slug=zw-cards-2026`): the 常见问题 block
is the template's default, written for video courses (「付款成功后 1 小时内开通账号…登入链接」,
「观看进度不超过 20%」), which is wrong for an in-person class; and the button
「立即报名 · 线上付款」 wraps to two lines on phones.

Fix = 2 files:

1. **`courses/course.html`** — add per-course FAQ support. **Edit, don't replace** (keep any
   local changes). In the main `<script>`, find the line
   `        // Course levels / 课程进阶 chart` and insert this block directly above it:

```js
        // Per-course FAQ (frontmatter: faq: 问题 :: 回答 || 问题 :: 回答 ...). Replaces the
        // default FAQ, which is written for video courses (账号开通 / 观看进度 refunds).
        if (meta.faq) {
          const list = document.querySelector('.faq-list');
          if (list) {
            list.innerHTML = '';
            meta.faq.split('||').forEach(item => {
              const [q, a] = item.split('::').map(s => (s || '').trim());
              if (!q) return;
              const d = document.createElement('details');
              d.className = 'faq-row';
              const sm = document.createElement('summary');
              sm.textContent = q;
              const mk = document.createElement('span');
              mk.className = 'marker'; mk.textContent = '+';
              sm.appendChild(mk);
              const ans = document.createElement('p');
              ans.className = 'answer'; ans.textContent = a || '';
              d.appendChild(sm); d.appendChild(ans);
              list.appendChild(d);
            });
          }
        }

```

   Courses without a `faq:` line keep the existing default FAQ unchanged.

2. **`courses/data/zw-cards-2026.md`** — replace with the branch version (it only adds the
   `faq:` line and shortens `signupLabel` to 「立即报名」). First check the local file is
   still the round-1 version (sha256 starts `cf41cb1d433f`); if it differs, stop and ask.

```bash
R=https://raw.githubusercontent.com/xiziwansui/xiantang-site/claude/fervent-lovelace-4y023t
sha256sum courses/data/zw-cards-2026.md | cut -c1-12     # expect cf41cb1d433f
curl -fsSL -o courses/data/zw-cards-2026.md "$R/courses/data/zw-cards-2026.md"
sha256sum courses/data/zw-cards-2026.md | cut -c1-12     # expect d0cd5567e9e0
```

Check locally (`python3 -m http.server 8000`):
- `/courses/course.html?slug=zw-cards-2026` → 常见问题 shows 6 questions starting
  「报名后多久收到确认？」; button reads 「立即报名」 on one line on a phone.
- `/courses/course.html?slug=anyan-live` → still the original 4 questions.

Then publish these 2 files (ask the user first) and re-check both URLs on
https://www.xiantang.life.

The new 退款 answer reuses the site's existing offline rule (「线下课程开课前 14 天前可全退」)
— confirm with the user that this applies to this class.
