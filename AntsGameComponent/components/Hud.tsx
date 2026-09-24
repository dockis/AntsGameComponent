import { useLayoutEffect, useRef } from 'react';
import type { HudState } from '../engine/Game';
import styles from './Hud.module.css';

export interface HudProps {
  visible: boolean;
  subscribeHud: (listener: (hud: HudState) => void) => () => void;
}

// Level/kills/health bar se aktualizují přímou DOM manipulací přes refs, ne přes React
// state — onHudUpdate (viz useAntsGameEngine) střílí až 60x/s během hraní, takže re-render
// přes state by byl zbytečně drahý (stejný princip jako u mravenců samotných).
export function Hud({ visible, subscribeHud }: HudProps) {
  const levelRef = useRef<HTMLSpanElement>(null);
  const killsRef = useRef<HTMLSpanElement>(null);
  const healthBarRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(
    () =>
      subscribeHud((hud) => {
        if (levelRef.current) levelRef.current.textContent = String(hud.level);
        if (killsRef.current) killsRef.current.textContent = `${hud.killedCount} / ${hud.killTarget}`;
        if (healthBarRef.current) {
          healthBarRef.current.style.width = `${Math.max(0, hud.healthRatio) * 100}%`;
        }
      }),
    [subscribeHud]
  );

  const rootClassName = `${styles.hud} ${visible ? styles.visible : ''}`;

  return (
    <div className={rootClassName}>
      <div className={styles.levelRow}>
        Level <span ref={levelRef}>1</span>
      </div>
      <div className={styles.killsRow}>
        Zneškodněno: <span ref={killsRef}>0 / 0</span>
      </div>
      <div className={styles.healthTrack}>
        <div ref={healthBarRef} className={styles.healthBar} />
      </div>
    </div>
  );
}
