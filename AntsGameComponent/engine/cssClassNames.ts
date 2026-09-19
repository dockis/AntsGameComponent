// Centrální zdroj tříd, které engine nastavuje IMPERATIVNĚ na SVG/DOM elementy mimo
// React/CSS Modules (viz plán, krok 8, sekce "Styly") — CSS Modules hashing by je
// nikdy nenamatchoval, protože engine o hashovaných jménech neví. Odpovídající
// pravidla jsou v AntsGameComponent.module.css uvnitř :global(...). Prefix "agc-"
// brání kolizi s třídami hostitelské aplikace. Udržujte oba soubory v souladu — TS
// tu typovou kontrolou nepomůže, jde o obyčejné stringy v DOM classList/selector API.
export const CSS_CLASS = {
  ant: 'agc-ant',
  antVisual: 'agc-ant-visual',
  antHitbox: 'agc-ant-hitbox',
  squish: 'agc-squish',
  hitFlash: 'agc-hit-flash',
  antStain: 'agc-ant-stain',
  fading: 'agc-fading',
  rotateCw: 'agc-rotate-cw',
  rotateCcw: 'agc-rotate-ccw',
} as const;
