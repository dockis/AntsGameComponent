import { Target } from './target.js';
import { AntManager } from './antManager.js';
import { InputManager } from './input.js';

const MAX_DT = 0.1;

const STATES = Object.freeze({
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  LEVEL_COMPLETE: 'LEVEL_COMPLETE',
  GAME_OVER: 'GAME_OVER',
  PAUSED: 'PAUSED',
});

export class Game {
  constructor() {
    this.state = STATES.MENU;
    this.lastTimestamp = null;
    this._rafId = null;

    this._onVisibilityChange = this._onVisibilityChange.bind(this);
    this._onBlur = this._onBlur.bind(this);
    this._tick = this._tick.bind(this);

    this.target = new Target(document.getElementById('target'), {
      onDestroyed: () => this.gameOver(),
    });
    this.antManager = new AntManager(document.getElementById('ants-layer'), this.target);
    this.antManager.spawn('normal');
    this.inputManager = new InputManager(document.getElementById('scene'), this.antManager);

    this._bindDebugControls();
  }

  _bindDebugControls() {
    const debugDamageBtn = document.getElementById('debug-damage-btn');
    debugDamageBtn.addEventListener('click', () => this.target.applyDamage(10));
  }

  start() {
    // Stub: menu/onboarding zatím neexistuje, rovnou přejdeme do PLAYING.
    this.state = STATES.PLAYING;

    document.addEventListener('visibilitychange', this._onVisibilityChange);
    window.addEventListener('blur', this._onBlur);

    this.lastTimestamp = performance.now();
    this._rafId = requestAnimationFrame(this._tick);
  }

  update(dt) {
    this.antManager.update(dt);
  }

  pause() {
    if (this.state !== STATES.PLAYING) return;
    this.state = STATES.PAUSED;
    console.log('[Game] -> PAUSED');
  }

  gameOver() {
    if (this.state !== STATES.PLAYING) return;
    this.state = STATES.GAME_OVER;
    console.log('[Game] -> GAME_OVER');
  }

  _onVisibilityChange() {
    if (document.hidden) {
      this.pause();
    } else {
      this.lastTimestamp = performance.now();
      console.log('[Game] visible again, lastTimestamp reset');
    }
  }

  _onBlur() {
    this.pause();
  }

  _tick(timestamp) {
    const dt = Math.min((timestamp - this.lastTimestamp) / 1000, MAX_DT);
    this.lastTimestamp = timestamp;

    if (this.state === STATES.PLAYING) {
      this.update(dt);
    }

    this._rafId = requestAnimationFrame(this._tick);
  }
}

const game = new Game();
game.start();
