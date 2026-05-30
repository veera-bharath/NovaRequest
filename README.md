# ⚡ NovaRequest

NovaRequest is a lightweight, rapid developer API testing workbench built directly inside a Chrome Extension popup. Designed as a high-density, Monaco-themed, local-first alternative to heavy API clients, it provides standard developer-tools styling, responsive query structures, and asynchronous network operations.

---

## 🚀 Key Features

* **⚡ Persistent Background Execution (Safe Sandbox)**: 
  * Unlike standard extensions where closing the popup window immediately aborts active network calls, NovaRequest routes all HTTP dispatches through a persistent **Manifest V3 Background Service Worker**. 
  * Your long-running requests will continue executing in the background and return data safely to the UI when done.
  
* **💻 Monaco-themed Response Viewer**:
  * **Custom Syntax Highlighter**: Built a regular-expression tokenizer in React to syntax-highlight JSON keys (`rose-400`), strings (`emerald-400`), booleans/numbers (`violet-400`), and punctuation.
  * **Line-Numbered Editor**: Layout tracks margins line-by-line (`1`, `2`, `3`...) just like Monaco/VS Code.
  * **Visual Minimap**: An active vertical code minimap on the right margin of the editor pane representing line spacing.
  * **Diagnostic Metadata**: Round-trip timing calculations in milliseconds, payload size estimations (using content-length headers or Blob string byte analysis), and dedicated CORS/TLS troubleshooting modules.
  * **Tab Switch Grid**: Swaps between prettified body layouts and structured key-value response header tables.

* **⚙️ Unified Request Workbench (Tabs Layout)**:
  * Restyled into a single, high-density card container that dynamically renders active parameter editors:
    * **Params**: Parses URL query variables on mount and syncs grid changes back into the URL input in real-time.
    * **Headers**: Key-value metadata table with toggle switches to quickly enable/disable entries without deleting them, custom tooltips, trash row deletes, and grippy vertical drag handles.
    * **Body**: Monospace JSON editor with real-time try-parse validation checkers and standard double-space beautifiers.
    * **Auth**: Dedicated Bearer Token assistant that formats and injects `Authorization: Bearer <token>` entries directly into your headers state.
    * **Scripts**: Automation shell ready for future pre-request scripts and assertions.

* **📁 Local Request Library**:
  * Collapsible accordion drawer right above the bottom nav.
  * Instant search query bar: filter saved templates by Name, HTTP method, or URL segment.
  * Load-to-edit action: clicking any template imports its exact request parameters instantly and resets the workbench sheet.

* **🛠️ Advanced Developer Utilities**:
  * **Copy cURL**: Header bar features a quick "Copy Workbench Config as cURL" button to immediately copy your current request state as a standard cURL command with immediate success checkmark animation.
  * **Send Options**: Chevron Down split dropdown button enables copying as cURL or triggering *"Send & Download JSON"* to execute the request and download the response payload directly as a formatted JSON file.

* **🌗 Persisted Dark & Light Themes**:
  * Seamless visual transition between Chrome-like Charcoal Dark (`#1e1e1e`) and clean Zinc Light (`#f3f3f3`) modes, featuring a pure monochrome color scheme without noisy accent colors.
  * Selection state is written to **Chrome's storage database** to remember your theme selection across browser sessions.

---

## 🛠️ Technology Stack

* **Core**: React 19, TypeScript, Vite 8
* **Styling**: Tailwind CSS (v4 via `@tailwindcss/vite` high-performance generation compiler), Lucide React
* **State Management**: Zustand
* **API Client**: Axios (configured with asynchronous service-worker messaging)
* **Extension Platform**: Chrome Extension Manifest V3 (using `chrome.storage.local` and `chrome.runtime`)

---

## 📂 Codebase Directory

```
NovaRequest/
├── public/
│   ├── manifest.json            # Manifest V3 Extension configuration
│   └── favicon.svg              # Extension brand asset
├── src/
│   ├── api/
│   │   └── httpClient.ts        # Axios network core & stats tracker
│   ├── assets/
│   │   └── novarequest.png      # Extension brand logo
│   ├── background/
│   │   └── serviceWorker.ts     # Extension network request broker
│   ├── popup/
│   │   ├── components/
│   │   │   ├── RequestBuilder.tsx# HTTP method & URL controller
│   │   │   ├── ParamsEditor.tsx # Query parameter editor
│   │   │   ├── HeadersEditor.tsx# Dynamic header list editor
│   │   │   ├── BodyEditor.tsx   # JSON editor & syntax validator
│   │   │   ├── AuthEditor.tsx   # Bearer token assistant
│   │   │   ├── ResponseViewer.tsx# Beautiful Monaco-style JSON formatter
│   │   │   └── SavedRequests.tsx # Filterable storage manager
│   │   ├── App.tsx              # Main popup grid mount layout
│   │   └── main.tsx             # Popup entry script
│   ├── storage/
│   │   └── storageService.ts    # chrome.storage.local wrapper & localStorage fallback
│   ├── store/
│   │   └── useRequestStore.ts   # Zustand unified application state store
│   ├── types/
│   │   └── request.ts           # Standard TypeScript interfaces
│   └── index.css                # Global stylesheet with Tailwind CSS v4 imports
├── dist/                        # Compiled production bundle
├── vite.config.ts               # Multi-input Rollup compiler config
├── tsconfig.json                # TS Root configurations
└── package.json                 # Project dependencies & compile scripts
```

---

## 💻 Local Installation

To load the compiled extension unpacked in your browser:

### 1. Build the Extension
Ensure you have [Node.js](https://nodejs.org/) installed, clone this repository, and compile the production bundle:
```bash
# Install dependencies
npm install

# Compile TypeScript and bundle assets
npm run build
```
This produces a fully compiled, optimized `/dist` folder with the following bundle contents:
* `dist/manifest.json` (Copied extension registry)
* `dist/index.html` (Popup HTML)
* `dist/background.js` (Standalone, root-level background service worker)
* `dist/assets/` (Vite-hashed JS/CSS assets)

### 2. Add to Google Chrome
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Toggle the **Developer Mode** switch in the top-right corner.
3. Click the **Load unpacked** button in the top-left.
4. Browse and select the `/dist` directory inside the project workspace (`D:\Projects\NovaRequest\dist`).
5. Pin the **NovaRequest** icon to your Chrome toolbar, click it, and start testing!

---

## 🔒 Security & Privacy
* **Local First**: All saved requests, history templates, and authorization tokens remain strictly inside your browser environment (`chrome.storage.local`).
* **Zero Tracking**: NovaRequest does not make external connections except for the user-triggered API calls you formulate. There are no telemetry engines, tracking scripts, or analytical modules.
* **Minimal Permission Footprint**: Requests the standard `'storage'` privilege to save configuration data, and `host_permissions: ["<all_urls>"]` solely to bypass CORS blocks for your user-dispatched requests.
