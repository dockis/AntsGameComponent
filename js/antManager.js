import { GAME_CONFIG } from './config.js';
import { Ant } from './ant.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

export class AntManager {
  constructor(layerElement, targetPos) {
    this.layerElement = layerElement;
    this.targetPos = targetPos;
    this.pool = Array.from({ length: GAME_CONFIG.antPoolSize }, () => {
      const el = document.createElementNS(SVG_NS, 'g');
      el.setAttribute('class', 'ant');
      el.style.display = 'none';
      layerElement.appendChild(el);
      return new Ant(el);
    });
  }

  spawn(type = 'normal') {
    const ant = this.pool.find((a) => !a.active);
    if (!ant) {
      console.warn('[AntManager] pool vyčerpán, spawn ignorován');
      return null;
    }

    const { pos, heading } = this._randomEdgeSpawn();
    ant.reset({ pos, heading, type });
    return ant;
  }

  despawn(ant) {
    ant.hide();
  }

  update(dt) {
    for (const ant of this.pool) {
      if (!ant.active) continue;

      ant.update(dt, this.targetPos);

      if (ant.distanceTo(this.targetPos) <= GAME_CONFIG.eatingRadius) {
        this.despawn(ant);
        this.spawn(ant.type);
      }
    }
  }

  _randomEdgeSpawn() {
    const targetPos = this.targetPos;
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
