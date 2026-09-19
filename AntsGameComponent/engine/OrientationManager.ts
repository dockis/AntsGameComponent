// Otočí kontejner přes CSS tak, aby hra vizuálně zůstala v portraitu i při fyzickém
// landscape. matchMedia slouží jako "gate" (landscape vs. portrait) — spouští se přes
// @media (orientation: landscape) v *.module.css. screen.orientation/orientationchange
// navíc dopočítává SMĚR rotace (cw/ccw): matchMedia nevystřelí change při přechodu přímo
// mezi landscape-primary a landscape-secondary (bez průchodu portraitem), takže by bez
// tohoto druhého listeneru zůstal obsah otočený špatným směrem. Viz sekce 17, 19
// dokumentu 00, feature 15. Instancuje se jen když je AntsGameComponent v `fullscreen`
// módu (viz plán migrace, sekce "Rizika").
const LANDSCAPE_QUERY = '(orientation: landscape)';

type Direction = 'cw' | 'ccw';

// Poslední záchrana, když není k dispozici žádné orientation API.
const DEFAULT_DIRECTION: Direction = 'cw';

interface WindowWithLegacyOrientation {
  orientation?: number;
}

export class OrientationManager {
  private readonly container: HTMLElement;
  private readonly mql: MediaQueryList;
  private readonly onMqlChange: () => void;
  private readonly onScreenOrientationChange: (() => void) | null = null;
  private readonly onWindowOrientationChange: (() => void) | null = null;
  private _lastDirection: Direction = DEFAULT_DIRECTION;

  constructor(containerElement: HTMLElement) {
    this.container = containerElement;
    this.onMqlChange = () => this._applyDirection();

    this.mql = window.matchMedia(LANDSCAPE_QUERY);
    this.mql.addEventListener('change', this.onMqlChange);

    if (screen.orientation) {
      this.onScreenOrientationChange = () => this._applyDirection();
      screen.orientation.addEventListener('change', this.onScreenOrientationChange);
    } else {
      // Fallback pro starší prohlížeče bez screen.orientation (starší iOS Safari).
      this.onWindowOrientationChange = () => this._applyDirection();
      window.addEventListener('orientationchange', this.onWindowOrientationChange);
    }

    this._applyDirection();
  }

  // Mapování landscape-primary/-secondary (resp. window.orientation 90/-90) na cw/ccw
  // je ověřené jen odhadem — směr rotace se mezi výrobci/OS historicky liší. Pokud
  // ruční test na reálném zařízení (viz akceptační kritéria feature 15) ukáže obrácený
  // směr, prohoďte zde 'cw' <-> 'ccw'.
  private _detectDirection(): Direction {
    if (screen.orientation) {
      if (screen.orientation.type === 'landscape-primary') return 'cw';
      if (screen.orientation.type === 'landscape-secondary') return 'ccw';
      return this._lastDirection;
    }
    const legacyOrientation = (window as unknown as WindowWithLegacyOrientation).orientation;
    if (typeof legacyOrientation === 'number') {
      if (legacyOrientation === 90) return 'cw';
      if (legacyOrientation === -90 || legacyOrientation === 270) return 'ccw';
      return this._lastDirection;
    }
    return DEFAULT_DIRECTION;
  }

  private _applyDirection(): void {
    this._lastDirection = this._detectDirection();
    this.container.classList.toggle('rotate-cw', this._lastDirection === 'cw');
    this.container.classList.toggle('rotate-ccw', this._lastDirection === 'ccw');
  }

  destroy(): void {
    this.mql.removeEventListener('change', this.onMqlChange);
    if (screen.orientation && this.onScreenOrientationChange) {
      screen.orientation.removeEventListener('change', this.onScreenOrientationChange);
    }
    if (this.onWindowOrientationChange) {
      window.removeEventListener('orientationchange', this.onWindowOrientationChange);
    }
  }
}
