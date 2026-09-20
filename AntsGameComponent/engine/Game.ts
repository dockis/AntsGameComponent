import type { AntsGameConfig } from '../config/schema';
import type { GameState } from '../types';
import { AntManager } from './AntManager';
import { AudioManager, type SoundName } from './AudioManager';
import { InputManager } from './InputManager';
import { LevelManager } from './LevelManager';
import { OrientationManager } from './OrientationManager';
import type { Storage } from './Storage';
import type { SvgAssetLoader } from './svgAssets';
import { Target } from './Target';

const MAX_DT = 0.1;

const STATES: Record<GameState, GameState> = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  LEVEL_COMPLETE: 'LEVEL_COMPLETE',
  GAME_OVER: 'GAME_OVER',
  PAUSED: 'PAUSED',
};

// Viz 00-koncept-a-design-dokument.md, sekce 17 — kompletní tabulka povolených přechodů.
const STATE_TRANSITIONS: Record<GameState, GameState[]> = {
  MENU: [STATES.PLAYING],
  PLAYING: [STATES.LEVEL_COMPLETE, STATES.GAME_OVER, STATES.PAUSED],
  LEVEL_COMPLETE: [STATES.PLAYING, STATES.MENU],
  GAME_OVER: [STATES.PLAYING, STATES.MENU],
  PAUSED: [STATES.PLAYING],
};

export interface GameRefs {
  /** Kořenový element komponenty — cíl pro OrientationManager a scoped pointerdown (audio unlock). */
  root: HTMLElement;
  scene: SVGSVGElement;
  targetGroup: SVGGElement;
  antsLayer: SVGGElement;
  stainsLayer: SVGGElement;
}

export interface HudState {
  state: GameState;
  level: number;
  highestUnlocked: number;
  /** true, pokud hráč už má rozehraný postup — Overlay podle toho zobrazí "Pokračovat" v menu. */
  hasProgress: boolean;
  killedCount: number;
  killTarget: number;
  healthRatio: number;
}

export interface LevelCompleteInfo {
  level: number;
  gameComplete: boolean;
  /** Počet levelů v aktuálním configu — Overlay (krok 7) z toho skládá "Hra dokončena!" text bez natvrdo zapsané "12". */
  totalLevels: number;
}

export interface GameOverInfo {
  level: number;
  action: 'retry' | 'reset';
  attemptNumber: number | null;
  maxAttempts: number | null;
}

export interface GameCallbacks {
  onStateChange?: (state: GameState) => void;
  /** Interní callback pro Hud/Overlay (krok 7) — NENÍ součástí veřejného AntsGameComponentProps API. */
  onHudUpdate?: (hud: HudState) => void;
  onLevelComplete?: (info: LevelCompleteInfo) => void;
  onGameOver?: (info: GameOverInfo) => void;
  onAntKilled?: (info: { killedCount: number; killTarget: number }) => void;
  onShowIntro?: () => void;
  onHideIntro?: () => void;
}

export interface GameDeps extends GameCallbacks {
  config: AntsGameConfig;
  svgAssets: SvgAssetLoader;
  storage: Storage;
  audioBaseUrl: string;
  audioOverrides?: Partial<Record<SoundName, string>>;
  /** Řídí, zda se instancuje OrientationManager (viz plán, sekce "Rizika"). */
  fullscreen: boolean;
}

export class Game {
  state: GameState = STATES.MENU;

  readonly levelManager: LevelManager;
  readonly audioManager: AudioManager;
  readonly target: Target;
  readonly antManager: AntManager;
  readonly inputManager: InputManager;
  readonly orientationManager: OrientationManager | null;

  private readonly refs: GameRefs;
  private readonly deps: GameDeps;

  private lastTimestamp: number | null = null;
  private _rafId: number | null = null;
  private _introTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private _started = false;
  private killedCount = 0;
  private _lastFailureAction: 'retry' | 'reset' | null = null;
  private _lastLevelResult: { gameComplete: boolean } | null = null;

  private readonly _onVisibilityChange: () => void;
  private readonly _onBlur: () => void;
  private readonly _tick: (timestamp: number) => void;
  private readonly _unlockAudioOnce: () => void;

