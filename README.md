# AntsGameComponent

Vložitelná React komponenta s hrou "Mravenci". Do cílového projektu se dá dostat dvěma způsoby.

## Způsob A — instalace přes npm z GitHubu (předbuildováno)

Veřejné GitHub repo obsahuje vždy i zbuildovaný `dist/` (viz `scripts/sync-public.ps1` v tomto
lokálním repu), takže instalace nevyžaduje žádný build krok u konzumenta:

```bash
npm install github:dockis/AntsGameComponent#v1.0.0
# nebo nejnovější main:
npm install github:dockis/AntsGameComponent#main
```

Použití:

```tsx
import { AntsGameComponent } from 'ants-game-component';

<AntsGameComponent className="my-widget" />
```

Vyžaduje `react` a `react-dom` (peer dependencies, viz `package.json`). Assety (SVG/zvuky) se
automaticky dohledají vedle nainstalovaného `dist/index.js` — není potřeba nic dalšího nastavovat.

## Způsob B — zkopírování zdroje do cílového projektu

Složka `AntsGameComponent/` je samostatná (jen relativní importy dovnitř sebe sama, žádné
závislosti na zbytku tohoto repa) a dá se prostě zkopírovat do `src/` cílového projektu:

```bash
cp -r AntsGameComponent <cilovy-projekt>/src/AntsGameComponent
```

Použití:

```tsx
import { AntsGameComponent } from './AntsGameComponent';

<AntsGameComponent className="my-widget" />
```

Předpoklady na hostitelský projekt:
- React + TypeScript, bundler podporující CSS Modules (`*.module.css`) — Vite, webpack, Next.js
  atd. to mají ve výchozím nastavení.
- `react` a `react-dom` >= 18.3.

Assety se v tomto případě dohledají vedle zkopírované složky (`AntsGameComponent/assets/...`),
stejný mechanismus jako u Způsobu A — žádná ruční konfigurace `assetsBaseUrl` není potřeba,
pokud strukturu složky zachováš beze změny.

## API

### Props (`AntsGameComponentProps`)

Všechny propy se čtou jen při prvním mountu (pozdější změna hodnoty za běhu instanci enginu
nepřegeneruje) — pro řízení za běhu slouží `ref`, viz níže.

| Prop | Typ | Výchozí | Popis |
| --- | --- | --- | --- |
| `config` | `DeepPartial<AntsGameConfig>` | bundled `defaultConfig.json` | Override výchozí konfigurace, viz sekce Konfigurace níže. |
| `assetsBaseUrl` | `string` | auto-odvozeno z umístění komponenty | Base URL pro `assets/svg/` a `assets/sounds/`. |
| `assetOverrides` | `Record<string, string>` | — | Mapa jméno assetu → URL pro výměnu jednotlivých souborů, viz sekce Assety níže. |
| `storageNamespace` | `string` | `'mravenci:'` | Prefix klíčů v `localStorage`. |
| `fullscreen` | `boolean` | `false` | `false` = vložitelný widget, rozměry od rodiče. `true` = původní `100vw/100dvh` + vynucená portrait rotace. |
| `muted` | `boolean` | — | Počáteční stav ztlumení (přepíše perzistovanou hodnotu). Není controlled — za běhu se mění přes `ref.current.mute()`. |
| `className` / `style` | `string` / `CSSProperties` | — | Standardní React propy na kořenový element. |
| `onStateChange` | `(state: GameState) => void` | — | `GameState = 'MENU' \| 'PLAYING' \| 'LEVEL_COMPLETE' \| 'GAME_OVER' \| 'PAUSED'`. |
| `onLevelComplete` | `(info: { level: number; gameComplete: boolean }) => void` | — | Voláno po dokončení levelu. |
| `onGameOver` | `(info: { level: number; attempt: number }) => void` | — | Voláno při neúspěchu levelu. |
| `onAntKilled` | `(info: { killedCount: number; killTarget: number }) => void` | — | Voláno po zabití mravence. |

### Imperativní ovládání (`AntsGameComponentHandle`)

```tsx
const ref = useRef<AntsGameComponentHandle>(null);
<AntsGameComponent ref={ref} />;

ref.current?.pause();
ref.current?.resume();  // pokračuje, jen pokud je hra pozastavená
ref.current?.reset();   // restart na level 1, jako tlačítko "Nová hra"
ref.current?.mute(true);
ref.current?.getState(); // aktuální GameState
```

Vhodné, když hostitel potřebuje hru ovládat zvenčí (např. pauznout při otevření vlastního
modalu) — pro běžné použití stačí samotné propy.

## Konfigurace

Výchozí konfigurace je `AntsGameComponent/config/defaultConfig.json`, typovaná přes
`AntsGameConfig` v `AntsGameComponent/config/schema.ts` — ten je zdroj pravdy pro kompletní
seznam polí (herní parametry v `game`, tři typy mravenců v `antTypes`, pole 12 levelů
v `levels`). Prop `config` se s výchozí konfigurací slučuje přes `mergeConfig`:

- `game` a `antTypes` se mergují **po jednotlivých klíčích** — stačí přepsat jen to, co chceš
  změnit, zbytek zůstává výchozí.
- `levels` se buď **celé nahradí** vlastním polem, nebo zůstane výchozích 12 levelů — částečné
  přepsání jednoho levelu podporované není (vedlo by k nekonzistentním datům).

```tsx
<AntsGameComponent
  config={{
    game: { baseAntSpeed: 80, criticalHealthThreshold: 0.3 },
    antTypes: { aggressive: { speedMultiplier: 1.6 } },
  }}
/>
```

Neplatný override (chybí `game.sceneWidth`/`sceneHeight`, `antTypes` není objekt, nebo `levels`
není neprázdné pole) se ignoruje a do konzole se vypíše warning — použije se výchozí konfigurace.

## Assety

Assety (`assets/svg/*.svg`, `assets/sounds/*.mp3`) se v enginu načítají dynamicky přes `fetch`,
ne přes bundler. Dvě úrovně přizpůsobení:

- **`assetsBaseUrl`** — přesune celou base cestu, ze které se assety dohledávají (výchozí:
  u Způsobu A vedle nainstalovaného `dist/index.js`, u Způsobu B vedle zkopírované složky
  `AntsGameComponent/assets/...`). Změň jen pokud jsi strukturu složky/instalace přeuspořádal.
- **`assetOverrides`** — nahradí jednotlivé soubory podle jména, beze změny zbytku a bez
  rebuildu:

  ```tsx
  <AntsGameComponent
    assetOverrides={{
      antNormal: '/brand/ant.svg',
      hit: '/brand/hit.mp3',
      gameIntro: '/brand/intro.svg',
    }}
  />
  ```

  Platná jména:
  - SVG typů mravenců a poškozovacích stavů cíle: `antNormal`, `antAggressive`, `antArmored`,
    `antStain`, `level<N>State<0-5>` pro každý level v konfiguraci (viz
    `engine/svgAssets.ts#buildAntSvgAssetNames`).
  - Speciální obrazovky: `gameIntro` (po stisku "Nová hra"), `menuBackground` (pozadí MENU),
    `gameOver` (po nezdařeném levelu), `gameComplete` (po dokončení posledního levelu).
  - Zvuky (`engine/AudioManager.ts#SoundName`): `hit`, `kill`, `armoredFirstHit`,
    `consumeTick`, `criticalHealth`, `levelComplete`, `gameOver`, `uiTap`.
