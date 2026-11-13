/*
 * 禧安堂 · 近期活动弹窗 (Upcoming events popup) — xiantang.life
 *
 * Drop-in, self-contained (own CSS, no dependencies). Add ONE line before </body>
 * on index.html and en/index.html:
 *
 *   <script src="/assets/event-popup.js?v=20261113" defer></script>
 *
 * Behaviour
 *  - Shows to every visitor until SHOW_UNTIL (15 Dec 2026, 23:59 SGT), then never again —
 *    no need to remove the tag on the 16th.
 *  - Pops ~1.2s after load, once per visitor per day (closing it hides it for the day).
 *  - Early-bird price + "X 天后截止" countdown until each event's earlyBirdUntil, then
 *    falls back to the regular price automatically.
 *  - Chinese / English follows <html lang>.
 *  - Preview any time (even after the end date, or after dismissing): add ?event=1 to the URL.
 *  - GA4: fires `view_event_popup` and `click_event_signup` if gtag is on the page.
 *
 * To update: edit CONFIG below only.
 */
(function () {
  'use strict';

  var CONFIG = {
    // Popup stops showing after this moment (SGT).
    showUntil: '2026-12-15T23:59:59+08:00',

    heading: { zh: '紫微牌卡 · 两日速成班', en: 'Zi Wei Cards · 2-Day Intensive' },
    intro: {
      zh: '2026 年末限定小班实体课。两个周日，从零基础到能独立为自己和朋友解牌——不用排盘，也能读懂紫微。',
      en: 'A year-end, in-person small class in Singapore. Two Sundays, from zero to reading the cards for yourself and friends — no chart-casting needed.'
    },

    // One entry per event / workshop. Remove or add entries freely.
    events: [
      {
        title: { zh: '安妍老师主讲 · 新加坡线下小班', en: 'Taught by 安妍老师 (An Yan) · Singapore, in person' },
        date: { zh: '12月6日 & 13日（周日）', en: 'Sun 6 & Sun 13 Dec 2026' },
        time: { zh: '10:00am – 5:00pm', en: '10:00am – 5:00pm' },
        place: { zh: '新加坡线下 · 限 15 人，额满即止', en: 'Singapore · 15 seats only' },
        currency: 'SGD',
        earlyBirdPrice: 588,
        regularPrice: 880,
        earlyBirdUntil: '2026-11-30T23:59:59+08:00',
        // Extra price line, shown only during early bird.
        earlyNote: { zh: '两人同行每人 S$538 · 去年旧生 S$50', en: 'Two together: S$538 each · Returning students: S$50' },
        note: { zh: '去年旧生 S$50（行政及资料费）', en: 'Returning students: S$50 (admin & materials)' },
        bonus: { zh: '含一对一牌卡解读、牌卡一副、一年内免费重听等福利，总价值 S$1,638', en: 'Includes a 1-on-1 card reading, a card deck, free re-attendance for a year and more — worth S$1,638' },
        signupUrl: 'https://wa.me/6583188066?text=%E5%AE%89%E5%A6%8D%E8%80%81%E5%B8%88%E4%BD%A0%E5%A5%BD%EF%BC%8C%E6%88%91%E6%83%B3%E6%8A%A5%E5%90%8D%E3%80%8C%E7%B4%AB%E5%BE%AE%E7%89%8C%E5%8D%A1%E4%B8%A4%E6%97%A5%E9%80%9F%E6%88%90%E7%8F%AD%E3%80%8D%EF%BC%8812%E6%9C%886%E6%97%A5%20%26%2013%E6%97%A5%EF%BC%89%E3%80%82',
        detailsUrl: '/courses/course.html?slug=zw-cards-2026'
      }
    ],

    // Shown under the list. Leave '' to hide.
    footnote: { zh: '', en: '' },
    footnoteUrl: ''
  };

  // ───────────────────────────────────────────────────────────────────────

  var KEY = 'xt_event_popup_seen';
  var params;
  try { params = new URLSearchParams(location.search); } catch (e) { params = null; }
  var forced = !!(params && params.get('event') === '1');
  var now = Date.now();

  if (!forced && now > Date.parse(CONFIG.showUntil)) return;
  if (!CONFIG.events || !CONFIG.events.length) return;

  function sgDay() {
    try { return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Singapore' }); }
    catch (e) { return new Date().toISOString().slice(0, 10); }
  }
  function seenToday() {
    try { return localStorage.getItem(KEY) === sgDay(); } catch (e) { return false; }
  }
  function markSeen() {
    try { localStorage.setItem(KEY, sgDay()); } catch (e) { /* private mode: fine */ }
  }
  if (!forced && seenToday()) return;

  var lang = (document.documentElement.lang || '').toLowerCase().indexOf('en') === 0 ? 'en' : 'zh';
  function tr(v) { return v && typeof v === 'object' ? (v[lang] || v.zh || '') : (v || ''); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function money(cur, n) {
    var s = Number(n).toLocaleString('en-SG', { maximumFractionDigits: 2 });
    return cur + ' ' + s;
  }
  function track(name, extra) {
    if (typeof window.gtag === 'function') {
      var p = { page: location.pathname };
      for (var k in extra) p[k] = extra[k];
      window.gtag('event', name, p);
    }
  }

  var CSS = [
    '.xt-ev-back{position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;padding:16px;',
    'background:rgba(26,20,22,.55);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);opacity:0;transition:opacity .35s ease}',
    '.xt-ev-back.xt-ev-open{opacity:1}',
    '.xt-ev-box{position:relative;width:100%;max-width:460px;max-height:calc(100vh - 32px);max-height:calc(100dvh - 32px);overflow:auto;',
    'background:#F5EFE6;color:#1A1416;border-radius:16px;box-shadow:0 24px 60px rgba(26,20,22,.35);',
    'font-family:"Noto Sans SC",-apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif;',
    'transform:translateY(16px) scale(.98);transition:transform .45s cubic-bezier(.22,1,.36,1)}',
    '.xt-ev-open .xt-ev-box{transform:none}',
    '.xt-ev-top{background:#3B2A35;color:#F5EFE6;padding:28px 28px 22px;border-radius:16px 16px 0 0}',
    '.xt-ev-kicker{font-size:11px;letter-spacing:.24em;color:#C99A3F;margin:0 0 10px;text-transform:uppercase}',
    '.xt-ev-h{font-family:"Noto Serif SC",serif;font-weight:700;font-size:22px;line-height:1.35;margin:0 0 8px;padding-right:32px}',
    '.xt-ev-intro{font-size:14px;line-height:1.7;margin:0;color:rgba(245,239,230,.75)}',
    '.xt-ev-x{position:absolute;top:12px;right:12px;width:36px;height:36px;border:0;border-radius:50%;cursor:pointer;',
    'background:rgba(245,239,230,.12);color:#F5EFE6;font-size:20px;line-height:36px;padding:0}',
    '.xt-ev-x:hover,.xt-ev-x:focus-visible{background:rgba(245,239,230,.25);outline:none}',
    '.xt-ev-list{padding:8px 28px 4px;margin:0;list-style:none}',
    '.xt-ev-item{padding:20px 0;border-bottom:1px solid #D9CFC4}',
    '.xt-ev-item:last-child{border-bottom:0}',
    '.xt-ev-t{font-family:"Noto Serif SC",serif;font-weight:700;font-size:18px;line-height:1.4;margin:0 0 8px;color:#3B2A35}',
    '.xt-ev-meta{font-size:13px;line-height:1.8;color:#4A4045;margin:0 0 12px}',
    '.xt-ev-meta span{display:block}',
    '.xt-ev-price{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 10px;margin:0 0 14px}',
    '.xt-ev-tag{font-size:11px;letter-spacing:.08em;color:#fff;background:#C2603F;border-radius:4px;padding:3px 8px}',
    '.xt-ev-now{font-family:"Noto Serif SC",serif;font-size:24px;font-weight:700;color:#C2603F}',
    '.xt-ev-was{font-size:14px;color:#8A7F84;text-decoration:line-through}',
    '.xt-ev-left{flex-basis:100%;font-size:12px;color:#C2603F}',
    '.xt-ev-note{flex-basis:100%;font-size:12px;color:#4A4045}',
    '.xt-ev-bonus{font-size:13px;line-height:1.7;color:#4A4045;background:rgba(201,154,63,.12);border-radius:8px;padding:10px 12px;margin:0 0 14px}',
    '.xt-ev-more{display:block;text-align:center;margin-top:10px;font-size:13px;color:#3B2A35;text-underline-offset:3px}',
    '.xt-ev-cta{display:block;text-align:center;text-decoration:none;background:#C2603F;color:#fff;font-size:15px;',
    'letter-spacing:.06em;border-radius:8px;padding:13px 16px;transition:background .2s}',
    '.xt-ev-cta:hover,.xt-ev-cta:focus-visible{background:#a94f31;outline:none}',
    '.xt-ev-foot{padding:4px 28px 24px;margin:0;font-size:12px;color:#8A7F84;text-align:center}',
    '.xt-ev-foot a{color:#4A4045}',
    '.xt-ev-later{display:block;margin:10px auto 0;background:none;border:0;font:inherit;color:#8A7F84;font-size:13px;cursor:pointer;',
    'text-decoration:underline;text-underline-offset:3px;padding:6px}',
    '@media (max-width:480px){.xt-ev-top{padding:24px 20px 18px}.xt-ev-list{padding:4px 20px}.xt-ev-foot{padding:4px 20px 20px}.xt-ev-h{font-size:20px}}',
    '@media (prefers-reduced-motion:reduce){.xt-ev-back,.xt-ev-box{transition:none}}'
  ].join('');

  var T = {
    kicker: { zh: 'Upcoming · 近期活动', en: 'Upcoming events' },
    early: { zh: '早鸟价', en: 'Early bird' },
    price: { zh: '报名费', en: 'Fee' },
    signup: { zh: '立即报名', en: 'Register now' },
    details: { zh: '查看课程详情', en: 'Full course details' },
    later: { zh: '稍后再看', en: 'Maybe later' },
    close: { zh: '关闭', en: 'Close' },
    lastDay: { zh: '早鸟优惠今天截止', en: 'Early-bird price ends today' },
    daysLeft: { zh: '早鸟优惠还剩 {n} 天', en: 'Early-bird price ends in {n} days' }
  };

  function priceHtml(ev) {
    var ebEnd = Date.parse(ev.earlyBirdUntil || '');
    var early = ev.earlyBirdPrice && ebEnd && now <= ebEnd;
    if (early) {
      var days = Math.ceil((ebEnd - now) / 86400000);
      var left = days <= 1 ? tr(T.lastDay) : tr(T.daysLeft).replace('{n}', days);
      return '<p class="xt-ev-price"><span class="xt-ev-tag">' + esc(tr(T.early)) + '</span>' +
        '<span class="xt-ev-now">' + esc(money(ev.currency, ev.earlyBirdPrice)) + '</span>' +
        (ev.regularPrice ? '<span class="xt-ev-was">' + esc(money(ev.currency, ev.regularPrice)) + '</span>' : '') +
        '<span class="xt-ev-left">' + esc(left) + '</span>' +
        (tr(ev.earlyNote) ? '<span class="xt-ev-note">' + esc(tr(ev.earlyNote)) + '</span>' : '') + '</p>';
    }
    if (!ev.regularPrice) return '';
    return '<p class="xt-ev-price"><span class="xt-ev-now">' + esc(money(ev.currency, ev.regularPrice)) + '</span>' +
      (tr(ev.note) ? '<span class="xt-ev-note">' + esc(tr(ev.note)) + '</span>' : '') + '</p>';
  }

  function build() {
    var items = CONFIG.events.map(function (ev, i) {
      var meta = [tr(ev.date), tr(ev.time), tr(ev.place), tr(ev.seats)].filter(Boolean)
        .map(function (m) { return '<span>' + esc(m) + '</span>'; }).join('');
      var ext = /^https?:/.test(ev.signupUrl);
      return '<li class="xt-ev-item">' +
        '<h3 class="xt-ev-t">' + esc(tr(ev.title)) + '</h3>' +
        (meta ? '<p class="xt-ev-meta">' + meta + '</p>' : '') +
        priceHtml(ev) +
        (tr(ev.bonus) ? '<p class="xt-ev-bonus">' + esc(tr(ev.bonus)) + '</p>' : '') +
        '<a class="xt-ev-cta" data-i="' + i + '" href="' + esc(ev.signupUrl) + '"' +
        (ext ? ' target="_blank" rel="noopener"' : '') + '>' + esc(tr(T.signup)) + ' →</a>' +
        (ev.detailsUrl ? '<a class="xt-ev-more" href="' + esc(ev.detailsUrl) + '">' + esc(tr(T.details)) + '</a>' : '') +
        '</li>';
    }).join('');

    var foot = tr(CONFIG.footnote);
    var footHtml = foot
      ? (CONFIG.footnoteUrl ? '<a href="' + esc(CONFIG.footnoteUrl) + '" target="_blank" rel="noopener">' + esc(foot) + '</a>' : esc(foot))
      : '';

    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    var back = document.createElement('div');
    back.className = 'xt-ev-back';
    back.innerHTML =
      '<div class="xt-ev-box" role="dialog" aria-modal="true" aria-labelledby="xt-ev-h">' +
        '<div class="xt-ev-top">' +
          '<button type="button" class="xt-ev-x" aria-label="' + esc(tr(T.close)) + '">×</button>' +
          '<p class="xt-ev-kicker">' + esc(tr(T.kicker)) + '</p>' +
          '<h2 class="xt-ev-h" id="xt-ev-h">' + esc(tr(CONFIG.heading)) + '</h2>' +
          (tr(CONFIG.intro) ? '<p class="xt-ev-intro">' + esc(tr(CONFIG.intro)) + '</p>' : '') +
        '</div>' +
        '<ul class="xt-ev-list">' + items + '</ul>' +
        '<p class="xt-ev-foot">' + footHtml +
          '<button type="button" class="xt-ev-later">' + esc(tr(T.later)) + '</button></p>' +
      '</div>';
    document.body.appendChild(back);

    var prevFocus = document.activeElement;
    var prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function close() {
      markSeen();
      back.classList.remove('xt-ev-open');
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
      setTimeout(function () { if (back.parentNode) back.parentNode.removeChild(back); }, 350);
      if (prevFocus && prevFocus.focus) { try { prevFocus.focus(); } catch (e) {} }
    }
    function onKey(e) {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') { // keep focus inside the dialog
        var f = back.querySelectorAll('a[href],button');
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }

    back.addEventListener('click', function (e) {
      if (e.target === back) close();
      var cta = e.target.closest && e.target.closest('.xt-ev-cta');
      if (cta) {
        markSeen();
        var ev = CONFIG.events[+cta.getAttribute('data-i')] || {};
        track('click_event_signup', { event_title: tr(ev.title) });
      }
    });
    back.querySelector('.xt-ev-x').addEventListener('click', close);
    back.querySelector('.xt-ev-later').addEventListener('click', close);
    document.addEventListener('keydown', onKey);

    requestAnimationFrame(function () {
      back.classList.add('xt-ev-open');
      back.querySelector('.xt-ev-x').focus({ preventScroll: true });
    });
    track('view_event_popup', {});
  }

  function start() { setTimeout(build, forced ? 0 : 1200); }
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start);
})();
