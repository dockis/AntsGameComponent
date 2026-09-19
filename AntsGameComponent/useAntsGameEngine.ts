import type { RefObject } from 'react';
import type { AntsGameComponentProps, GameState } from './types';

interface UseAntsGameEngineArgs {
  rootRef: RefObject<HTMLDivElement | null>;
  targetRef: RefObject<SVGGElement | null>;
  stainsLayerRef: RefObject<SVGGElement | null>;
  antsLayerRef: RefObject<SVGGElement | null>;
  props: AntsGameComponentProps;
}

export interface AntsGameEngineHandle {
  pause(): void;
  resume(): void;
  reset(): void;
  mute(muted: boolean): void;
  getState(): GameState;
}

// TODO (kroky 3-5 plánu): nahradit stub skutečným napojením na engine/Game.ts
// (preloadAll SVG/audio assetů, vytvoření Game instance nad refs, RAF smyčka, cleanup v návratu useEffectu).
export function useAntsGameEngine(_args: UseAntsGameEngineArgs): AntsGameEngineHandle {
  return {
    pause() {},
    resume() {},
    reset() {},
    mute() {},
    getState() {
      return 'MENU';
    },
  };
}
