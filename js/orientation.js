// Detekce orientace přes matchMedia — nezávislé na rozlišení/DPI, funguje na resize i rotaci. Viz sekce 19 dokumentu 00.
const LANDSCAPE_QUERY = '(orientation: landscape)';

export class OrientationManager {
  constructor({ onChange } = {}) {
    this.onChange = onChange;
    this._mql = window.matchMedia(LANDSCAPE_QUERY);
    this._mql.addEventListener('change', (e) => this.onChange?.(e.matches));
    this.onChange?.(this._mql.matches);
  }
}
