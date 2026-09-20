import { useLayoutEffect, useRef } from 'react';
import type { GameOverInfo, HudState, LevelCompleteInfo } from '../engine/Game';
import type { GameState } from '../types';
import styles from './Overlay.module.css';

export interface OverlayProps {
  gameState: GameState;
  levelCompleteInfo: LevelCompleteInfo | null;
  gameOverInfo: GameOverInfo | null;
  introVisible: boolean;
  introImageUrl: string;
  menuBackgroundImageUrl: string;
  gameOverImageUrl: string;
  gameCompleteImageUrl: string;
  muted: boolean;
  subscribeHud: (listener: (hud: HudState) => void) => () => void;
  onStartNewGame: () => void;
  onContinueFromMenu: () => void;
  onRetry: () => void;
  onContinueLevel: () => void;
  onResume: () => void;
  onToggleMute: () => void;
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
  introVisible,
  introImageUrl,
  menuBackgroundImageUrl,
  gameOverImageUrl,
  gameCompleteImageUrl,
  muted,
  subscribeHud,
  onStartNewGame,
  onContinueFromMenu,
  onRetry,
  onContinueLevel,
  onResume,
  onToggleMute,
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

  const levelComplete = levelCompleteInfo ? formatLevelCompleteMessage(levelCompleteInfo) : null;
  const gameOver = gameOverInfo ? formatGameOverMessage(gameOverInfo) : null;

  const screenClassName = (key: GameState): string =>
    `${styles.screen} ${gameState === key ? styles.screenVisible : ''}`;

  return (
    <>
      <div
        className={`${styles.screen} ${styles.intro} ${introVisible ? styles.screenVisible : ''}`}
      >
        <img
          className={styles.introImage}
          src={introImageUrl}
          alt=""
          onError={() => console.error(`[Overlay] nepodařilo se načíst úvodní grafiku: ${introImageUrl}`)}
        />
      </div>

      <div className={`${screenClassName('MENU')} ${styles.menuScreen}`}>
        <img
          className={styles.menuBackground}
          src={menuBackgroundImageUrl}
          alt=""
          onError={() =>
            console.error(`[Overlay] nepodařilo se načíst pozadí MENU obrazovky: ${menuBackgroundImageUrl}`)
          }
        />
        <div className={styles.screenContent}>
          <button ref={menuContinueBtnRef} type="button" onClick={onContinueFromMenu}>
            Pokračovat
          </button>
          <button ref={menuStartBtnRef} type="button" onClick={onStartNewGame}>
            Start
          </button>
          <button type="button" onClick={onToggleMute} aria-pressed={muted}>
            {muted ? 'Zvuk: vypnutý' : 'Zvuk: zapnutý'}
          </button>
        </div>
      </div>

      <div className={screenClassName('LEVEL_COMPLETE')}>
        <div className={styles.screenContent}>
          {levelCompleteInfo?.gameComplete ? (
            <>
              <img
                className={styles.gameCompleteImage}
                src={gameCompleteImageUrl}
                alt=""
                onError={() =>
                  console.error(`[Overlay] nepodařilo se načíst grafiku "Hra dokončena": ${gameCompleteImageUrl}`)
                }
              />
              <p>{levelComplete?.message}</p>
            </>
          ) : (
            <h2>{levelComplete?.message ?? 'Level splněn!'}</h2>
          )}
          <button type="button" onClick={onContinueLevel}>
            {levelComplete?.buttonLabel ?? 'Pokračovat'}
          </button>
        </div>
      </div>

      <div className={screenClassName('GAME_OVER')}>
        <div className={styles.screenContent}>
          <img
            className={styles.gameOverImage}
            src={gameOverImageUrl}
            alt=""
            onError={() => console.error(`[Overlay] nepodařilo se načíst grafiku "Cíl zničen": ${gameOverImageUrl}`)}
          />
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
