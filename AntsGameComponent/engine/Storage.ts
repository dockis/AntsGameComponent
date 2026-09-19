export class Storage {
  private readonly prefix: string;

  constructor(namespace = 'mravenci:') {
    this.prefix = namespace;
  }

  get<T>(key: string, defaultValue: T): T {
    try {
      const raw = localStorage.getItem(this.prefix + key);
      return raw === null ? defaultValue : (JSON.parse(raw) as T);
    } catch {
      return defaultValue;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
    } catch {
      // localStorage nedostupné (např. private mode) — hra běží dál, jen bez zapamatování progresu.
    }
  }
}
