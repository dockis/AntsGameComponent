const PREFIX = 'mravenci:';

export const Storage = {
  get(key, defaultValue) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw === null ? defaultValue : JSON.parse(raw);
    } catch {
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      // localStorage nedostupné (např. private mode) — hra běží dál, jen bez zapamatování progresu.
    }
  },
};
