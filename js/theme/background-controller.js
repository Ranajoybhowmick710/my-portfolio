import { backgrounds, saveBackground } from '../state/preferences.js';

export function initBackgroundController(initialBackground, onBackgroundChange) {
  const body = document.body;
  const select = document.querySelector('[data-background-select]');
  let hasMounted = false;
  let transitionTimer;

  const apply = background => {
    if (!backgrounds.includes(background)) return;
    if (hasMounted && body.dataset.background !== background) {
      window.clearTimeout(transitionTimer);
      body.classList.add('background-transitioning');
      transitionTimer = window.setTimeout(() => body.classList.remove('background-transitioning'), 520);
    }
    body.dataset.background = background;
    if (select) select.value = background;
    saveBackground(background);
    onBackgroundChange?.(background);
    hasMounted = true;
  };

  apply(initialBackground);
  select?.addEventListener('change', event => apply(event.target.value));
}
