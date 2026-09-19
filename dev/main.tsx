import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AntsGameComponent } from '../AntsGameComponent';
import type { AntsGameComponentHandle, GameState } from '../AntsGameComponent';
import './host.css';

// Barevně odlišný mravenec jako data: URI — dokazuje výměnu grafiky přes assetOverrides
// bez rebuildu (viz plán, sekce "Výměna grafiky/audia za běhu").
const OVERRIDE_ANT_SVG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg"><ellipse rx="7" ry="4" fill="#c0392b" /><ellipse cx="8" rx="3.5" ry="3" fill="#e74c3c" /></svg>'
  );

function App() {
  const ref = useRef<AntsGameComponentHandle>(null);
  // config/assetOverrides se čtou jen při mountu (viz AntsGameComponentProps JSDoc) —
  // `key={variant}` tu proto záměrně vynucuje remount, aby šla varianta reálně vyzkoušet.
  const [variant, setVariant] = useState<'default' | 'override'>('default');
  const [log, setLog] = useState<string[]>([]);
  const [lastState, setLastState] = useState<GameState>('MENU');

  const appendLog = (line: string) => {
    setLog((prev) => [`${new Date().toLocaleTimeString()}  ${line}`, ...prev].slice(0, 30));
  };

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
        <button type="button" onClick={() => setVariant((v) => (v === 'default' ? 'override' : 'default'))}>
          Přepnout na {variant === 'default' ? 'vlastní config + grafiku' : 'výchozí'} (vynutí remount přes key)
        </button>
      </div>

      <div className="gameFrame">
        <AntsGameComponent
          key={variant}
          ref={ref}
          config={variant === 'override' ? { game: { targetMaxHealth: 20 } } : undefined}
          assetOverrides={variant === 'override' ? { antNormal: OVERRIDE_ANT_SVG } : undefined}
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