  constructor(refs: GameRefs, deps: GameDeps) {
    this.refs = refs;
    this.deps = deps;

    this._onVisibilityChange = this._handleVisibilityChange.bind(this);
    this._onBlur = this._handleBlur.bind(this);
    this._tick = this._handleTick.bind(this);
    this._unlockAudioOnce = () => this.audioManager.unlock();

    this.levelManager = new LevelManager(deps.config.levels, deps.config.game.retry, deps.storage);
    this.audioManager = new AudioManager({
      baseUrl: deps.audioBaseUrl,
      overrides: deps.audioOverrides,
      storage: deps.storage,
    });
    // Na rozdíl od js/game.js (listener na document) je scoped na root komponenty,
    // aby klik kdekoli jinde na hostitelské stránce audio neodemykal (viz plán, sekce "Rizika").
    refs.root.addEventListener('pointerdown', this._unlockAudioOnce, { once: true });

    this.target = new Target(
      refs.targetGroup,
      { config: deps.config.game, svgAssets: deps.svgAssets },
      {
        typeKey: `level${this.levelManager.config.level}`,
        onDestroyed: () => this.gameOver(),
        onCriticalHealth: () => this.audioManager.play('criticalHealth'),
      }
    );

    this.antManager = new AntManager(refs.antsLayer, this.target, this.levelManager.config, {
      stainsLayerElement: refs.stainsLayer,
      config: deps.config.game,
      antTypes: deps.config.antTypes,
      svgAssets: deps.svgAssets,
      onKill: () => {
        this._onAntKilled();
        this.audioManager.play('kill');
      },
      onHit: () => this.audioManager.play('hit'),
      onArmoredFirstHit: () => this.audioManager.play('armoredFirstHit'),
      onConsumeTick: () => this.audioManager.play('consumeTick'),
    });

    this.inputManager = new InputManager(refs.scene, this.antManager);
    this.orientationManager = deps.fullscreen ? new OrientationManager(refs.root) : null;

    this._emitStateChange();
    this._emitHud();
  }

  start(): void {
    if (this._started) return;
    this._started = true;

    document.addEventListener('visibilitychange', this._onVisibilityChange);
    window.addEventListener('blur', this._onBlur);

    this.lastTimestamp = performance.now();
    this._rafId = requestAnimationFrame(this._tick);
  }

  // Nutné doplnění oproti js/game.js (dnes neexistuje — stránka se nikdy needitovala).
  // V React komponentě se AntsGameComponent běžně unmountuje, viz plán, sekce "Rizika".
  destroy(): void {
    if (this._rafId !== null) cancelAnimationFrame(this._rafId);
    if (this._introTimeoutId !== null) clearTimeout(this._introTimeoutId);
    document.removeEventListener('visibilitychange', this._onVisibilityChange);
    window.removeEventListener('blur', this._onBlur);
    this.refs.root.removeEventListener('pointerdown', this._unlockAudioOnce);
    this.inputManager.destroy();
    this.orientationManager?.destroy();
    this.audioManager.destroy();
  }

  update(dt: number): void {
    this.antManager.update(dt);
    this._emitHud();
  }

  startGame(): void {
    this._startLevel();
    this._transitionTo(STATES.PLAYING);
  }

  startNewGame(): void {
    this.levelManager.resetToLevel1();

    if (this._introTimeoutId !== null) clearTimeout(this._introTimeoutId);
    this.deps.onShowIntro?.();
    this._introTimeoutId = setTimeout(() => {
      this._introTimeoutId = null;
      this.startGame();
      this.deps.onHideIntro?.();
    }, this.deps.config.game.introDurationMs);
  }

  retryLevel(): void {
    if (this._lastFailureAction === 'reset') {
      this._transitionTo(STATES.MENU);
      return;
    }
    this._startLevel();
    this._transitionTo(STATES.PLAYING);
  }

  continueLevel(): void {
    if (this._lastLevelResult?.gameComplete) {
      this._transitionTo(STATES.MENU);
      return;
    }
    this._startLevel();
    this._transitionTo(STATES.PLAYING);
  }

  resumeGame(): void {
    this._transitionTo(STATES.PLAYING);
  }

