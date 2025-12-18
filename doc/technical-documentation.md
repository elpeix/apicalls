# Technical Documentation for API Calls

## Project Overview

API Calls is an Electron-based desktop application designed to build, execute,
and analyse HTTP requests. The project combines an Electron main process
written in TypeScript with a modern React interface bundled via electron-vite.
The application prioritises data separation by workspace, local persistence
through electron-store, and a broad feature set for managing tabs, collections,
environments, cookies, and history.

## Technology Stack

- Electron 39 with context isolation and a custom preload
  (`src/preload/index.ts`).
- React 19 with TypeScript 5 and Vite 7 (`src/renderer/src`).
- electron-vite for unified development and build workflows (`npm run dev` /
  `npm run build`).
- electron-builder to generate packages for Linux (AppImage, deb), macOS (dmg,
  zip), and Windows (NSIS) (`electron-builder.yml`).
- Undici to perform HTTP requests (`src/lib/restCaller.ts`).
- electron-store for local persistence (`src/lib/appStore.ts`).
- @monaco-editor/react for the editor and react-resizable-panels for the
  layout.

## Folder Structure

- `src/main`: main process (window, IPC, menu, auto updates, migrations).
- `src/preload`: secure bridge that exposes APIs to the renderer window.
- `src/renderer/src`: React application (global context, components, hooks,
  assets).
- `src/lib`: shared logic (stores, IPC channels, importers, HTTP utilities,
  migrations).
- `doc`: project documentation (technical and usage guides).
- `test`: Vitest unit tests organised per domain (collections, renderer, etc.).

## Main Process (`src/main`)

- **Initialisation** (`index.ts`): creates the primary window with
  platform-specific title bar settings, loads the renderer (dev URL or bundled
  HTML), and tracks full-screen/maximised state through `WINDOW_ACTIONS`
  channels.
- **Menu and accelerators** (`menu.ts`, `shortcutActions.ts`): define the
  cross-platform menu and keyboard shortcuts. Menu items emit IPC events such as
  `ACTIONS.sendRequest` or `ACTIONS.toggleSidebar`. Shortcuts are captured via
  `before-input-event` for consistent behaviour.
- **IPC and HTTP requests** (`ipcActions.ts`): listens to `REQUEST.*` channels,
  validates identifiers, invokes `restCall`, and responds to the renderer with
  `REQUEST.response` or `REQUEST.failure`. Maintains a request map to handle
  cancellations (`restCancel`).
- **Configuration and persistence**: uses `StorerFactory` to create dedicated
  electron-store instances for the app, settings, and workspaces
  (`src/lib/appStore.ts`). Menu toggles and other preferences are applied in real
  time to the `BrowserWindow`.
- **Workspaces**: the global `Workspaces` instance in `index.ts` handles
  creation, selection, duplication, removal, and synchronisation of workspaces,
  each backed by its own electron-store file (`src/lib/Workspaces.ts`).
- **Auto updates** (`autoUpdate.ts`): integrates electron-updater for macOS and
  Windows. Shares status updates (available, downloading, downloaded, not
  available, error) with the renderer via `AUTO_UPDATE` and supports manual
  checks.
- **Themes** (`themes.ts`): syncs bundled themes with the user directory and
  exposes the list through `SETTINGS.listThemes`.
- **Migrations and versions** (`versionDetector.ts`, `migrations.ts`): detects
  version changes, runs registered migrations in `src/main/migrations`, and
  persists the current version under `userData`.

## Preload (`src/preload/index.ts`)

- Exposes `window.electron` (electron-toolkit) and `window.api.os` with
  platform and architecture metadata.
- Keeps context isolation enabled and surface errors coming from the bridge.

## Renderer (`src/renderer/src`)

- **Entry point** (`main.tsx`): boots React strict mode and renders `App`.
- **Global context** (`context/AppContext.tsx`): aggregates all domain hooks
  (tabs, collections, environments, history, cookies, workspaces, settings) and
  manages common dialogues (alerts, prompts, confirms, About modal) and
  notifications. Subscribes to IPC channels declared in `src/lib/ipcChannels.ts`.
- **Domain hooks**: encapsulate state and IPC orchestration.
  - `useTabs` handles tabs, recently closed history, and synchronisation with
    collections.
  - `useCollections`, `useEnvironments`, `useCookies`, `useHistory`,
    `useWorkspaces` provide CRUD operations, synchronisation, and domain-specific
    helpers.
  - `useSettings` and `useMenu` manage view preferences (horizontal/vertical
    layout, menu visibility, custom window mode).
