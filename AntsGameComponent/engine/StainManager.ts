import type { GameConfig } from '../config/schema';
import { CSS_CLASS } from './cssClassNames';
import type { SvgAssetLoader } from './svgAssets';
import type { Point } from './Ant';

const SVG_NS = 'http://www.w3.org/2000/svg';

interface Stain {
  el: SVGGElement;
  active: boolean;
  remainingMs: number;
}

// Kruhový buffer: spawn vždy zapisuje do pool[cursor] a posouvá cursor dál.
// Dokud je v poolu volno, vyplňuje se popořadě; po vyčerpání se cursor zase
// dostane na nejstarší (dávno neaktivní i právě dobíhající) prvek a přepíše
// ho — se stainDurationMs stejnou pro všechny je to vždy ten nejstarší.
export class StainManager {
  private readonly pool: Stain[];
  private readonly config: GameConfig;
  private _cursor = 0;

  constructor(layerElement: SVGGElement, config: GameConfig, svgAssets: SvgAssetLoader) {
    this.config = config;
    this.pool = Array.from({ length: config.stainPoolSize }, () => {
      const el = document.createElementNS(SVG_NS, 'g') as SVGGElement;
      el.setAttribute('class', CSS_CLASS.antStain);
      el.style.display = 'none';
      el.appendChild(svgAssets.getFragment('antStain'));
      layerElement.appendChild(el);
      return { el, active: false, remainingMs: 0 };
    });
  }

  spawn(pos: Point, heading: number): void {
    const stain = this.pool[this._cursor];
    this._cursor = (this._cursor + 1) % this.pool.length;

    const degrees = (heading * 180) / Math.PI;
    stain.el.setAttribute('transform', `translate(${pos.x},${pos.y}) rotate(${degrees})`);
    stain.el.classList.remove(CSS_CLASS.fading);
    stain.el.style.display = 'block';
    stain.active = true;
    stain.remainingMs = this.config.stainDurationMs;
  }

  update(dt: number): void {
    const dtMs = dt * 1000;
    for (const stain of this.pool) {
      if (!stain.active) continue;

      stain.remainingMs -= dtMs;
      if (stain.remainingMs <= this.config.stainFadeMs) {
        stain.el.classList.add(CSS_CLASS.fading);
      }
      if (stain.remainingMs <= 0) {
        stain.el.style.display = 'none';
        stain.active = false;
      }
    }
  }

  reset(): void {
    for (const stain of this.pool) {
      stain.el.style.display = 'none';
      stain.el.classList.remove(CSS_CLASS.fading);
      stain.active = false;
    }
    this._cursor = 0;
  }
}
