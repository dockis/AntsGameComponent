import { GAME_CONFIG } from './config.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

// Kruhový buffer: spawn vždy zapisuje do pool[cursor] a posouvá cursor dál.
// Dokud je v poolu volno, vyplňuje se popořadě; po vyčerpání se cursor zase
// dostane na nejstarší (dávno neaktivní i právě dobíhající) prvek a přepíše
// ho — se stainDurationMs stejnou pro všechny je to vždy ten nejstarší.
export class StainManager {
  constructor(layerElement) {
    this.pool = Array.from({ length: GAME_CONFIG.stainPoolSize }, () => {
      const el = document.createElementNS(SVG_NS, 'g');
      el.setAttribute('class', 'ant-stain');
      el.style.display = 'none';
      this._buildVisual(el);
      layerElement.appendChild(el);
      return { el, active: false, remainingMs: 0 };
    });
    this._cursor = 0;
  }

  _buildVisual(el) {
    const splat = document.createElementNS(SVG_NS, 'ellipse');
    splat.setAttribute('class', 'ant-stain-splat');
    splat.setAttribute('rx', '9');
    splat.setAttribute('ry', '4.5');

    const drop1 = document.createElementNS(SVG_NS, 'circle');
    drop1.setAttribute('class', 'ant-stain-drop');
    drop1.setAttribute('cx', '-11');
    drop1.setAttribute('cy', '-2');
    drop1.setAttribute('r', '1.6');

    const drop2 = document.createElementNS(SVG_NS, 'circle');
    drop2.setAttribute('class', 'ant-stain-drop');
    drop2.setAttribute('cx', '12');
    drop2.setAttribute('cy', '3');
    drop2.setAttribute('r', '1.2');

    el.appendChild(splat);
    el.appendChild(drop1);
    el.appendChild(drop2);
  }

  spawn(pos, heading) {
    const stain = this.pool[this._cursor];
    this._cursor = (this._cursor + 1) % this.pool.length;

    const degrees = (heading * 180) / Math.PI;
    stain.el.setAttribute('transform', `translate(${pos.x},${pos.y}) rotate(${degrees})`);
    stain.el.classList.remove('fading');
    stain.el.style.display = 'block';
    stain.active = true;
    stain.remainingMs = GAME_CONFIG.stainDurationMs;
  }

  update(dt) {
    const dtMs = dt * 1000;
    for (const stain of this.pool) {
      if (!stain.active) continue;

      stain.remainingMs -= dtMs;
      if (stain.remainingMs <= GAME_CONFIG.stainFadeMs) {
        stain.el.classList.add('fading');
      }
      if (stain.remainingMs <= 0) {
        stain.el.style.display = 'none';
        stain.active = false;
      }
    }
  }

  reset() {
    for (const stain of this.pool) {
      stain.el.style.display = 'none';
      stain.el.classList.remove('fading');
      stain.active = false;
    }
    this._cursor = 0;
  }
}
