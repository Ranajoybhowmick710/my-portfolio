import { readStorage, writeStorage } from './storage.js';

export const themes = ['auto-theme', 'botanical-morning', 'tropical-paradise', 'ocean-breeze', 'sunset-horizon', 'midnight-forest', 'starry-night'];
export const layouts = ['nature-editorial', 'modern-bento', 'creative-storytelling', 'minimal-developer'];
export const backgrounds = ['theme', 'starry-sky'];

const themeKey = 'ranajoy-portfolio:theme:v1';
const layoutKey = 'ranajoy-portfolio:layout:v1';
const backgroundKey = 'ranajoy-portfolio:background:v1';

export function loadPreferences() {
  return {
    theme: readStorage(themeKey, value => themes.includes(value), 'auto-theme'),
    layout: readStorage(layoutKey, value => layouts.includes(value), layouts[0]),
    background: readStorage(backgroundKey, value => backgrounds.includes(value), backgrounds[0])
  };
}

export function saveTheme(theme) {
  if (themes.includes(theme)) writeStorage(themeKey, theme);
}

export function saveLayout(layout) {
  if (layouts.includes(layout)) writeStorage(layoutKey, layout);
}

export function saveBackground(background) {
  if (backgrounds.includes(background)) writeStorage(backgroundKey, background);
}
