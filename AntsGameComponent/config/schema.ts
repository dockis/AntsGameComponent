import defaultConfigJson from './defaultConfig.json';

export type RetryMode = 'strict' | 'lenient';

export interface RetryConfig {
  mode: RetryMode;
  maxRestarts: number;
}

export interface WanderNoiseLayer {
  /** Úhlová frekvence v rad/s. */
  frequency: number;
  /** Amplituda v rad. */
  amplitude: number;
}

export interface WanderNoiseConfig {
  /**
   * Vrstvy plynulého šumu, vzájemně neslučitelné frekvence, aby se vzor
   * nezacykloval viditelně krátce (viz design dokument, feature 17).
   */
  layers: WanderNoiseLayer[];
}

export interface WanderBurstConfig {
  /** Příležitostná výraznější "odbočka" navrch základního šumu (feature 17). */
  intervalMinMs: number;
  intervalMaxMs: number;
  /** Spodní/horní hranice špičkové odchylky běžné odbočky, v rad. */
  amplitudeMin: number;
  amplitudeMax: number;
  /** Pravděpodobnost výrazně ostřejší odbočky (cca 1 z 8 při 0.15). */
  sharpChance: number;
  sharpAmplitudeMin: number;
  sharpAmplitudeMax: number;
  /** Jak dlouho mravenec setrvá blízko špičkové odchylky před dozníváním. */
  holdMsMin: number;
  holdMsMax: number;
  /** Délka doznívací fáze po hold fázi. */
  decayDurationMs: number;
  /** Rychlost exponenciálního doznívání zpět k základnímu šumu, 1/s. */
  decayRate: number;
}

export interface GameConfig {
  targetMaxHealth: number;
  eatingRadius: number;
  /** Musí být >= max hodnota maxAnts napříč všemi levely. */
  antPoolSize: number;
  retry: RetryConfig;
  /** Dolní hranice % zdraví pro každý vizuální stav (mimo 100 % pristine). */
  damageStates: number[];
  /** Musí odpovídat generovanému `<svg viewBox>` (viz AntsGameComponent.tsx). */
  sceneWidth: number;
  sceneHeight: number;
  /** Jednotky viewBoxu/s. */
  baseAntSpeed: number;
  baseDamagePerSecond: number;
  turnSpeed: number;
  /** ±X % per-instance odchylka speed/wanderNoise frekvencí/turnSpeed/burst timingu. */
  antVariance: number;
  /** Od této vzdálenosti k cíli se wander/burst plynule tlumí až k 0 na eatingRadius. */
  seekRadius: number;
  wanderNoise: WanderNoiseConfig;
  wanderBurst: WanderBurstConfig;
  /** Vzdálenost mimo viewBox, kde se mravenec spawne. */
  antSpawnMargin: number;
  /** Neviditelný dotykový hitbox, ~1,5-2x vizuální velikosti mravence. */
  antHitboxRadius: number;
  /** Délka vizuální "squish" animace při zabití. */
  squishDurationMs: number;
  /** Hranice pro jednorázový zvuk criticalHealth. */
  criticalHealthThreshold: number;
  stainPoolSize: number;
  /** Celková viditelnost skvrny včetně závěrečného fade-out. */
  stainDurationMs: number;
  /** Délka závěrečného fade-out z stainDurationMs. */
  stainFadeMs: number;
}

export type AntTypeKey = 'normal' | 'aggressive' | 'armored';

export interface AntTypeConfig {
  speedMultiplier: number;
  damageMultiplier: number;
  hitsToKill: number;
  /** Po prvním zásahu přebírá vlastnosti tohoto typu (downgrade, viz "armored"). */
  afterFirstHit?: AntTypeKey;
}

export type AntTypesConfig = Record<AntTypeKey, AntTypeConfig>;

export interface LevelAntWeights {
  /** Váhy v %, ne pravděpodobnosti přímo — sčítají se při výběru typu mravence. */
  normal: number;
  aggressive: number;
  armored: number;
}

export interface LevelConfig {
  level: number;
  killTarget: number;
  maxAnts: number;
  /** [min, max] v ms. */
  spawnInterval: [number, number];
  speedMultiplier: number;
  ants: LevelAntWeights;
}

export interface AntsGameConfig {
  game: GameConfig;
  antTypes: AntTypesConfig;
  levels: LevelConfig[];
}

export type DeepPartial<T> = T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;

export const defaultConfig = defaultConfigJson as AntsGameConfig;

/**
 * Lehká sanity kontrola configu předaného hostitelskou aplikací (hranice systému —
 * data mohou přijít odkudkoli, viz krok 3 zadání plánu "zachovat možnosti nastavení v JSON").
 * Záměrně bez schema knihovny (zod apod.) — jen ověření pár kritických invariantů.
 */
export function validateConfig(config: AntsGameConfig): boolean {
  if (!config.game || typeof config.game.sceneWidth !== 'number' || typeof config.game.sceneHeight !== 'number') {
    return false;
  }
  if (!config.antTypes || typeof config.antTypes !== 'object') {
    return false;
  }
  if (!Array.isArray(config.levels) || config.levels.length === 0) {
    return false;
  }
  return true;
}

function mergeAntTypes(base: AntTypesConfig, overrides?: DeepPartial<AntTypesConfig>): AntTypesConfig {
  if (!overrides) return base;
  const merged = { ...base };
  for (const key of Object.keys(overrides) as AntTypeKey[]) {
    const override = overrides[key];
    if (override) merged[key] = { ...base[key], ...override } as AntTypeConfig;
  }
  return merged;
}

/**
 * Sloučí override z propu `config` s bundled defaultConfig.json.
 * `game`/`antTypes` se mergují po jednotlivých klíčích, `levels` se buď celé
 * nahradí, nebo se nemergeuje vůbec (viz plán, sekce "Konfigurace jako JSON") —
 * částečné přepsání jednoho levelu by vedlo k nekonzistentním datům.
 */
export function mergeConfig(overrides?: DeepPartial<AntsGameConfig>): AntsGameConfig {
  if (!overrides) return defaultConfig;

  const merged: AntsGameConfig = {
    game: { ...defaultConfig.game, ...(overrides.game ?? {}) } as GameConfig,
    antTypes: mergeAntTypes(defaultConfig.antTypes, overrides.antTypes),
    levels: (overrides.levels as LevelConfig[] | undefined) ?? defaultConfig.levels,
  };

  if (!validateConfig(merged)) {
    console.warn('[AntsGameComponent] neplatný config override, používám výchozí hodnoty');
    return defaultConfig;
  }

  return merged;
}
