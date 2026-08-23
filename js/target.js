import { GAME_CONFIG } from './config.js';

export class Target {
  constructor(groupElement, { maxHealth = GAME_CONFIG.targetMaxHealth, onDestroyed = null } = {}) {
    this.el = groupElement;
    this.maxHealth = maxHealth;
    this.health = maxHealth;
    this.onDestroyed = onDestroyed;
    this.pos = this._parsePos(groupElement.getAttribute('transform'));

    this.stateElements = Array.from(
      { length: 6 },
      (_, i) => this.el.querySelector(`#target-state-${i}`)
    );

    this._currentStateIndex = -1;
    this._applyVisualState();
  }

  _parsePos(transform) {
    const match = /translate\(\s*([-\d.]+)[,\s]+([-\d.]+)\s*\)/.exec(transform || '');
    if (!match) {
      console.warn('[Target] nepodařilo se přečíst pozici z transform, používám {0,0}:', transform);
      return { x: 0, y: 0 };
    }
    return { x: parseFloat(match[1]), y: parseFloat(match[2]) };
  }

  applyDamage(amount) {
    if (this.health <= 0) return;

    this.health = Math.max(0, this.health - amount);
    this._applyVisualState();

    if (this.health === 0) {
      console.log('[Target] zničen (health dosáhlo 0)');
      if (this.onDestroyed) this.onDestroyed();
    }
  }

  _computeStateIndex() {
    const ratio = this.health / this.maxHealth;
    let state = 0;

    for (const threshold of GAME_CONFIG.damageStates) {
      if (ratio <= threshold) {
        state++;
      } else {
        break;
      }
    }

    return state;
  }

  _applyVisualState() {
    const stateIndex = this._computeStateIndex();
    if (stateIndex === this._currentStateIndex) return;

    this.stateElements.forEach((el, i) => {
      el.style.display = i === stateIndex ? 'block' : 'none';
    });
    this._currentStateIndex = stateIndex;
  }
}
