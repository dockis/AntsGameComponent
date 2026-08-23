import { Target } from './target.js';
import { AntManager } from './antManager.js';
import { InputManager } from './input.js';
import { UIManager } from './ui.js';
import { LevelManager } from './levelManager.js';

const MAX_DT = 0.1;

const STATES = Object.freeze({
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  LEVEL_COMPLETE: 'LEVEL_COMPLETE',
  GAME_OVER: 'GAME_OVER',
  PAUSED: 'PAUSED',
});

// Viz 00-koncept-a-design-dokument.md, sekce 17 — kompletní tabulka povolených přechodů.
const STATE_TRANSITIONS = Object.freeze({
  [STATES.MENU]: [STATES.PLAYING],
  [STATES.PLAYING]: [STATES.LEVEL_COMPLETE, STATES.GAME_OVER, STATES.PAUSED],
  [STATES.LEVEL_COMPLETE]: [STATES.PLAYING, STATES.MENU],
  [STATES.GAME_OVER]: [STATES.PLAYING, STATES.MENU],
  [STATES.PAUSED]: [STATES.PLAYING],
});

export class Game {
  constructor() {
    this.state = STATES.MENU;
    this.lastTimestamp = null;
    this._rafId = null;
    this.killedCount = 0;
    this._onboardingSeen = false;
    this._lastFailureAction = null;
    this._lastLevelResult = null;

    this._onVisibilityChange = this._onVisibilityChange.bind(this);
    this._onBlur = this._onBlur.bind(this);
    this._tick = this._tick.bind(this);

    this.levelManager = new LevelManager();

    this.target = new Target(document.getElementById('target'), {
      onDestroyed: () => this.gameOver(),
    });
    this.antManager = new AntManager(document.getElementById('ants-layer'), this.target, this.levelManager.config, {
      onKill: () => this._onAntKilled(),
    });
    this.inputManager = new InputManager(document.getElementById('scene'), this.antManager);
    this.uiManager = new UIManager({
      onStart: () => this.startGame(),
      onRetry: () => this.retryLevel(),
      onContinue: () => this.continueLevel(),
      onResume: () => this.resumeGame(),
    });
    this.uiManager.setLevel(this.levelManager.currentLevel);
    this.uiManager.setState(this.state);
    this._updateHud();

    this._bindDebugControls();
  }

  _bindDebugControls() {
    const debugDamageBtn = document.getElementById('debug-damage-btn');
    debugDamageBtn.addEventListener('click', () => this.target.applyDamage(10));
  }

  start() {
    document.addEventListener('visibilitychange', this._onVisibilityChange);
    window.addEventListener('blur', this._onBlur);

    this.lastTimestamp = performance.now();
    this._rafId = requestAnimationFrame(this._tick);
  }

  update(dt) {
    this.antManager.update(dt);
    this._updateHud();
  }

  startGame() {
    this._startLevel();
    this._transitionTo(STATES.PLAYING);
    if (!this._onboardingSeen) {
      this._onboardingSeen = true;
      this.uiManager.showOnboarding();
    }
  }

  retryLevel() {
    if (this._lastFailureAction === 'reset') {
      this._transitionTo(STATES.MENU);
      return;
    }
    this._startLevel();
    this._transitionTo(STATES.PLAYING);
  }

  continueLevel() {
    if (this._lastLevelResult?.gameComplete) {
      this._transitionTo(STATES.MENU);
      return;
    }
    this._startLevel();
    this._transitionTo(STATES.PLAYING);
  }

  resumeGame() {
    this._transitionTo(STATES.PLAYING);
  }

  pause() {
    if (this.state !== STATES.PLAYING) return;
    this._transitionTo(STATES.PAUSED);
  }

  gameOver() {
    if (this.state !== STATES.PLAYING) return;

    const level = this.levelManager.currentLevel;
    const result = this.levelManager.registerFailure();
    this._lastFailureAction = result.action;
    this._transitionTo(STATES.GAME_OVER);

    if (result.action === 'reset') {
      this.uiManager.setGameOverInfo({
        message: `Vráceno na level 1 (level ${level} se nepodařilo dokončit).`,
        buttonLabel: 'Zpět na start',
      });
    } else {
      const totalText = result.maxAttempts != null ? ` z ${result.maxAttempts}` : '';
      this.uiManager.setGameOverInfo({
        message: `Level ${level} — pokus ${result.attemptNumber}${totalText}`,
        buttonLabel: 'Zkusit znovu',
      });
    }
  }

  levelComplete() {
    if (this.state !== STATES.PLAYING) return;

    const completedLevel = this.levelManager.currentLevel;
    const result = this.levelManager.registerSuccess();
    this._lastLevelResult = result;
    this._transitionTo(STATES.LEVEL_COMPLETE);

    this.uiManager.setLevelCompleteInfo({
      message: result.gameComplete
        ? 'Hra dokončena! Zvládl jsi všech 12 levelů.'
        : `Level ${completedLevel} splněn!`,
      buttonLabel: result.gameComplete ? 'Zpět do menu' : 'Pokračovat',
    });
  }

  _startLevel() {
    this._resetScene();
    this.antManager.setLevelConfig(this.levelManager.config);
    this.uiManager.setLevel(this.levelManager.currentLevel);
  }

  _transitionTo(nextState) {
    const allowed = STATE_TRANSITIONS[this.state] || [];
    if (!allowed.includes(nextState)) {
      console.warn(`[Game] neplatný přechod ${this.state} -> ${nextState}, ignoruji`);
      return;
    }
    this.state = nextState;
    this.uiManager.setState(nextState);
    console.log(`[Game] -> ${nextState}`);
  }

  _resetScene() {
    this.antManager.reset();
    this.target.reset();
    this.killedCount = 0;
    this._updateHud();
  }

  _onAntKilled() {
    if (this.state !== STATES.PLAYING) return;

    this.killedCount++;
    if (this.killedCount >= this.levelManager.config.killTarget) {
      this.levelComplete();
    }
  }

  _updateHud() {
    this.uiManager.update({
      killedCount: this.killedCount,
      killTarget: this.levelManager.config.killTarget,
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