- **Layout** (`components/layout/Layout.tsx`): combines
  `react-resizable-panels` with the side menu, contextual panel, and the tab
  workspace (`ContentTabs`). Manages expand/collapse based on global state and
  listens to commands like `ACTIONS.findRequest`.
- **Request editor**: components under `components/editor`,
  `components/Request`, and `components/Response` define HTTP method, URL,
  headers, body (JSON/YAML, forms), query parameters, authentication, and console
  output.
- **Collections and environments**: components inside `components/sidebar`
  enable folder management, pre-request scripts, environment links, and
  searching.
- **History and console**: history keeps up to `maxHistory` entries and the
  console surfaces request/response logs using `react-tabs`.
- **Theme and appearance**: conditional classes align with `windowMode` (custom
  vs native title bar) and support dark/light/system modes aligned with
  `nativeTheme`. Preferences are propagated through `SETTINGS.updated`.

## Persistence and Data

- **electron-store instances**: each workspace stores `tabs`, `environments`,
  `collections`, and `cookies` in separate files. The root `app.json` tracks the
  workspace list and selection, while `settings.json` stores global preferences.
- **Default limits**: `defaultSettings` defines values such as `timeout` (30
  seconds), `maxHistory` (100), `manageCookies`, `requestView`,
  `rejectUnauthorized`, and so on (`src/lib/defaults.ts`).
- **Data handling**: helpers manage collection import/export (Postman v2,
  OpenAPI, YAML) and transform structures into files
  (`src/lib/CollectionImporter.ts`, `Parser*`).

## HTTP Request Flow

1. The renderer sends `REQUEST.call` with a complete `CallRequest` (method,
   URL, headers, body).
2. The main process creates an `AbortController`, configures an Undici `Agent`
   according to settings (`followRequestRedirect`, `timeout`,
   `rejectUnauthorized`), and performs the call.
3. Responses return to the renderer via `REQUEST.response-<id>` including
   timing metrics (`responseTime`) and normalised headers. Errors throw a
   `RestCallerError` with detailed diagnostics (`src/lib/RestCallerError.ts`).
4. Cancellations are handled through `REQUEST.cancel` and
   `AbortController.abort()`.

## Key IPC Channels

- `REQUEST.*` to execute or cancel HTTP requests.
- `TABS.*` to load and persist active tabs.
- `COLLECTIONS.*`, `ENVIRONMENTS.*`, `COOKIES.*` to sync data across processes.
- `WORKSPACES.*` to manage workspaces and propagate errors.
- `SETTINGS.*`, `WINDOW_ACTIONS.*`, `SYSTEM_ACTIONS.systemThemeChanged` for
  window control and preferences.
- `AUTO_UPDATE.*` for download/installation status notifications.

## Scripts and Pipelines

- `npm run dev`: starts development with hot reload (renderer + main) and opens
  DevTools when F12 is pressed.
- `npm run build`: produces the `dist/` output for electron-builder.
- `npm run build:<platform>`: builds and packages for a specific platform.
- `npm run lint`, `npm run format`: enforce code style (ESLint + Prettier)
  configured in `eslint.config.mjs`.
- `npm run test`, `npm run coverage`: run Vitest (tests located under `test/`).

## Packaging and Distribution

- Configuration in `electron-builder.yml` enables `asar` and bundles assets
  from `build/` while excluding development-only folders (`src`, `.vscode`,
  `.env`, ...).
- Releases are published through GitHub Releases with `v`-prefixed tags
  (`v1.2.3`).
- macOS entitlements are defined in `build/entitlements.mac.plist`; the app
  requests access to Documents and Downloads to import/export collections.

## Quality and Testing

- Unit and component tests live under `test/`, grouped by domain. Examples
  include collection factories, tab transformations, and renderer utilities.
- Optional coverage reports via `npm run coverage`. Tests often rely on mocks
  for `electron` and other globals.

## Best Practices and Key Points

- Keep IPC channels centralised in `src/lib/ipcChannels.ts` to avoid
  duplication.
- Use `StorerFactory` when creating new persistent stores to prevent name
  collisions.
- Register migrations in `src/main/migrations/migrationsImporter.ts` and pick a
  `getMinVersion()` that matches the change.
- Add new shortcuts through `registerShortcuts` to retain macOS/Windows/Linux
  compatibility.
- For platform-dependent functionality, rely on `window.api.os` in the renderer
  or `process.platform` in the main process.
