import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { mergeConfig } from './config/schema';
import type { SoundName } from './engine/AudioManager';
import { Game, type GameOverInfo, type GameRefs, type HudState, type LevelCompleteInfo } from './engine/Game';
import { Storage } from './engine/Storage';
import { buildAntSvgAssetNames, SvgAssetLoader } from './engine/svgAssets';
import type { AntsGameComponentProps, GameState } from './types';

// Bundler-friendly default (viz plán, sekce "Výměna grafiky/audia za běhu") — funguje
// out-of-the-box po zkopírování AntsGameComponent/ složky do hostitelské app, bez nutnosti
// cokoliv nastavovat. Hostitel může přepsat propem `assetsBaseUrl`.
const DEFAULT_ASSETS_BASE_URL = new URL(/* @vite-ignore */ './assets/', import.meta.url).href;

interface UseAntsGameEngineArgs {
  rootRef: RefObject<HTMLDivElement | null>;
  sceneRef: RefObject<SVGSVGElement | null>;
  targetRef: RefObject<SVGGElement | null>;
  stainsLayerRef: RefObject<SVGGElement | null>;
  antsLayerRef: RefObject<SVGGElement | null>;
  props: AntsGameComponentProps;
}

export interface AntsGameEngineActions {
  pause(): void;
  resume(): void;
  reset(): void;
  mute(muted: boolean): void;
  getState(): GameState;
  /**
   * Interní pub-sub pro Hud/Overlay (krok 7) — NENÍ v AntsGameComponentProps.
   * Záměrně mimo React state: onHudUpdate se volá z Game až 60x/s (každý RAF tick
   * během PLAYING), takže napojení přes useState by vynucovalo re-render celého
   * stromu 60x/s (viz plán, princip "žádný JSX-per-ant re-render"). Odběratel má
   * sám zapisovat přímo do DOM (ref), stejně jako to dělá engine pro mravence.
   */
  subscribeHud(listener: (hud: HudState) => void): () => void;
  /** Interní akce pro Overlay (krok 7), mimo veřejné AntsGameComponentHandle. */
  startNewGame(): void;
  continueFromMenu(): void;
  retryLevel(): void;
  continueLevel(): void;
  playUiTap(): void;
}

export interface AntsGameEngineResult extends AntsGameEngineActions {
  /** Nízkofrekvenční reaktivní stav (přechody stavu, výsledkové obrazovky) — bezpečné pro React state. */
  gameState: GameState;
  levelCompleteInfo: LevelCompleteInfo | null;
  gameOverInfo: GameOverInfo | null;
  introVisible: boolean;
  /** URL úvodní grafiky pro Overlay (feature 22) — odvozeno stejně jako AudioManager._resolveUrl. */
  introImageUrl: string;
  /** URL pozadí MENU obrazovky pro Overlay (feature 23) — odvozeno stejným způsobem jako introImageUrl. */
  menuBackgroundImageUrl: string;
  /** URL grafiky obrazovky GAME_OVER pro Overlay (feature 25) — odvozeno stejným způsobem jako introImageUrl. */
  gameOverImageUrl: string;
  /** URL grafiky dokončení celé hry pro Overlay (feature 26) — odvozeno stejným způsobem jako introImageUrl. */
  gameCompleteImageUrl: string;
  muted: boolean;
}

function normalizeBaseUrl(url: string): string {
  return url.endsWith('/') ? url : `${url}/`;
}

