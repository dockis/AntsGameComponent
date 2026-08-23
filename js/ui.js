const ONBOARDING_DURATION_MS = 4000;

export class UIManager {
  constructor({
    audioManager,
    onStartNewGame = null,
    onContinueFromMenu = null,
    onRetry = null,
    onContinue = null,
    onResume = null,
  } = {}) {
    this.audioManager = audioManager;
    this.hudEl = document.getElementById('hud');
    this.levelEl = document.getElementById('hud-level');
    this.killsEl = document.getElementById('hud-kills');
    this.healthBarEl = document.getElementById('hud-health-bar');

    this.orientationEl = document.getElementById('screen-orientation');
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

    this.menuStartBtn = document.getElementById('menu-start-btn');
    this.menuContinueBtn = document.getElementById('menu-continue-btn');
    this.muteBtn = document.getElementById('menu-mute-btn');

    this._bindTap(this.menuStartBtn, onStartNewGame);
    this._bindTap(this.menuContinueBtn, onContinueFromMenu);
    this._bindTap(this.retryBtn, onRetry);
    this._bindTap(this.continueBtn, onContinue);
    this._bindTap(document.getElementById('paused-resume-btn'), onResume);

    this.muteBtn.addEventListener('click', () => this._toggleMute());
    this._updateMuteButton();
  }

  _bindTap(element, callback) {
    element.addEventListener('click', () => {
      this.audioManager.play('uiTap');
      callback?.();
    });
  }

  _toggleMute() {
    this.audioManager.setMuted(!this.audioManager.isMuted());
    this._updateMuteButton();
    this.audioManager.play('uiTap');
  }

  _updateMuteButton() {
    const muted = this.audioManager.isMuted();
    this.muteBtn.textContent = muted ? 'Zvuk: vypnutý' : 'Zvuk: zapnutý';
    this.muteBtn.setAttribute('aria-pressed', String(muted));
  }

  setLevel(level) {
    this.levelEl.textContent = String(level);
  }

  setMenuProgress(hasProgress, level) {
    this.menuContinueBtn.classList.toggle('hidden', !hasProgress);
    this.menuContinueBtn.textContent = `Pokračovat (level ${level})`;
    this.menuStartBtn.textContent = hasProgress ? 'Nová hra' : 'Start';
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

  setOrientationBlocked(isLandscape) {
    this.orientationEl.classList.toggle('visible', isLandscape);
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
