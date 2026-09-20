import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Hud } from './components/Hud';
import { Overlay } from './components/Overlay';
import { mergeConfig } from './config/schema';
import type { AntsGameComponentProps, AntsGameComponentHandle } from './types';
import { useAntsGameEngine } from './useAntsGameEngine';
import styles from './AntsGameComponent.module.css';

const TARGET_DAMAGE_STATE_COUNT = 6;

export const AntsGameComponent = forwardRef<AntsGameComponentHandle, AntsGameComponentProps>(
  function AntsGameComponent(props, ref) {
    const { className, style, fullscreen = false, config } = props;

    const rootRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<SVGSVGElement>(null);
    const targetRef = useRef<SVGGElement>(null);
    const stainsLayerRef = useRef<SVGGElement>(null);
    const antsLayerRef = useRef<SVGGElement>(null);

    const engine = useAntsGameEngine({ rootRef, sceneRef, targetRef, stainsLayerRef, antsLayerRef, props });

    // Prázdné dependency pole je záměrné a bezpečné: pause/resume/reset/mute/getState mají
    // stabilní identitu napříč rendery (viz actionsRef lazy init v useAntsGameEngine), takže
    // není třeba imperative handle přegenerovávat při každé změně engine.gameState apod.
    useImperativeHandle(
      ref,
      () => ({
        pause: () => engine.pause(),
        resume: () => engine.resume(),
        reset: () => engine.reset(),
        mute: (muted: boolean) => engine.mute(muted),
        getState: () => engine.getState(),
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
    );

    // Jen pro první JSX render (viewBox/transform cíle) — engine si config sloučí
    // nezávisle uvnitř useAntsGameEngine. sceneWidth/sceneHeight je tu jediný zdroj
    // pravdy pro viewBox (na rozdíl od dnešního index.html, kde byl duplicitně
    // zapsaný i v js/config.js — viz plán, sekce "Konfigurace jako JSON").
    const { sceneWidth, sceneHeight } = mergeConfig(config).game;

    const rootClassName = [styles.root, fullscreen ? styles.fullscreen : '', className]
      .filter(Boolean)
      .join(' ');

    // Zvuková odezva na tap (viz js/ui.js _bindTap) — zachováno jako tenký wrapper
    // kolem interních akcí z hooku, aby Overlay sám nemusel znát AudioManager.
    const withTap = (action: () => void) => () => {
      engine.playUiTap();
      action();
    };

    return (
      <div ref={rootRef} className={rootClassName} style={style}>
        <svg
          ref={sceneRef}
          className={styles.scene}
          viewBox={`0 0 ${sceneWidth} ${sceneHeight}`}
          preserveAspectRatio="xMidYMid slice"
        >
          <g ref={targetRef} transform={`translate(${sceneWidth / 2},${sceneHeight / 2})`}>
            {/* data-target-state místo id (viz Target.ts) — bezpečné i s víc instancemi na stránce. */}
            {Array.from({ length: TARGET_DAMAGE_STATE_COUNT }, (_, i) => (
              <g
                key={i}
                data-target-state={i}
                className={styles.targetState}
                style={i === 0 ? undefined : { display: 'none' }}
              />
            ))}
          </g>
          <g ref={stainsLayerRef} />
          <g ref={antsLayerRef} className={styles.antsLayer} />
        </svg>

        <Hud
          visible={engine.gameState === 'PLAYING' || engine.gameState === 'PAUSED'}
          subscribeHud={engine.subscribeHud}
        />

        <Overlay
          gameState={engine.gameState}
          levelCompleteInfo={engine.levelCompleteInfo}
          gameOverInfo={engine.gameOverInfo}
          introVisible={engine.introVisible}
          introImageUrl={engine.introImageUrl}
          muted={engine.muted}
          subscribeHud={engine.subscribeHud}
          onStartNewGame={withTap(engine.startNewGame)}
          onContinueFromMenu={withTap(engine.continueFromMenu)}
          onRetry={withTap(engine.retryLevel)}
          onContinueLevel={withTap(engine.continueLevel)}
          onResume={withTap(engine.resume)}
          onToggleMute={withTap(() => engine.mute(!engine.muted))}
        />
      </div>
    );
  }
);
