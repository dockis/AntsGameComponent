import { useEffect, useLayoutEffect, useRef } from 'react';
import type { GameOverInfo, HudState, LevelCompleteInfo } from '../engine/Game';
import type { GameState } from '../types';
import styles from './Overlay.module.css';

const ONBOARDING_DURATION_MS = 4000;

export interface OverlayProps {
  gameState: GameState;
  levelCompleteInfo: LevelCompleteInfo | null;
  gameOverInfo: GameOverInfo | null;
  onboardingVisible: boolean;
  muted: boolean;
  subscribeHud: (listener: (hud: HudState) => void) => () => void;
  onStartNewGame: () => void;
  onContinueFromMenu: () => void;
  onRetry: () => void;
  onContinueLevel: () => void;
  onResume: () => void;
  onToggleMute: () => void;
  onDismissOnboarding: () => void;
}

function formatLevelCompleteMessage(info: LevelCompleteInfo): { message: string; buttonLabel: string } {
  return info.gameComplete
    ? { message: `Hra dokončena! Zvládl jsi všech ${info.totalLevels} levelů.`, buttonLabel: 'Zpět do menu' }
    : { message: `Level ${info.level} splněn!`, buttonLabel: 'Pokračovat' };
}

function formatGameOverMessage(info: GameOverInfo): { message: string; buttonLabel: string } {
  if (info.action === 'reset') {
    return {
      message: `Vráceno na level 1 (level ${info.level} se nepodařilo dokončit).`,
      buttonLabel: 'Zpět na start',
    };
  }
  const totalText = info.maxAttempts != null ? ` z ${info.maxAttempts}` : '';
  return {
    message: `Level ${info.level} — pokus ${info.attemptNumber}${totalText}`,
    buttonLabel: 'Zkusit znovu',
  };
}

export function Overlay({
  gameState,
  levelCompleteInfo,
  gameOverInfo,
  onboardingVisible,
  muted,
  subscribeHud,
  onStartNewGame,
  onContinueFromMenu,
  onRetry,
  onContinueLevel,
  onResume,
  onToggleMute,
  onDismissOnboarding,
}: OverlayProps) {
  const menuContinueBtnRef = useRef<HTMLButtonElement>(null);
  const menuStartBtnRef = useRef<HTMLButtonElement>(null);

  // "Pokračovat (level N)" / "Start" / "Nová hra" popisky se (stejně jako Hud) aktualizují
  // imperativně přes subscribeHud, ne přes React state — level/hasProgress jsou součástí
  // stejného vysokofrekvenčního HudState streamu jako kills/health. Proto tato tlačítka
  // v JSX níže NEMAJÍ žádný na stavu závislý className/text — jinak by ho React při
  // dalším renderu (např. po změně gameState) přepsal zpátky a smazal tuhle mutaci.
  useLayoutEffect(
    () =>
      subscribeHud((hud) => {
        if (menuContinueBtnRef.current) {
          menuContinueBtnRef.current.classList.toggle(styles.hiddenButton, !hud.hasProgress);
          menuContinueBtnRef.current.textContent = `Pokračovat (level ${hud.level})`;
        }
        if (menuStartBtnRef.current) {
          menuStartBtnRef.current.textContent = hud.hasProgress ? 'Nová hra' : 'Start';
        }
      }),
    [subscribeHud]
  );

  useEffect(() => {
    if (!onboardingVisible) return;
    document.addEventListener('pointerdown', onDismissOnboarding, { once: true });
    const timer = setTimeout(onDismissOnboarding, ONBOARDING_DURATION_MS);
    return () => {
      document.removeEventListener('pointerdown', onDismissOnboarding);
      clearTimeout(timer);
    };
  }, [onboardingVisible, onDismissOnboarding]);

  const levelComplete = levelCompleteInfo ? formatLevelCompleteMessage(levelCompleteInfo) : null;
  const gameOver = gameOverInfo ? formatGameOverMessage(gameOverInfo) : null;

  const screenClassName = (key: GameState): string =>
    `${styles.screen} ${gameState === key ? styles.screenVisible : ''}`;

  return (
    <>
      <div className={`${styles.onboarding} ${onboardingVisible ? styles.onboardingVisible : ''}`}>
        Klepni na mravence dřív, než snědí cíl!
      </div>

      <div className={screenClassName('MENU')}>
        <div className={styles.screenContent}>
          <h1>Mravenci vs. kostka cukru</h1>
          <button ref={menuContinueBtnRef} type="button" onClick={onContinueFromMenu}>
            Pokračovat
          </button>
          <button ref={menuStartBtnRef} type="button" onClick={onStartNewGame}>
            Start
          </button>
          <button type="button" className={styles.muteButton} onClick={onToggleMute} aria-pressed={muted}>
            {muted ? 'Zvuk: vypnutý' : 'Zvuk: zapnutý'}
          </button>
        </div>
      </div>

      <div className={screenClassName('LEVEL_COMPLETE')}>
        <div className={styles.screenContent}>
          <h2>{levelComplete?.message ?? 'Level splněn!'}</h2>
          <button type="button" onClick={onContinueLevel}>
            {levelComplete?.buttonLabel ?? 'Pokračovat'}
          </button>
        </div>
      </div>

      <div className={screenClassName('GAME_OVER')}>
        <div className={styles.screenContent}>
          <h2>Cíl zničen!</h2>
          <p>{gameOver?.message ?? ''}</p>
          <button type="button" onClick={onRetry}>
            {gameOver?.buttonLabel ?? 'Zkusit znovu'}
          </button>
        </div>
      </div>

      <div className={screenClassName('PAUSED')}>
        <div className={styles.screenContent}>
          <h2>Pauza</h2>
          <button type="button" onClick={onResume}>
            Pokračovat
          </button>
        </div>
      </div>
    </>
  );
}
