import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AntsGameComponent } from '../AntsGameComponent';

// Simuluje vložení komponenty do menšího kontejneru existující aplikace (viz krok 10 plánu),
// ne fullscreen — ověřuje výchozí "vložitelný widget" chování.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div style={{ width: 400, height: 800, margin: '40px auto', border: '1px solid #333' }}>
      <AntsGameComponent onStateChange={(state) => console.log('[dev harness] state ->', state)} />
    </div>
  </StrictMode>
);
