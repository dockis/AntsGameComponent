import type { LevelConfig, RetryConfig } from '../config/schema';
import type { Storage } from './Storage';

export type RegisterFailureResult =
  | { action: 'retry'; attemptNumber: number; maxAttempts: number | null }
  | { action: 'reset'; levelBeforeReset: number };

export interface RegisterSuccessResult {
  gameComplete: boolean;
}

export class LevelManager {
  currentLevel: number;
  highestUnlocked: number;
  failedAttemptsTotal: number;
  attemptsUsed = 0;

  private readonly levels: LevelConfig[];
  private readonly retry: RetryConfig;
  private readonly storage: Storage;

  constructor(levels: LevelConfig[], retry: RetryConfig, storage: Storage) {
    this.levels = levels;
    this.retry = retry;
    this.storage = storage;
    this.currentLevel = storage.get('currentLevel', 1);
    this.highestUnlocked = storage.get('highestUnlockedLevel', 1);
    this.failedAttemptsTotal = storage.get('failedAttemptsTotal', 0);
  }

  get config(): LevelConfig {
    return this.levels[this.currentLevel - 1];
  }

  resetToLevel1(): void {
    this.currentLevel = 1;
    this.attemptsUsed = 0;
    this._persist();
  }

  registerFailure(): RegisterFailureResult {
    this.attemptsUsed += 1;
    this.failedAttemptsTotal += 1;
    const { mode, maxRestarts } = this.retry;

    if (mode === 'lenient' || this.attemptsUsed <= maxRestarts) {
      this._persist();
      return {
        action: 'retry',
        attemptNumber: this.attemptsUsed + 1,
        maxAttempts: mode === 'lenient' ? null : maxRestarts + 1,
      };
    }

    const levelBeforeReset = this.currentLevel;
    console.log(
      `[LevelManager] Pokusy na levelu ${levelBeforeReset} vyčerpány, návrat na level 1. highestUnlocked zůstává ${this.highestUnlocked}.`
    );
    this.currentLevel = 1;
    this.attemptsUsed = 0;
    this._persist();
    return { action: 'reset', levelBeforeReset };
  }

  registerSuccess(): RegisterSuccessResult {
    this.attemptsUsed = 0;
    const isFinalLevel = this.currentLevel >= this.levels.length;

    if (isFinalLevel) {
      this.highestUnlocked = Math.max(this.highestUnlocked, this.currentLevel);
      this._persist();
      return { gameComplete: true };
    }

    this.highestUnlocked = Math.max(this.highestUnlocked, this.currentLevel + 1);
    this.currentLevel += 1;
    this._persist();
    return { gameComplete: false };
  }

  private _persist(): void {
    this.storage.set('currentLevel', this.currentLevel);
    this.storage.set('highestUnlockedLevel', this.highestUnlocked);
    this.storage.set('failedAttemptsTotal', this.failedAttemptsTotal);
  }
}
