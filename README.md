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

## Konfigurace

Obě varianty přijímají stejné propy (`AntsGameComponentProps`, viz `AntsGameComponent/types.ts`),
včetně `config`, `assetOverrides`, `fullscreen`, `storageNamespace` atd.

## Publikování aktualizací na GitHub

Viz `scripts/sync-public.ps1` (lokální repo). Adresáře `docs/features/` a `scripts/` zůstávají
jen lokálně a na GitHub se nepublikují.
