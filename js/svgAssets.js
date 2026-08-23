import { LEVELS } from './config.js';

const SVG_BASE_PATH = 'js/assets/svg/';
const SVG_NAMES = [
  'antNormal',
  'antAggressive',
  'antArmored',
  'antStain',
  ...LEVELS.flatMap((l) => Array.from({ length: 6 }, (_, i) => `level${l.level}State${i}`)),
];

const _templates = {};

async function _loadSvg(name) {
  try {
    const response = await fetch(`${SVG_BASE_PATH}${name}.svg`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
    if (doc.querySelector('parsererror')) throw new Error('neplatný SVG obsah');
    _templates[name] = Array.from(doc.documentElement.children);
  } catch (err) {
    // Na rozdíl od audio.js se chybějící grafika nesmí tiše polknout — je okamžitě vizuálně patrná.
    console.error(`[svgAssets] nepodařilo se načíst SVG asset "${name}":`, err);
    throw err;
  }
}

// Musí doběhnout před vytvořením Target/AntManager/StainManager — na rozdíl
// od zvuků nemůže grafika chybět už pro první vykreslený snímek.
export async function preloadAll() {
  await Promise.all(SVG_NAMES.map((name) => _loadSvg(name)));
}

export function getFragment(name) {
  const nodes = _templates[name];
  if (!nodes) throw new Error(`[svgAssets] asset "${name}" není v cache, proběhl preloadAll?`);

  const fragment = document.createDocumentFragment();
  for (const node of nodes) {
    fragment.appendChild(node.cloneNode(true));
  }
  return fragment;
}
