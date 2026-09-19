import { forwardRef, useImperativeHandle, useRef } from 'react';
import type { AntsGameComponentProps, AntsGameComponentHandle } from './types';
import { useAntsGameEngine } from './useAntsGameEngine';
import styles from './AntsGameComponent.module.css';

export const AntsGameComponent = forwardRef<AntsGameComponentHandle, AntsGameComponentProps>(
  function AntsGameComponent(props, ref) {
    const { className, style, fullscreen = false } = props;

    const rootRef = useRef<HTMLDivElement>(null);
    const targetRef = useRef<SVGGElement>(null);
    const stainsLayerRef = useRef<SVGGElement>(null);
    const antsLayerRef = useRef<SVGGElement>(null);

    const engine = useAntsGameEngine({ rootRef, targetRef, stainsLayerRef, antsLayerRef, props });

    useImperativeHandle(
      ref,
      () => ({
        pause: () => engine.pause(),
        resume: () => engine.resume(),
        reset: () => engine.reset(),
        mute: (muted: boolean) => engine.mute(muted),
        getState: () => engine.getState(),
      }),
      [engine]
    );

    const rootClassName = [styles.root, fullscreen ? styles.fullscreen : '', className]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={rootRef} className={rootClassName} style={style}>
        <svg className={styles.scene} viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice">
          <g ref={targetRef} transform="translate(200,400)" />
          <g ref={stainsLayerRef} />
          <g ref={antsLayerRef} />
        </svg>
        {/* TODO (krok 7 plánu): Hud/Overlay komponenty napojené na onStateChange/onHudUpdate */}
      </div>
    );
  }
);
