// Otočí #game-container přes CSS tak, aby hra vizuálně zůstala v portraitu i při
// fyzickém landscape. matchMedia slouží jako "gate" (landscape vs. portrait) — spouští
// se přes @media (orientation: landscape) v css/style.css. screen.orientation/
// orientationchange navíc dopočítává SMĚR rotace (cw/ccw): matchMedia nevystřelí
// change při přechodu přímo mezi landscape-primary a landscape-secondary (bez
// průchodu portraitem), takže by bez tohoto druhého listeneru zůstal obsah otočený
// špatným směrem. Viz sekce 17, 19 dokumentu 00, feature 15.
const LANDSCAPE_QUERY = '(orientation: landscape)';

// Poslední záchrana, když není k dispozici žádné orientation API.
const DEFAULT_DIRECTION = 'cw';

export class OrientationManager {
  constructor(containerElement) {
    this.container = containerElement;
    this._lastDirection = DEFAULT_DIRECTION;

    const mql = window.matchMedia(LANDSCAPE_QUERY);
    mql.addEventListener('change', () => this._applyDirection());

    if (screen.orientation) {
      screen.orientation.addEventListener('change', () => this._applyDirection());
    } else {
      // Fallback pro starší prohlížeče bez screen.orientation (starší iOS Safari).
      window.addEventListener('orientationchange', () => this._applyDirection());
    }

    this._applyDirection();
  }

  // Mapování landscape-primary/-secondary (resp. window.orientation 90/-90) na cw/ccw
  // je ověřené jen odhadem — směr rotace se mezi výrobci/OS historicky liší. Pokud
  // ruční test na reálném zařízení (viz akceptační kritéria feature 15) ukáže obrácený
  // směr, prohoďte zde 'cw' <-> 'ccw'.
  _detectDirection() {
    if (screen.orientation) {
      if (screen.orientation.type === 'landscape-primary') return 'cw';
      if (screen.orientation.type === 'landscape-secondary') return 'ccw';
      return this._lastDirection;
    }
    if (typeof window.orientation === 'number') {
      if (window.orientation === 90) return 'cw';
      if (window.orientation === -90 || window.orientation === 270) return 'ccw';
      return this._lastDirection;
    }
    return DEFAULT_DIRECTION;
  }

  _applyDirection() {
    this._lastDirection = this._detectDirection();
    this.container.classList.toggle('rotate-cw', this._lastDirection === 'cw');
    this.container.classList.toggle('rotate-ccw', this._lastDirection === 'ccw');
  }
}
