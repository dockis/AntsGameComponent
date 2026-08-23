import { LEVELS, GAME_CONFIG } from './config.js';

export class LevelManager {
  constructor() {
    this.currentLevel = 1;
    this.attemptsUsed = 0;
    this.highestUnlocked = 1;
  }

  get config() {
    return LEVELS[this.currentLevel - 1];
  }

  registerFailure() {
    this.attemptsUsed += 1;
    const { mode, maxRestarts } = GAME_CONFIG.retry;

    if (mode === 'lenient' || this.attemptsUsed <= maxRestarts) {
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
    return { action: 'reset', levelBeforeReset };
  }

  registerSuccess() {
    this.attemptsUsed = 0;
    const isFinalLevel = this.currentLevel >= LEVELS.length;

    if (isFinalLevel) {
      this.highestUnlocked = Math.max(this.highestUnlocked, this.currentLevel);
      return { gameComplete: true };
    }

    this.highestUnlocked = Math.max(this.highestUnlocked, this.currentLevel + 1);
    this.currentLevel += 1;
    return { gameComplete: false };
  }
}
