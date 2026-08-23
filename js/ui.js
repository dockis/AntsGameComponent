export class UIManager {
  constructor() {
    this.levelEl = document.getElementById('hud-level');
    this.killsEl = document.getElementById('hud-kills');
    this.healthBarEl = document.getElementById('hud-health-bar');
  }

  setLevel(level) {
    this.levelEl.textContent = String(level);
  }

  update({ killedCount, killTarget, healthRatio }) {
    this.killsEl.textContent = `${killedCount} / ${killTarget}`;
    this.healthBarEl.style.width = `${Math.max(0, healthRatio) * 100}%`;
  }
}
