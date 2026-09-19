import type { GameConfig } from '../config/schema';
import type { SvgAssetLoader } from './svgAssets';
import type { Point } from './Ant';

export interface TargetOptions {
  typeKey: string;
  maxHealth?: number;
  onDestroyed?: () => void;
  onCriticalHealth?: () => void;
}

export interface TargetDeps {
  config: GameConfig;
  svgAssets: SvgAssetLoader;
}

export class Target {
  readonly el: SVGGElement;
  readonly maxHealth: number;
  health: number;
  pos: Point;

  private readonly deps: TargetDeps;
  private readonly onDestroyed?: () => void;
  private readonly onCriticalHealth?: () => void;
  private readonly stateElements: SVGGElement[];
  private _criticalHealthTriggered = false;
  private _currentStateIndex = -1;

  constructor(groupElement: SVGGElement, deps: TargetDeps, options: TargetOptions) {
    this.el = groupElement;
    this.deps = deps;
    this.maxHealth = options.maxHealth ?? deps.config.targetMaxHealth;
    this.health = this.maxHealth;
    this.onDestroyed = options.onDestroyed;
    this.onCriticalHealth = options.onCriticalHealth;
    this.pos = this._parsePos(groupElement.getAttribute('transform'));

    this.stateElements = Array.from({ length: 6 }, (_, i) =>
      this.el.querySelector<SVGGElement>(`#target-state-${i}`)
    ).filter((el): el is SVGGElement => el !== null);

    this.setType(options.typeKey);

    this._currentStateIndex = -1;
    this._applyVisualState();
  }

  setType(typeKey: string): void {
    this.stateElements.forEach((el, i) => {
      el.replaceChildren();
      el.appendChild(this.deps.svgAssets.getFragment(`${typeKey}State${i}`));
    });
  }

  private _parsePos(transform: string | null): Point {
    const match = /translate\(\s*([-\d.]+)[,\s]+([-\d.]+)\s*\)/.exec(transform || '');
    if (!match) {
      console.warn('[Target] nepodařilo se přečíst pozici z transform, používám {0,0}:', transform);
      return { x: 0, y: 0 };
    }
    return { x: parseFloat(match[1]), y: parseFloat(match[2]) };
  }

  reset(): void {
    this.health = this.maxHealth;
    this._currentStateIndex = -1;
    this._criticalHealthTriggered = false;
    this._applyVisualState();
  }

  applyDamage(amount: number): void {
    if (this.health <= 0) return;

    this.health = Math.max(0, this.health - amount);
    this._applyVisualState();

    if (!this._criticalHealthTriggered && this.health / this.maxHealth <= this.deps.config.criticalHealthThreshold) {
      this._criticalHealthTriggered = true;
      this.onCriticalHealth?.();
    }

    if (this.health === 0) {
      console.log('[Target] zničen (health dosáhlo 0)');
      this.onDestroyed?.();
    }
  }

  private _computeStateIndex(): number {
    const ratio = this.health / this.maxHealth;
    let state = 0;

    for (const threshold of this.deps.config.damageStates) {
      if (ratio <= threshold) {
        state++;
      } else {
        break;
      }
    }

    return state;
  }

  private _applyVisualState(): void {
    const stateIndex = this._computeStateIndex();
    if (stateIndex === this._currentStateIndex) return;

    this.stateElements.forEach((el, i) => {
      el.style.display = i === stateIndex ? 'block' : 'none';
    });
    this._currentStateIndex = stateIndex;
  }
}
