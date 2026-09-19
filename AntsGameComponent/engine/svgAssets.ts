import type { LevelConfig } from '../config/schema';

export interface SvgAssetLoaderOptions {
  baseUrl: string;
  overrides?: Record<string, string>;
}

export class SvgAssetLoader {
  private readonly baseUrl: string;
  private readonly overrides: Record<string, string>;
  private readonly templates: Record<string, Element[]> = {};

  constructor(options: SvgAssetLoaderOptions) {
    this.baseUrl = options.baseUrl.endsWith('/') ? options.baseUrl : `${options.baseUrl}/`;
    this.overrides = options.overrides ?? {};
  }

  async preloadAll(names: string[]): Promise<void> {
    await Promise.all(names.map((name) => this._loadSvg(name)));
  }

  private _resolveUrl(name: string): string {
    return this.overrides[name] ?? `${this.baseUrl}${name}.svg`;
  }

  private async _loadSvg(name: string): Promise<void> {
    try {
      const response = await fetch(this._resolveUrl(name));
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
      if (doc.querySelector('parsererror')) throw new Error('neplatný SVG obsah');
      this.templates[name] = Array.from(doc.documentElement.children);
    } catch (err) {
      // Na rozdíl od zvuků se chybějící grafika nesmí tiše polknout — je okamžitě vizuálně patrná.
      console.error(`[svgAssets] nepodařilo se načíst SVG asset "${name}":`, err);
      throw err;
    }
  }

  getFragment(name: string): DocumentFragment {
    const nodes = this.templates[name];
    if (!nodes) throw new Error(`[svgAssets] asset "${name}" není v cache, proběhl preloadAll?`);

    const fragment = document.createDocumentFragment();
    for (const node of nodes) {
      fragment.appendChild(node.cloneNode(true));
    }
    return fragment;
  }
}

/** Sestaví seznam jmen SVG assetů potřebných pro dané levely (typy mravenců, skvrna, poškozovací stavy cíle). */
export function buildAntSvgAssetNames(levels: LevelConfig[]): string[] {
  return [
    'antNormal',
    'antAggressive',
    'antArmored',
    'antStain',
    ...levels.flatMap((level) => Array.from({ length: 6 }, (_, i) => `level${level.level}State${i}`)),
  ];
}
