import { Target } from './target.js';
import { AntManager } from './antManager.js';
import { InputManager } from './input.js';
import { UIManager } from './ui.js';

const MAX_DT = 0.1;

const STATES = Object.freeze({
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  LEVEL_COMPLETE: 'LEVEL_COMPLETE',
  GAME_OVER: 'GAME_OVER',
  PAUSED: 'PAUSED',
});

// Natvrdo pro feature 06, dokud feature 08 nenapojí LevelManager na LEVELS z config.js.
const LEVEL_CONFIG = {
  level: 1,
  killTarget: 20,
  maxAnts: 8,
  spawnInterval: [800, 1300],
  speedMultiplier: 1.1,
};

export class Game {
  constructor() {
    this.state = STATES.MENU;
    this.lastTimestamp = null;
    this._rafId = null;
    this.killedCount = 0;

    this._onVisibilityChange = this._onVisibilityChange.bind(this);
    this._onBlur = this._onBlur.bind(this);
    this._tick = this._tick.bind(this);

    this.target = new Target(document.getElementById('target'), {
      onDestroyed: () => this.gameOver(),
    });
    this.antManager = new AntManager(document.getElementById('ants-layer'), this.target, LEVEL_CONFIG, {
      onKill: () => this._onAntKilled(),
    });
    this.inputManager = new InputManager(document.getElementById('scene'), this.antManager);
    this.uiManager = new UIManager();
    this.uiManager.setLevel(LEVEL_CONFIG.level);
    this._updateHud();

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
    this._updateHud();
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

  levelComplete() {
    if (this.state !== STATES.PLAYING) return;
    this.state = STATES.LEVEL_COMPLETE;
    console.log('[Game] -> LEVEL_COMPLETE');
  }

  _onAntKilled() {
    if (this.state !== STATES.PLAYING) return;

    this.killedCount++;
    if (this.killedCount >= LEVEL_CONFIG.killTarget) {
      this.levelComplete();
    }
  }

  _updateHud() {
    this.uiManager.update({
      killedCount: this.killedCount,
      killTarget: LEVEL_CONFIG.killTarget,
      healthRatio: this.target.health / this.target.maxHealth,
    });
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
