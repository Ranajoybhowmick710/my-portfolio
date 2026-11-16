export function readStorage(key, isValid, fallback) {
  try {
    const value = window.localStorage.getItem(key);
    return value && isValid(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Preferences remain functional for the current session when storage is unavailable.
  }
}
