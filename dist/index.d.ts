import { CSSProperties } from 'react';
import { ForwardRefExoticComponent } from 'react';
import { RefAttributes } from 'react';

export declare const AntsGameComponent: ForwardRefExoticComponent<AntsGameComponentProps & RefAttributes<AntsGameComponentHandle>>;

/**
 * Imperativní ovládání přes ref, např. `const ref = useRef<AntsGameComponentHandle>(null)`.
 * Vhodné pro ovládání zvenčí (hostitel chce hru pozastavit při otevření vlastního modalu apod.),
 * pro běžné použití stačí jen props.
 */
export declare interface AntsGameComponentHandle {
    pause(): void;
    /** Pokračuje ve hře, pokud je pozastavená (jinak no-op). */
    resume(): void;
    /** Restartuje na level 1, jako tlačítko "Start"/"Nová hra" v menu. */
    reset(): void;
    mute(muted: boolean): void;
    getState(): GameState;
}

export declare interface AntsGameComponentProps {
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
     * zobrazenou na obrazovce po nezdařeném levelu (`assets/svg/gameOver.svg`). Klíč
     * `gameComplete` přepíše grafiku zobrazenou po úspěšném dokončení posledního levelu
     * (`assets/svg/gameComplete.svg`).
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
    onLevelComplete?: (info: {
        level: number;
        gameComplete: boolean;
    }) => void;
    onGameOver?: (info: {
        level: number;
        attempt: number;
    }) => void;
    onAntKilled?: (info: {
        killedCount: number;
        killTarget: number;
    }) => void;
}

export declare interface AntsGameConfig {
    game: GameConfig;
    antTypes: AntTypesConfig;
    levels: LevelConfig[];
}

declare interface AntTypeConfig {
    speedMultiplier: number;
    damageMultiplier: number;
    hitsToKill: number;
    /** Po prvním zásahu přebírá vlastnosti tohoto typu (downgrade, viz "armored"). */
    afterFirstHit?: AntTypeKey;
}

declare type AntTypeKey = 'normal' | 'aggressive' | 'armored';

declare type AntTypesConfig = Record<AntTypeKey, AntTypeConfig>;

export declare type DeepPartial<T> = T extends object ? {
    [K in keyof T]?: DeepPartial<T[K]>;
} : T;

declare interface GameConfig {
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
    /** Doba zobrazení úvodní grafiky po stisku "Nová hra", v ms. */
    introDurationMs: number;
}

export declare type GameState = 'MENU' | 'PLAYING' | 'LEVEL_COMPLETE' | 'GAME_OVER' | 'PAUSED';

declare interface LevelAntWeights {
    /** Váhy v %, ne pravděpodobnosti přímo — sčítají se při výběru typu mravence. */
    normal: number;
    aggressive: number;
    armored: number;
}

declare interface LevelConfig {
    level: number;
    killTarget: number;
    maxAnts: number;
    /** [min, max] v ms. */
    spawnInterval: [number, number];
    speedMultiplier: number;
    ants: LevelAntWeights;
    /** 6místný hex kód vč. `#`, např. `"#1a2b3c"`, barva pozadí scény pro tento level. */
    backgroundColor: string;
}

declare interface RetryConfig {
    mode: RetryMode;
    maxRestarts: number;
}

declare type RetryMode = 'strict' | 'lenient';

declare interface WanderBurstConfig {
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

declare interface WanderNoiseConfig {
    /**
     * Vrstvy plynulého šumu, vzájemně neslučitelné frekvence, aby se vzor
     * nezacykloval viditelně krátce (viz design dokument, feature 17).
     */
    layers: WanderNoiseLayer[];
}

declare interface WanderNoiseLayer {
    /** Úhlová frekvence v rad/s. */
    frequency: number;
    /** Amplituda v rad. */
    amplitude: number;
}

export { }
