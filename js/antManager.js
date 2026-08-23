import { GAME_CONFIG } from './config.js';
import { Ant } from './ant.js';
import { StainManager } from './stainManager.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

// Vážený náhodný výběr mezi normal/aggressive/armored dle sekce 6 dokumentu 00.
function pickWeightedType(ants) {
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

export class AntManager {
  constructor(layerElement, target, levelConfig, { onKill = null, onHit = null, onArmoredFirstHit = null, onConsumeTick = null, stainsLayerElement } = {}) {
    this.layerElement = layerElement;
    this.target = target;
    this.levelConfig = levelConfig;
    this.onKill = onKill;
    this.onHit = onHit;
    this.onArmoredFirstHit = onArmoredFirstHit;
    this.onConsumeTick = onConsumeTick;
    this.stainManager = new StainManager(stainsLayerElement);
    this.activeCount = 0;
    this.pool = Array.from({ length: GAME_CONFIG.antPoolSize }, () => {
      const el = document.createElementNS(SVG_NS, 'g');
      el.setAttribute('class', 'ant');
      el.style.display = 'none';
      layerElement.appendChild(el);
      return new Ant(el);
    });

    this._scheduleNextSpawn();
  }

  setLevelConfig(levelConfig) {
    this.levelConfig = levelConfig;
  }

  _scheduleNextSpawn() {
    const [min, max] = this.levelConfig.spawnInterval;
    this._spawnTimer = min + Math.random() * (max - min);
  }

  spawn(type = 'normal') {
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

  reset() {
    for (const ant of this.pool) {
      ant.hide();
      ant.removing = false;
      ant.visual.classList.remove('squish');
    }
    this.activeCount = 0;
    this._scheduleNextSpawn();
    this.stainManager.reset();
  }

  despawn(ant) {
    ant.hide();
    ant.removing = false;
    this.activeCount--;
  }

  // Zásah mravence dotykem. Odolný typ (armored) po prvním zásahu jen přejde
  // na vlastnosti afterFirstHit typu a zůstává aktivní — despawn proběhne
  // teprve při dosažení hitsRemaining === 0 (viz Ant.applyHit).
  registerHit(ant) {
    if (!ant.active) return;

    if (this.onHit) this.onHit();

    const eliminated = ant.applyHit();
    if (!eliminated) {
      if (this.onArmoredFirstHit) this.onArmoredFirstHit();
      return;
    }

    this.stainManager.spawn(ant.pos, ant.heading);
    ant.active = false;
    ant.removing = true;
    ant.squishTimer = GAME_CONFIG.squishDurationMs;
    ant.playSquish();
    if (this.onKill) this.onKill();
  }

  update(dt) {
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

    if (anyEating && this.onConsumeTick) this.onConsumeTick();
  }

  _randomEdgeSpawn() {
    const targetPos = this.target.pos;
    const { sceneWidth, sceneHeight, antSpawnMargin } = GAME_CONFIG;
    const side = Math.floor(Math.random() * 4);
    let pos;

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
