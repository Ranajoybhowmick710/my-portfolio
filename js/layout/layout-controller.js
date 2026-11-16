import { layouts, saveLayout } from '../state/preferences.js';

export function initLayoutController(initialLayout) {
  const body = document.body;
  const select = document.querySelector('[data-layout-select]');
  let hasMounted = false;
  let transitionTimer;
  const apply = layout => {
    if (!layouts.includes(layout)) return;
    if (hasMounted && body.dataset.layout !== layout) {
      window.clearTimeout(transitionTimer);
      body.classList.add('layout-transitioning');
      transitionTimer = window.setTimeout(() => body.classList.remove('layout-transitioning'), 420);
    }
    body.dataset.layout = layout;
    if (select) select.value = layout;
    saveLayout(layout);
    hasMounted = true;
  };

  apply(initialLayout);
  select?.addEventListener('change', event => apply(event.target.value));
}
