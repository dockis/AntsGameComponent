import { LEVELS, GAME_CONFIG } from './config.js';
import { Storage } from './storage.js';

export class LevelManager {
  constructor() {
    this.currentLevel = Storage.get('currentLevel', 1);
    this.highestUnlocked = Storage.get('highestUnlockedLevel', 1);
    this.failedAttemptsTotal = Storage.get('failedAttemptsTotal', 0);
    this.attemptsUsed = 0;
  }

  get config() {
    return LEVELS[this.currentLevel - 1];
  }

  resetToLevel1() {
    this.currentLevel = 1;
    this.attemptsUsed = 0;
    this._persist();
  }

  registerFailure() {
    this.attemptsUsed += 1;
    this.failedAttemptsTotal += 1;
    const { mode, maxRestarts } = GAME_CONFIG.retry;

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

  registerSuccess() {
    this.attemptsUsed = 0;
    const isFinalLevel = this.currentLevel >= LEVELS.length;

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

  _persist() {
    Storage.set('currentLevel', this.currentLevel);
    Storage.set('highestUnlockedLevel', this.highestUnlocked);
    Storage.set('failedAttemptsTotal', this.failedAttemptsTotal);
  }
}
