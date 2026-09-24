import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AntsGameComponent } from '../AntsGameComponent';
import type { AntsGameComponentHandle, AntsGameConfig, DeepPartial, GameState } from '../AntsGameComponent';
import './host.css';

// Barevně odlišný mravenec jako data: URI — dokazuje výměnu grafiky přes assetOverrides
// bez rebuildu (viz plán, sekce "Výměna grafiky/audia za běhu").
const OVERRIDE_ANT_SVG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg"><ellipse rx="7" ry="4" fill="#c0392b" /><ellipse cx="8" rx="3.5" ry="3" fill="#e74c3c" /></svg>'
  );

type Variant = 'default' | 'override' | 'quickLevelComplete' | 'quickGameComplete' | 'quickGameOver';

interface VariantSetup {
  label: string;
  config?: DeepPartial<AntsGameConfig>;
  assetOverrides?: Record<string, string>;
  /**
   * Vlastní storageNamespace pro "rychlé" varianty (feature 26): LevelManager čte
   * currentLevel z localStorage už v konstruktoru, takže bez odděleného namespace by
   * zbylý (vyšší) currentLevel z předchozí session narazil mimo krátké pole `levels`
   * a hra by při přepnutí spadla. `default`/`override` sdílí namespace záměrně beze změny.
   */
  storageNamespace?: string;
}

const QUICK_LEVEL_COMPLETE_LEVELS: AntsGameConfig['levels'] = [
  { level: 1, killTarget: 1, maxAnts: 3, spawnInterval: [400, 700], speedMultiplier: 1.0, ants: { normal: 100, aggressive: 0, armored: 0 }, backgroundColor: '#000000' },
  { level: 2, killTarget: 8, maxAnts: 3, spawnInterval: [1500, 2200], speedMultiplier: 0.8, ants: { normal: 100, aggressive: 0, armored: 0 }, backgroundColor: '#000000' },
];

const QUICK_GAME_COMPLETE_LEVELS: AntsGameConfig['levels'] = [
  { level: 1, killTarget: 1, maxAnts: 3, spawnInterval: [400, 700], speedMultiplier: 1.0, ants: { normal: 100, aggressive: 0, armored: 0 }, backgroundColor: '#000000' },
];

// Feature 26: rychlé vyvolání a opakované vyzkoušení koncových obrazovek bez ručního
// odehrání 12 levelů — čistě přes existující `config` prop, žádný zásah do herní logiky.
const VARIANTS: Record<Variant, VariantSetup> = {
  default: {
    label: 'Výchozí (12 levelů)',
  },
  override: {
    label: 'Vlastní config + grafika (targetMaxHealth: 20, override antNormal)',
    config: { game: { targetMaxHealth: 20 } },
    assetOverrides: { antNormal: OVERRIDE_ANT_SVG },
  },
  // Běžný LEVEL_COMPLETE (gameComplete: false): level 1 splníš zabitím jediného mravence,
  // level 2 v poli existuje jen proto, aby LevelManager nevyhodnotil dokončení celé hry.
  quickLevelComplete: {
    label: 'Rychlý LEVEL_COMPLETE (level 1 splněn po 1 zabití)',
    config: { levels: QUICK_LEVEL_COMPLETE_LEVELS },
    storageNamespace: 'dev-quickLevelComplete:',
  },
  // LEVEL_COMPLETE s gameComplete: true: jediný level v poli → registerSuccess ho ihned
  // vyhodnotí jako poslední (currentLevel >= levels.length).
  quickGameComplete: {
    label: 'Rychlý LEVEL_COMPLETE s gameComplete (jediný level, splněn po 1 zabití)',
    config: { levels: QUICK_GAME_COMPLETE_LEVELS },
    storageNamespace: 'dev-quickGameComplete:',
  },
  // GAME_OVER: nízké targetMaxHealth cíl rychle zničí, maxRestarts: 0 zajistí, že se
  // hned ukáže i varianta zprávy "vráceno na level 1" (ne jen "zkusit znovu").
  quickGameOver: {
    label: 'Rychlý GAME_OVER (targetMaxHealth: 2, bez restartů)',
    config: { game: { targetMaxHealth: 2, retry: { mode: 'strict', maxRestarts: 0 } } },
    storageNamespace: 'dev-quickGameOver:',
  },
};

function App() {
  const ref = useRef<AntsGameComponentHandle>(null);
  // config/assetOverrides/storageNamespace se čtou jen při mountu (viz AntsGameComponentProps
  // JSDoc) — `key={variant}` tu proto záměrně vynucuje remount, aby šla varianta reálně vyzkoušet.
  const [variant, setVariant] = useState<Variant>('default');
  const [log, setLog] = useState<string[]>([]);
  const [lastState, setLastState] = useState<GameState>('MENU');

  const appendLog = (line: string) => {
    setLog((prev) => [`${new Date().toLocaleTimeString()}  ${line}`, ...prev].slice(0, 30));
  };

  const activeVariant = VARIANTS[variant];

  return (
    <div className="hostApp">
      <h1>Hostitelská aplikace (simulace)</h1>
      <p>Text a tlačítka kolem ověřují, že AntsGameComponent nekoliduje s cizím CSS (viz dev/host.css).</p>
      <button type="button" onClick={() => appendLog('tlačítko hostitele kliknuto (jen test okolního CSS)')}>
        Tlačítko hostitele
      </button>

      <div className="hostPanel">
        <h2>Ovládání přes ref (AntsGameComponentHandle)</h2>
        <button type="button" onClick={() => ref.current?.pause()}>
          pause()
        </button>
        <button type="button" onClick={() => ref.current?.resume()}>
          resume()
        </button>
        <button type="button" onClick={() => ref.current?.reset()}>
          reset()
        </button>
        <button type="button" onClick={() => ref.current?.mute(true)}>
          mute(true)
        </button>
        <button type="button" onClick={() => ref.current?.mute(false)}>
          mute(false)
        </button>
        <button type="button" onClick={() => appendLog(`getState() -> ${ref.current?.getState()}`)}>
          getState()
        </button>
        <label>
          {' '}
          Varianta (výběr vynutí remount přes key):{' '}
          <select value={variant} onChange={(e) => setVariant(e.target.value as Variant)}>
            {(Object.keys(VARIANTS) as Variant[]).map((key) => (
              <option key={key} value={key}>
                {VARIANTS[key].label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="gameFrame">
        <AntsGameComponent
          key={variant}
          ref={ref}
          config={activeVariant.config}
          assetOverrides={activeVariant.assetOverrides}
          storageNamespace={activeVariant.storageNamespace}
          onStateChange={(state) => {
            setLastState(state);
            appendLog(`onStateChange -> ${state}`);
          }}
          onLevelComplete={(info) => appendLog(`onLevelComplete -> ${JSON.stringify(info)}`)}
          onGameOver={(info) => appendLog(`onGameOver -> ${JSON.stringify(info)}`)}
          onAntKilled={(info) => appendLog(`onAntKilled -> ${JSON.stringify(info)}`)}
        />
      </div>

      <div className="hostPanel">
        <h2>Log událostí (aktuální stav: {lastState})</h2>
        <div className="eventLog">
          {log.length === 0 ? '(zatím žádné události)' : log.map((line, i) => <div key={i}>{line}</div>)}
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