export function useAntsGameEngine({
  rootRef,
  sceneRef,
  targetRef,
  stainsLayerRef,
  antsLayerRef,
  props,
}: UseAntsGameEngineArgs): AntsGameEngineResult {
  const gameRef = useRef<Game | null>(null);
  const hudRef = useRef<HudState | null>(null);
  const hudListenersRef = useRef(new Set<(hud: HudState) => void>());

  // "Latest ref" pattern (viz plán, sekce "Rizika"): callbacky se čtou vždy aktuální
  // z propsRef, aniž by jejich změna na každém renderu hostitele vynucovala re-mount
  // enginu (drahý re-fetch assetů). `config`/`assetsBaseUrl`/`assetOverrides` se
  // naopak čtou jen jednou při mountu (níže) — změna za běhu vyžaduje `key` prop
  // na <AntsGameComponent key={...} /> pro vynucený remount.
  const propsRef = useRef(props);
  propsRef.current = props;

  const [gameState, setGameState] = useState<GameState>('MENU');
  const [levelCompleteInfo, setLevelCompleteInfo] = useState<LevelCompleteInfo | null>(null);
  const [gameOverInfo, setGameOverInfo] = useState<GameOverInfo | null>(null);
  const [introVisible, setIntroVisible] = useState(false);
  const [muted, setMuted] = useState(false);

  // Lazy initializer = čte se jen při prvním renderu (stejná konvence jako assetsBaseUrl
  // uvnitř mount efektu níže), stejný resolve pattern jako AudioManager._resolveUrl.
  const [assetsBaseUrl] = useState(() => normalizeBaseUrl(props.assetsBaseUrl ?? DEFAULT_ASSETS_BASE_URL));
  const [introImageUrl] = useState(
    () => props.assetOverrides?.gameIntro ?? `${assetsBaseUrl}svg/gameIntro.svg`
  );
  const [menuBackgroundImageUrl] = useState(
    () => props.assetOverrides?.menuBackground ?? `${assetsBaseUrl}svg/menuBackground.svg`
  );
  const [gameOverImageUrl] = useState(
    () => props.assetOverrides?.gameOver ?? `${assetsBaseUrl}svg/gameOver.svg`
  );
  const [gameCompleteImageUrl] = useState(
    () => props.assetOverrides?.gameComplete ?? `${assetsBaseUrl}svg/gameComplete.svg`
  );

  useEffect(() => {
    const rootEl = rootRef.current;
    const sceneEl = sceneRef.current;
    const targetEl = targetRef.current;
    const stainsLayerEl = stainsLayerRef.current;
    const antsLayerEl = antsLayerRef.current;

    if (!rootEl || !sceneEl || !targetEl || !stainsLayerEl || !antsLayerEl) {
      console.error('[AntsGameComponent] chybí DOM refs při mountu, engine se neinicializuje');
      return;
    }

    const initialProps = propsRef.current;
    const config = mergeConfig(initialProps.config);
    const assetsBaseUrl = normalizeBaseUrl(initialProps.assetsBaseUrl ?? DEFAULT_ASSETS_BASE_URL);
    const overrides = initialProps.assetOverrides;

    const svgAssets = new SvgAssetLoader({
      baseUrl: `${assetsBaseUrl}svg/`,
      overrides,
    });
    const storage = new Storage(initialProps.storageNamespace);

    const refs: GameRefs = {
      root: rootEl,
      scene: sceneEl,
      targetGroup: targetEl,
      stainsLayer: stainsLayerEl,
      antsLayer: antsLayerEl,
    };

    let cancelled = false;
    let game: Game | null = null;

    // Grafika musí být natažená a naklonovatelná ještě před vytvořením Game/Target
    // (na rozdíl od zvuků, které se donačítají na pozadí uvnitř AudioManageru) —
    // stejný požadavek jako v původním js/game.js main().
    svgAssets
      .preloadAll(buildAntSvgAssetNames(config.levels))
      .then(() => {
        if (cancelled) return;

        game = new Game(refs, {
          config,
          svgAssets,
          storage,
          audioBaseUrl: `${assetsBaseUrl}sounds/`,
          audioOverrides: overrides as unknown as Partial<Record<SoundName, string>> | undefined,
          fullscreen: propsRef.current.fullscreen ?? false,
          onStateChange: (state) => {
            setGameState(state);
            propsRef.current.onStateChange?.(state);
          },
          onHudUpdate: (hud) => {
            hudRef.current = hud;
            hudListenersRef.current.forEach((listener) => listener(hud));
          },
          onLevelComplete: (info) => {
            setLevelCompleteInfo(info);
            propsRef.current.onLevelComplete?.({ level: info.level, gameComplete: info.gameComplete });
          },
          onGameOver: (info) => {
            setGameOverInfo(info);
            propsRef.current.onGameOver?.({ level: info.level, attempt: info.attemptNumber ?? 0 });
          },
          onAntKilled: (info) => propsRef.current.onAntKilled?.(info),
          onShowIntro: () => setIntroVisible(true),
          onHideIntro: () => setIntroVisible(false),
        });

        // Respektovat i explicitní `muted={false}` (přepíše persistovanou hodnotu ze
        // storage), ne jen truthy `muted={true}` — jinak by explicitní "false" tiše
        // nechalo platit ztlumení z předchozí session (viz AntsGameComponentProps.muted).
        if (typeof propsRef.current.muted === 'boolean') {
          game.setMuted(propsRef.current.muted);
        }
        setMuted(game.isMuted());

        gameRef.current = game;
        game.start();
      })
      .catch((err) => {
        console.error('[AntsGameComponent] preload assetů selhal, engine se nespustí:', err);
      });

    return () => {
      cancelled = true;
      game?.destroy();
      gameRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- viz komentář u propsRef výše
  }, []);

  // Stabilní identita metod napříč rendery (lazy init přes ref) — Hud/Overlay na ně
  // mohou bezpečně navěsit useEffect s dependency polem bez zbytečného re-subscribe churn.
  const actionsRef = useRef<AntsGameEngineActions | null>(null);
  if (!actionsRef.current) {
    actionsRef.current = {
      pause: () => gameRef.current?.pause(),
      resume: () => gameRef.current?.resumeGame(),
      reset: () => gameRef.current?.startNewGame(),
      mute: (nextMuted: boolean) => {
        gameRef.current?.setMuted(nextMuted);
        setMuted(nextMuted);
      },
      getState: () => gameRef.current?.state ?? 'MENU',
      subscribeHud: (listener) => {
        hudListenersRef.current.add(listener);
        if (hudRef.current) listener(hudRef.current);
        return () => hudListenersRef.current.delete(listener);
      },
      startNewGame: () => gameRef.current?.startNewGame(),
      continueFromMenu: () => gameRef.current?.startGame(),
      retryLevel: () => gameRef.current?.retryLevel(),
      continueLevel: () => gameRef.current?.continueLevel(),
      playUiTap: () => gameRef.current?.audioManager.play('uiTap'),
    };
  }

  return {
    ...actionsRef.current,
    gameState,
    levelCompleteInfo,
    gameOverInfo,
    introVisible,
    introImageUrl,
    menuBackgroundImageUrl,
    gameOverImageUrl,
    gameCompleteImageUrl,
    muted,
  };
}
