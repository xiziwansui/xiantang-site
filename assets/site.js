// Shared site behavior — Xiantang.life
(function () {
  const nav = document.getElementById('site-nav');
  if (nav && nav.classList.contains('transparent')) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    }, { passive: true });
  }
  const revealEls = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => obs.observe(el));

  window.handleModalBackdropClick = function (e) {
    const m = document.getElementById('wechat-modal');
    if (m && e.target === m) m.classList.remove('open');
  };
  window.openWeChatModal = function () {
    const m = document.getElementById('wechat-modal');
    if (m) m.classList.add('open');
  };
  window.closeWeChatModal = function () {
    const m = document.getElementById('wechat-modal');
    if (m) m.classList.remove('open');
  };
})();
