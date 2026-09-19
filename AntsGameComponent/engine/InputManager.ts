import type { AntManager } from './AntManager';
import type { AntElement } from './Ant';

export class InputManager {
  private readonly sceneElement: SVGSVGElement;
  private readonly antManager: AntManager;
  private readonly onPointerDown: (event: PointerEvent) => void;

  constructor(sceneElement: SVGSVGElement, antManager: AntManager) {
    this.sceneElement = sceneElement;
    this.antManager = antManager;
    this.onPointerDown = this._onPointerDown.bind(this);
    sceneElement.addEventListener('pointerdown', this.onPointerDown);
  }

  private _onPointerDown(event: PointerEvent): void {
    const target = event.target as Element | null;
    const antEl = target?.closest('.ant') as AntElement | null;
    if (!antEl?.ant?.active) return;

    this.antManager.registerHit(antEl.ant);
  }

  destroy(): void {
    this.sceneElement.removeEventListener('pointerdown', this.onPointerDown);
  }
}
