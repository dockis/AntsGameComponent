export class InputManager {
  constructor(sceneElement, antManager) {
    this.antManager = antManager;

    sceneElement.addEventListener('pointerdown', this._onPointerDown.bind(this));
  }

  _onPointerDown(event) {
    const antEl = event.target.closest('.ant');
    if (!antEl || !antEl.ant || !antEl.ant.active) return;

    this.antManager.kill(antEl.ant);
  }
}
