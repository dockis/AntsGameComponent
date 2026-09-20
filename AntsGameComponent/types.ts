import type { CSSProperties } from 'react';
import type { AntsGameConfig, DeepPartial } from './config/schema';

export type { AntsGameConfig, DeepPartial };

export type GameState = 'MENU' | 'PLAYING' | 'LEVEL_COMPLETE' | 'GAME_OVER' | 'PAUSED';

export interface AntsGameComponentProps {
  /**
   * Přepíše výchozí `config/defaultConfig.json` (viz `mergeConfig`). `game`/`antTypes` se
   * mergují po klíčích, `levels` se buď celé nahradí, nebo zůstane výchozí pole 12 levelů.
   * Čte se jen při prvním mountu — pozdější změna propu instanci enginu nepřegeneruje
   * (viz `assetsBaseUrl` níže, stejné omezení a stejný důvod).
   */
  config?: DeepPartial<AntsGameConfig>;
  /**
   * Base URL pro `assets/svg/` a `assets/sounds/` (výchozí: automaticky odvozeno z umístění
   * zkopírované složky komponenty, funguje bez konfigurace). Čte se jen při prvním mountu.
   */
  assetsBaseUrl?: string;
  /**
   * Mapa jméno assetu → URL pro výměnu jednotlivých SVG/zvukových souborů bez rebuildu
   * (např. `{ antNormal: '/brand/ant.svg', hit: '/brand/hit.mp3' }`). SVG jména viz
   * `engine/svgAssets.ts` (`buildAntSvgAssetNames`), zvuková jména viz `engine/AudioManager.ts`
   * (`SoundName`). Klíč `gameIntro` přepíše úvodní grafiku zobrazenou po stisku "Nová hra"
   * (`assets/svg/gameIntro.svg`). Klíč `menuBackground` přepíše grafiku na pozadí
   * MENU obrazovky (`assets/svg/menuBackground.svg`). Klíč `gameOver` přepíše grafiku
   * zobrazenou na obrazovce po nezdařeném levelu (`assets/svg/gameOver.svg`).
   * Čte se jen při prvním mountu.
   */
  assetOverrides?: Record<string, string>;
  /** Prefix klíčů v localStorage (výchozí `'mravenci:'`). Čte se jen při prvním mountu. */
  storageNamespace?: string;
  /**
   * `false` (výchozí) = vložitelný widget, rozměry přebírá od rodičovského kontejneru.
   * `true` = původní chování samostatné hry (`100vw/100dvh` + vynucená portrait rotace
   * přes `OrientationManager`). Čte se jen při prvním mountu.
   */
  fullscreen?: boolean;
  /**
   * Počáteční stav ztlumení zvuku při prvním mountu (přepíše hodnotu perzistovanou
   * z předchozí session). Není to plně řízený (controlled) prop — pozdější změna
   * hodnoty propu za běhu se neprojeví; k tomu slouží `ref.current.mute()`.
   */
  muted?: boolean;
  className?: string;
  style?: CSSProperties;
  onStateChange?: (state: GameState) => void;
  onLevelComplete?: (info: { level: number; gameComplete: boolean }) => void;
  onGameOver?: (info: { level: number; attempt: number }) => void;
  onAntKilled?: (info: { killedCount: number; killTarget: number }) => void;
}

/**
 * Imperativní ovládání přes ref, např. `const ref = useRef<AntsGameComponentHandle>(null)`.
 * Vhodné pro ovládání zvenčí (hostitel chce hru pozastavit při otevření vlastního modalu apod.),
 * pro běžné použití stačí jen props.
 */
export interface AntsGameComponentHandle {
  pause(): void;
  /** Pokračuje ve hře, pokud je pozastavená (jinak no-op). */
  resume(): void;
  /** Restartuje na level 1, jako tlačítko "Start"/"Nová hra" v menu. */
  reset(): void;
  mute(muted: boolean): void;
  getState(): GameState;
}
