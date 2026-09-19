import type { CSSProperties } from 'react';

// TODO (krok 2): nahradit `unknown` skutečným AntsGameConfig typem z config/schema.ts
export type AntsGameConfig = Record<string, unknown>;

export type DeepPartial<T> = T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;

export type GameState = 'MENU' | 'PLAYING' | 'LEVEL_COMPLETE' | 'GAME_OVER' | 'PAUSED';

export interface AntsGameComponentProps {
  config?: DeepPartial<AntsGameConfig>;
  assetsBaseUrl?: string;
  assetOverrides?: Record<string, string>;
  storageNamespace?: string;
  fullscreen?: boolean;
  muted?: boolean;
  className?: string;
  style?: CSSProperties;
  onStateChange?: (state: GameState) => void;
  onLevelComplete?: (info: { level: number; gameComplete: boolean }) => void;
  onGameOver?: (info: { level: number; attempt: number }) => void;
  onAntKilled?: (info: { killedCount: number; killTarget: number }) => void;
}

export interface AntsGameComponentHandle {
  pause(): void;
  resume(): void;
  reset(): void;
  mute(muted: boolean): void;
  getState(): GameState;
}