  pause(): void {
    if (this.state !== STATES.PLAYING) return;
    this._transitionTo(STATES.PAUSED);
  }

  gameOver(): void {
    if (this.state !== STATES.PLAYING) return;

    const level = this.levelManager.currentLevel;
    const result = this.levelManager.registerFailure();
    this._lastFailureAction = result.action;
    this._transitionTo(STATES.GAME_OVER);
    this.audioManager.play('gameOver');

    // Pro action 'reset' LevelManager nevrací attemptNumber (attemptsUsed je už vynulovaný) —
    // dopočítá se jako "vyčerpaný" počet pokusů (maxRestarts + 1), aby onGameOver vždy nesl
    // smysluplné číslo (viz mapování na veřejné onGameOver({level, attempt}) v useAntsGameEngine).
    const exhaustedAttempts = this.deps.config.game.retry.maxRestarts + 1;
    this.deps.onGameOver?.({
      level,
      action: result.action,
      attemptNumber: result.action === 'retry' ? result.attemptNumber : exhaustedAttempts,
      maxAttempts: result.action === 'retry' ? result.maxAttempts : exhaustedAttempts,
    });
  }

  levelComplete(): void {
    if (this.state !== STATES.PLAYING) return;

    const completedLevel = this.levelManager.currentLevel;
    const result = this.levelManager.registerSuccess();
    this._lastLevelResult = result;
    this._transitionTo(STATES.LEVEL_COMPLETE);
    this.audioManager.play('levelComplete');

    this.deps.onLevelComplete?.({
      level: completedLevel,
      gameComplete: result.gameComplete,
      totalLevels: this.deps.config.levels.length,
    });
  }

  setMuted(muted: boolean): void {
    this.audioManager.setMuted(muted);
  }

  isMuted(): boolean {
    return this.audioManager.isMuted();
  }

  private _startLevel(): void {
    this.target.setType(`level${this.levelManager.config.level}`);
    this._resetScene();
    this.antManager.setLevelConfig(this.levelManager.config);
    this._emitHud();
  }

  private _transitionTo(nextState: GameState): void {
    const allowed = STATE_TRANSITIONS[this.state] ?? [];
    if (!allowed.includes(nextState)) {
      console.warn(`[Game] neplatný přechod ${this.state} -> ${nextState}, ignoruji`);
      return;
    }
    this.state = nextState;
    this._emitStateChange();
    console.log(`[Game] -> ${nextState}`);
  }

  private _resetScene(): void {
    this.antManager.reset();
    this.target.reset();
    this.killedCount = 0;
    this._emitHud();
  }

  private _onAntKilled(): void {
    if (this.state !== STATES.PLAYING) return;

    this.killedCount++;
    this.deps.onAntKilled?.({ killedCount: this.killedCount, killTarget: this.levelManager.config.killTarget });
    if (this.killedCount >= this.levelManager.config.killTarget) {
      this.levelComplete();
    }
  }

  private _emitStateChange(): void {
    this.deps.onStateChange?.(this.state);
  }

  private _emitHud(): void {
    this.deps.onHudUpdate?.({
      state: this.state,
      level: this.levelManager.currentLevel,
      highestUnlocked: this.levelManager.highestUnlocked,
      hasProgress: this.levelManager.currentLevel > 1 || this.levelManager.highestUnlocked > 1,
      killedCount: this.killedCount,
      killTarget: this.levelManager.config.killTarget,
      healthRatio: this.target.health / this.target.maxHealth,
    });
  }

  private _handleVisibilityChange(): void {
    if (document.hidden) {
      this.pause();
    } else {
      this.lastTimestamp = performance.now();
      console.log('[Game] visible again, lastTimestamp reset');
    }
  }

  private _handleBlur(): void {
    this.pause();
  }

  private _handleTick(timestamp: number): void {
    const dt = Math.min((timestamp - (this.lastTimestamp ?? timestamp)) / 1000, MAX_DT);
    this.lastTimestamp = timestamp;

    if (this.state === STATES.PLAYING) {
      this.update(dt);
    }

    this._rafId = requestAnimationFrame(this._tick);
  }
}
