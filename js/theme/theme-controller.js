import { saveTheme, themes } from '../state/preferences.js';

const autoTheme = 'auto-theme';
const autoBoundaryHours = [5, 9, 12, 15, 18, 21];

function getIstHour(date = new Date()) {
  const hour = Number(new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    hour12: false,
    hourCycle: 'h23'
  }).format(date));
  return hour === 24 ? 0 : hour;
}

export function getAutomaticTheme(date = new Date()) {
  const hour = getIstHour(date);
  if (hour >= 5 && hour < 9) return { theme: 'botanical-morning', label: 'Botanical Morning' };
  if (hour >= 9 && hour < 12) return { theme: 'tropical-paradise', label: 'Tropical Paradise' };
  if (hour >= 12 && hour < 15) return { theme: 'ocean-breeze', label: 'Ocean Breeze' };
  if (hour >= 15 && hour < 18) return { theme: 'midnight-forest', label: 'Dusk Forest' };
  if (hour >= 18 && hour < 21) return { theme: 'sunset-horizon', label: 'Sunset Horizon' };
  return { theme: 'starry-night', label: 'Starry Night' };
}

function getNextAutoBoundaryDelay(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date).reduce((values, part) => {
    if (part.type !== 'literal') values[part.type] = Number(part.value);
    return values;
  }, {});
  const istDayStart = Date.UTC(parts.year, parts.month - 1, parts.day, 0, -330);
  const now = date.getTime();
  const todayBoundary = autoBoundaryHours
    .map(hour => istDayStart + (hour * 60 * 60 * 1000))
    .find(timestamp => timestamp > now);
  const nextBoundary = todayBoundary ?? Date.UTC(parts.year, parts.month - 1, parts.day + 1, 5, -330);
  return Math.max(1000, nextBoundary - now + 50);
}

export function initThemeController(initialTheme, onThemeChange) {
  const root = document.documentElement;
  const select = document.querySelector('[data-theme-select]');
  const autoStatus = document.querySelector('[data-theme-auto-status]');
  let hasMounted = false;
  let transitionTimer;
  let autoTimer;
  const apply = theme => {
    if (!themes.includes(theme)) return;
    const automaticTheme = theme === autoTheme ? getAutomaticTheme() : null;
    const resolvedTheme = automaticTheme?.theme || theme;
    if (hasMounted && root.dataset.theme !== resolvedTheme) {
      window.clearTimeout(transitionTimer);
      root.classList.add('theme-transitioning');
      transitionTimer = window.setTimeout(() => root.classList.remove('theme-transitioning'), 420);
    }
    root.dataset.theme = resolvedTheme;
    root.dataset.themeSelection = theme;
    if (select) select.value = theme;
    if (autoStatus) {
      autoStatus.hidden = theme !== autoTheme;
      autoStatus.textContent = automaticTheme ? `Automatic · ${automaticTheme.label}` : '';
    }
    saveTheme(theme);
    onThemeChange?.(resolvedTheme);
    hasMounted = true;
    window.clearTimeout(autoTimer);
    if (theme === autoTheme) {
      autoTimer = window.setTimeout(() => apply(autoTheme), getNextAutoBoundaryDelay());
    }
  };

  apply(initialTheme);
  select?.addEventListener('change', event => apply(event.target.value));
}
