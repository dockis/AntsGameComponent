import type { AntTypeKey, AntTypesConfig, GameConfig, LevelAntWeights, LevelConfig } from '../config/schema';
import { Ant, type AntElement, type Point } from './Ant';
import { CSS_CLASS } from './cssClassNames';
import { StainManager } from './StainManager';
import type { SvgAssetLoader } from './svgAssets';
import type { Target } from './Target';

const SVG_NS = 'http://www.w3.org/2000/svg';

// Vážený náhodný výběr mezi normal/aggressive/armored dle sekce 6 dokumentu 00.
function pickWeightedType(ants: LevelAntWeights): AntTypeKey {
  const normalWeight = ants.normal ?? 0;
  const aggressiveWeight = ants.aggressive ?? 0;
  const armoredWeight = ants.armored ?? 0;
  const total = normalWeight + aggressiveWeight + armoredWeight;
  if (total <= 0) return 'normal';

  let roll = Math.random() * total;
  if (roll < normalWeight) return 'normal';
  roll -= normalWeight;
  if (roll < aggressiveWeight) return 'aggressive';
  return 'armored';
}

export interface AntManagerCallbacks {
  onKill?: () => void;
  onHit?: () => void;
  onArmoredFirstHit?: () => void;
  onConsumeTick?: () => void;
}

export interface AntManagerDeps extends AntManagerCallbacks {
  stainsLayerElement: SVGGElement;
  config: GameConfig;
  antTypes: AntTypesConfig;
  svgAssets: SvgAssetLoader;
}

export class AntManager {
  readonly layerElement: SVGGElement;
  readonly target: Target;
  readonly stainManager: StainManager;
  readonly pool: Ant[];
  levelConfig: LevelConfig;
  activeCount = 0;

  private readonly deps: AntManagerDeps;
  private _spawnTimer = 0;

  constructor(layerElement: SVGGElement, target: Target, levelConfig: LevelConfig, deps: AntManagerDeps) {
    this.layerElement = layerElement;
    this.target = target;
    this.levelConfig = levelConfig;
    this.deps = deps;
    this.stainManager = new StainManager(deps.stainsLayerElement, deps.config, deps.svgAssets);

    this.pool = Array.from({ length: deps.config.antPoolSize }, () => {
      const el = document.createElementNS(SVG_NS, 'g') as AntElement;
      el.setAttribute('class', CSS_CLASS.ant);
      el.style.display = 'none';
      layerElement.appendChild(el);
      return new Ant(el, { config: deps.config, antTypes: deps.antTypes, svgAssets: deps.svgAssets });
    });

    this._scheduleNextSpawn();
  }

  setLevelConfig(levelConfig: LevelConfig): void {
    this.levelConfig = levelConfig;
  }

  private _scheduleNextSpawn(): void {
    const [min, max] = this.levelConfig.spawnInterval;
    this._spawnTimer = min + Math.random() * (max - min);
  }

  spawn(type: AntTypeKey = 'normal'): Ant | null {
    const ant = this.pool.find((a) => !a.active && !a.removing);
    if (!ant) {
      console.warn('[AntManager] pool vyčerpán, spawn ignorován');
      return null;
    }

    const { pos, heading } = this._randomEdgeSpawn();
    ant.reset({ pos, heading, type, speedMultiplier: this.levelConfig.speedMultiplier });
    this.activeCount++;
    return ant;
  }

  reset(): void {
    for (const ant of this.pool) {
      ant.hide();
      ant.removing = false;
      ant.visual.classList.remove(CSS_CLASS.squish);
    }
    this.activeCount = 0;
    this._scheduleNextSpawn();
    this.stainManager.reset();
  }

  despawn(ant: Ant): void {
    ant.hide();
    ant.removing = false;
    this.activeCount--;
  }

  // Zásah mravence dotykem. Odolný typ (armored) po prvním zásahu jen přejde
  // na vlastnosti afterFirstHit typu a zůstává aktivní — despawn proběhne
  // teprve při dosažení hitsRemaining === 0 (viz Ant.applyHit).
  registerHit(ant: Ant): void {
    if (!ant.active) return;

    this.deps.onHit?.();

    const eliminated = ant.applyHit();
    if (!eliminated) {
      this.deps.onArmoredFirstHit?.();
      return;
    }

    this.stainManager.spawn(ant.pos, ant.heading);
    ant.active = false;
    ant.removing = true;
    ant.squishTimer = this.deps.config.squishDurationMs;
    ant.playSquish();
    this.deps.onKill?.();
  }

  update(dt: number): void {
    this.stainManager.update(dt);
    this._spawnTimer -= dt * 1000;
    if (this._spawnTimer <= 0) {
      if (this.activeCount < this.levelConfig.maxAnts) {
        this.spawn(pickWeightedType(this.levelConfig.ants));
        this._scheduleNextSpawn();
      } else {
        this._spawnTimer = 0; // maxAnts dosaženo, zkusit znovu příští tik
      }
    }

    let anyEating = false;

    for (const ant of this.pool) {
      if (ant.removing) {
        ant.squishTimer -= dt * 1000;
        if (ant.squishTimer <= 0) {
          this.despawn(ant);
        }
        continue;
      }

      if (!ant.active) continue;

      ant.update(dt, this.target.pos);

      if (ant.eating) {
        this.target.applyDamage(ant.damagePerSecond * dt);
        anyEating = true;
      }
    }

    if (anyEating) this.deps.onConsumeTick?.();
  }

  private _randomEdgeSpawn(): { pos: Point; heading: number } {
    const targetPos = this.target.pos;
    const { sceneWidth, sceneHeight, antSpawnMargin } = this.deps.config;
    const side = Math.floor(Math.random() * 4);
    let pos: Point;

    switch (side) {
      case 0: // nad scénou
        pos = { x: Math.random() * sceneWidth, y: -antSpawnMargin };
        break;
      case 1: // vpravo od scény
        pos = { x: sceneWidth + antSpawnMargin, y: Math.random() * sceneHeight };
        break;
      case 2: // pod scénou
        pos = { x: Math.random() * sceneWidth, y: sceneHeight + antSpawnMargin };
        break;
      default: // vlevo od scény
        pos = { x: -antSpawnMargin, y: Math.random() * sceneHeight };
        break;
    }

    const heading = Math.atan2(targetPos.y - pos.y, targetPos.x - pos.x);
    return { pos, heading };
  }
}
