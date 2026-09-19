import type { CSSProperties } from 'react';
import type { AntsGameConfig, DeepPartial } from './config/schema';

export type { AntsGameConfig, DeepPartial };

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
