import { GAME_CONFIG } from './config.js';
import { Ant } from './ant.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

export class AntManager {
  constructor(layerElement, target, levelConfig, { onKill = null } = {}) {
    this.layerElement = layerElement;
    this.target = target;
    this.levelConfig = levelConfig;
    this.onKill = onKill;
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

  despawn(ant) {
    ant.hide();
    ant.removing = false;
    this.activeCount--;
  }

  kill(ant) {
    if (!ant.active) return;

    ant.active = false;
    ant.removing = true;
    ant.squishTimer = GAME_CONFIG.squishDurationMs;
    ant.playSquish();
    if (this.onKill) this.onKill();
  }

  update(dt) {
    this._spawnTimer -= dt * 1000;
    if (this._spawnTimer <= 0) {
      if (this.activeCount < this.levelConfig.maxAnts) {
        this.spawn('normal');
        this._scheduleNextSpawn();
      } else {
        this._spawnTimer = 0; // maxAnts dosaženo, zkusit znovu příští tik
      }
    }

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
      }
    }
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
