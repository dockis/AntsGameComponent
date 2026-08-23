const ONBOARDING_DURATION_MS = 4000;

export class UIManager {
  constructor({ onStart = null, onRetry = null, onContinue = null, onResume = null } = {}) {
    this.hudEl = document.getElementById('hud');
    this.levelEl = document.getElementById('hud-level');
    this.killsEl = document.getElementById('hud-kills');
    this.healthBarEl = document.getElementById('hud-health-bar');

    this.onboardingEl = document.getElementById('screen-onboarding');
    this._onboardingTimer = null;
    this._onboardingDismiss = () => this.hideOnboarding();

    this.screens = {
      MENU: document.getElementById('screen-menu'),
      LEVEL_COMPLETE: document.getElementById('screen-level-complete'),
      GAME_OVER: document.getElementById('screen-game-over'),
      PAUSED: document.getElementById('screen-paused'),
    };

    this.levelCompleteTitleEl = document.getElementById('level-complete-title');
    this.continueBtn = document.getElementById('level-complete-continue-btn');
    this.gameOverInfoEl = document.getElementById('game-over-info');
    this.retryBtn = document.getElementById('game-over-retry-btn');

    document.getElementById('menu-start-btn').addEventListener('click', () => onStart?.());
    this.retryBtn.addEventListener('click', () => onRetry?.());
    this.continueBtn.addEventListener('click', () => onContinue?.());
    document.getElementById('paused-resume-btn').addEventListener('click', () => onResume?.());
  }

  setLevel(level) {
    this.levelEl.textContent = String(level);
  }

  setLevelCompleteInfo({ message, buttonLabel }) {
    this.levelCompleteTitleEl.textContent = message;
    this.continueBtn.textContent = buttonLabel;
  }

  setGameOverInfo({ message, buttonLabel }) {
    this.gameOverInfoEl.textContent = message;
    this.retryBtn.textContent = buttonLabel;
  }

  update({ killedCount, killTarget, healthRatio }) {
    this.killsEl.textContent = `${killedCount} / ${killTarget}`;
    this.healthBarEl.style.width = `${Math.max(0, healthRatio) * 100}%`;
  }

  setState(state) {
    for (const [key, el] of Object.entries(this.screens)) {
      el.classList.toggle('visible', key === state);
    }
    this.hudEl.classList.toggle('visible', state === 'PLAYING' || state === 'PAUSED');
  }

  showOnboarding() {
    this.onboardingEl.classList.add('visible');
    document.addEventListener('pointerdown', this._onboardingDismiss, { once: true });
    this._onboardingTimer = setTimeout(this._onboardingDismiss, ONBOARDING_DURATION_MS);
  }

  hideOnboarding() {
    this.onboardingEl.classList.remove('visible');
    clearTimeout(this._onboardingTimer);
    document.removeEventListener('pointerdown', this._onboardingDismiss);
  }
}
