(() => {
  'use strict';
  const config = window.HSO_CONFIG || {};
  const safeUrl = value => {
    if (!value) return null;
    try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : null; } catch { return null; }
  };
  const destinations = {
    application: safeUrl(config.lineUrl), line: safeUrl(config.lineUrl),
    company: safeUrl(config.companyUrl), privacy: safeUrl(config.privacyUrl),
  };
  const dialog = document.querySelector('#notice-dialog');
  let returnFocus;
  const closeDialog = () => dialog.close();
  dialog.querySelector('.dialog-close').addEventListener('click', closeDialog);
  dialog.querySelector('.dialog-return').addEventListener('click', closeDialog);
  dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeDialog(); } });
  dialog.addEventListener('close', () => { document.body.classList.remove('dialog-open'); returnFocus?.focus({ preventScroll: true }); });
  const showNotice = (kind, opener) => {
    const section = document.querySelector(`#${kind}-unavailable`);
    if (typeof dialog.showModal !== 'function') { location.hash = `${kind}-unavailable`; return; }
    document.querySelector('#notice-title').textContent = section.querySelector('h2').textContent;
    document.querySelector('#notice-body').textContent = section.querySelector('p').textContent;
    returnFocus = opener;
    document.body.classList.add('dialog-open');
    dialog.showModal();
  };
  document.querySelectorAll('[data-cta], [data-info]').forEach(link => {
    const kind = link.dataset.cta || link.dataset.info;
    if (destinations[kind]) link.href = destinations[kind];
    link.addEventListener('click', event => {
      if (link.dataset.cta) {
        // A click is not a completed application. No personal data or destination query strings.
        const payload = {
          event: 'hso_cta_click', cta_type: kind, cta_placement: link.dataset.placement,
          destination_configured: Boolean(destinations[kind]), destination_type: 'official_line', page_variant: 'hso_white_orange_v3_icons',
        };
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(payload);
        window.dispatchEvent(new CustomEvent('hso:cta', { detail: payload }));
      }
      if (!destinations[kind]) { event.preventDefault(); showNotice(kind, link); }
    });
  });
  // Show one mobile action only when both hero and final actions are out of view.
  const sticky = document.querySelector('.mobile-sticky');
  const hero = document.querySelector('.hero-action');
  const final = document.querySelector('.final-cta');
  const footer = document.querySelector('footer');
  const updateSticky = () => {
    const heroBottom = hero.getBoundingClientRect().bottom;
    const finalRect = final.getBoundingClientRect();
    const footerTop = footer.getBoundingClientRect().top;
    sticky.hidden = innerWidth > 760 || heroBottom > 0 || (finalRect.top < innerHeight && finalRect.bottom > 0) || footerTop < innerHeight;
  };
  let scheduled = false;
  const scheduleSticky = () => { if (!scheduled) { scheduled = true; requestAnimationFrame(() => { updateSticky(); scheduled = false; }); } };
  addEventListener('scroll', scheduleSticky, { passive: true });
  addEventListener('resize', scheduleSticky);
  updateSticky();
})();
