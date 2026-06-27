# PrivacyShield AI 🛡️
### Next-Generation Privacy & Ad Blocking Browser Extension (Manifest V3)

[![Created with Antigravity](https://img.shields.io/badge/Created%20with-Antigravity-blueviolet)](https://github.com/google-deepmind)

PrivacyShield AI is an ultra-fast, security-first, and premium browser extension designed for all major Chromium-based browsers (Chrome, Edge, Brave, Opera, Arc, Vivaldi). Built entirely on modern React 18, TypeScript, Vite, and Tailwind CSS, it offers premium glassmorphism interfaces and high-performance ad/tracker interception using Chrome’s native `declarativeNetRequest` APIs.


---

## 📖 Table of Contents
1. [Core Features](#-core-features)
2. [Project Architecture](#-project-architecture)
3. [Deep-Dive Technical Implementation](#%EF%B8%8F-deep-dive-technical-implementation)
   - [Universal Ad Blocking & Skippers](#1-universal-ad-blocking--skippers)
   - [Dynamic Whitelist Rule Engine](#2-dynamic-whitelist-rule-engine)
   - [Advanced Anti-Fingerprinting Defense](#3-advanced-anti-fingerprinting-defense)
   - [Privacy & Cookie Cleaning](#4-privacy--cookie-cleaning)
   - [Live Statistics & Analytics Tracker](#5-live-statistics--analytics-tracker)
4. [File Structure Directory](#-file-structure-directory)
5. [Permissions & Manifest V3 Compliance](#-permissions--manifest-v3-compliance)
6. [Getting Started & Installation](#-getting-started--installation)
7. [Production Build & Chrome Web Store Submission](#-production-build--chrome-web-store-submission)
8. [Performance & Security Guarantees](#-performance--security-guarantees)

---

## ✨ Core Features

### 1. Universal Network Ad Blocking
Intercepts and blocks network requests targeting known advertisement servers, trackers, and analytics scripts.
- **Pre-configured DNR Lists:** EasyList, EasyPrivacy, and Fanboy's Social blocking rule mappings statically bundled inside JSON rulesets.
- **Extensive Coverage:** Blocks banner ads, popups, overlay scripts, tracking pixels, intersitial ads, and video ads.

### 2. Custom Video & Audio Skip Heuristics
Eliminates interruptions on top media platforms without breaking playback.
- **YouTube:** Automatically detects ad presence (`.ad-showing`), mutes the video, fast-forwards playback to `16x` speed, and triggers the "Skip Ad" click event instantly.
- **Spotify Web Player:** Real-time checking for audio ad overlays, automatically muting the browser volume slider during the advertisement duration and restoring it immediately when the track resumes.

### 3. Comprehensive Anti-Fingerprinting
Spoofs and adds random, imperceptible noise to browser signatures to stop trackers from rebuilding your digital identity.
- **Canvas Noise:** Modifies `getImageData` and `toDataURL` to return subtly noisy pixels.
- **WebGL Spoofing:** Overrides GPU vendor and renderer properties to Intel HD Graphics signatures.
- **AudioContext Defense:** Adds noise to frequency analyzer buffers.
- **Browser API Masking:** Spoofs CPU counts, device memory, media device labels, battery levels, WebRTC leak prevention (stripping STUN/TURN servers), and disables font enumeration.

### 4. Site Whitelists & Control Center
Granular control over where protections are active.
- **Whitelist/Blacklist Modes:** Allow ads on trusted creators or strictly block every resource on untrusted domains.
- **Timed Pause:** Temporarily pause protections for 5 minutes, 30 minutes, 1 hour, or 24 hours (automatically resumes via background alarms).

---

## 🏗️ Project Architecture

PrivacyShield AI separates concern layers strictly to adhere to Manifest V3 security, performance, and memory consumption standards:

```
                                    ┌───────────────────────┐
                                    │      Options UI       │
                                    │  - Dashboard charts   │
                                    │  - Settings sections  │
                                    │  - Whitelist manager  │
                                    └───────────┬───────────┘
                                                │
┌───────────────────────┐           ┌───────────▼───────────┐
│       Popup UI        │           │     React Hooks       │
│  - Radial score       ├──────────►│  - useSettings        │
│  - Quick controls     │           │  - useStats           │
│  - Whitelist toggles  │           │  - useTabInfo         │
└───────────────────────┘           └───────────┬───────────┘
                                                │
                                                ▼ chrome.runtime.sendMessage
┌───────────────────────────────────────────────────────────────────────────┐
│                        Background Service Worker                          │
│  - Manages chrome.storage.local sync (Settings, Whitelist, Stats)         │
│  - Dynamically registers priority-100 whitelist bypass DNR rules          │
│  - Rotates daily stats (bandwidth, ads blocked) via alarms                │
│  - Emits debounced notifications for critical events                      │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
                                      ▼ chrome.tabs (document_start)
┌───────────────────────────────────────────────────────────────────────────┐
│                             Content Scripts                               │
│  - Injects anti-fingerprint API overrides before page scripts run         │
│  - Runs CosmeticFilter (injects CSS blocking rules, MutationObserver)     │
│  - Polls YouTube/Spotify players for ad-skipping events                   │
│  - Sanitizes cookie writing APIs if third-party cleaning is enabled       │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Deep-Dive Technical Implementation

### 1. Universal Ad Blocking & Skippers
- **Cosmetic Hiding:** Content scripts compile and inject a global stylesheet containing `display: none !important;` for over 40 generic and platform-specific ad containers. A `MutationObserver` watches the document and automatically hides dynamically added ad placeholders.
- **YouTube skipper (`src/content/index.ts`):** 
  ```typescript
  const isAdActive = document.querySelector('.ad-showing, .ad-interrupting') || 
                     document.querySelector('.ytp-ad-player-overlay')
  if (isAdActive) {
    video.muted = true
    video.playbackRate = 16
    video.currentTime = video.duration - 0.1
  }
  ```

### 2. Dynamic Whitelist Rule Engine
Under Manifest V3, extensions can no longer modify web requests dynamically using blocking handlers. Instead, PrivacyShield AI leverages `chrome.declarativeNetRequest`:
- **Default Blocks:** Rules defined in `ad_rules.json`, `tracker_rules.json`, and `privacy_rules.json` block requests by default (low priority).
- **Dynamic Allowances:** When a user whitelists a site or pauses protection, the background script (`ruleEngine.ts`) registers dynamic rules with **Priority 100** and action `allow` for that specific `initiatorDomain`. This overrides the default blocking rules instantly.

### 3. Advanced Anti-Fingerprinting Defense
- **Canvas Noise injection (`src/content/antiFingerprint.ts`):**
  Intercepts standard canvas rendering and injects minor deviations into individual pixels to change the hash value of the canvas render.
  ```typescript
  for (let i = 0; i < imageData.data.length; i += 4) {
    if (Math.random() < 0.05) {
      imageData.data[i] = Math.min(255, Math.max(0, imageData.data[i] + (Math.random() > 0.5 ? 1 : -1)))
    }
  }
  ```
- **WebRTC Protection:** Replaces `window.RTCPeerConnection` with a modified constructor that strips the `iceServers` configuration. This prevents websites from fetching the client's local IP address behind VPNs.

### 4. Privacy & Cookie Cleaning
- **Storage Cleaning:** Integrates with `chrome.browsingData` to clean cookies, cache, localStorage, sessionStorage, and IndexedDB data.
- **Scheduled Cleaning:** Registers a `chrome.alarms` listener that runs in the background and clears data at set intervals (e.g., hourly).

### 5. Live Statistics & Analytics Tracker
- Calculates cumulative metrics:
  - **Bandwidth Saved:** Estimating 150KB per ad blocked and 50KB per tracker blocked.
  - **Time Saved:** Estimating 200ms of loading time saved per blocked ad.
- Restructures statistics on day boundaries, automatically archiving daily data to a rolling 7-day and 30-day statistics window for dashboard visualization.

---

## 📁 File Structure Directory

```
privacyshield-ai/
├── manifest.json              # MV3 configuration with permission declarations
├── vite.config.ts             # Vite 8 + crxjs build configuration
├── tailwind.config.js         # Design tokens & color system
├── tsconfig.json              # TypeScript compilation rules
├── options/                   # Options/Dashboard Main UI
│   ├── index.html             # Options page DOM mount
│   ├── main.tsx               # Options entrypoint
│   └── App.tsx                # Page controller & sidebar layout
├── popup/                     # Toolbar Popup UI
│   ├── index.html             # Popup DOM mount
│   ├── main.tsx               # Popup entrypoint
│   └── App.tsx                # Status toggles, stats, pause menus
├── public/                    # Static Assets
│   ├── icons/                 # Extension icons (16, 32, 48, 128)
│   └── rules/                 # declarativeNetRequest JSON rule sets
│       ├── ad_rules.json      # Main ad server rules
│       ├── tracker_rules.json # Analytics & tracking scripts rules
│       └── privacy_rules.json # Data brokers & pixel block rules
└── src/                       # Extension Core Source Code
    ├── background/            # Background Service Worker
    │   ├── worker.ts          # Main background script coordinator
    │   ├── ruleEngine.ts      # Whitelist, dynamic allow rules, pause logic
    │   ├── statsTracker.ts    # Rolling stats calculator
    │   └── notifications.ts   # Rate-limited Chrome notifications emitter
    ├── content/               # Web Page Sandbox Scripts
    │   ├── index.ts           # Bootstrapper, YouTube/Spotify skippers
    │   ├── antiFingerprint.ts # Spoofers (WebGL, Canvas, WebRTC, Audio)
    │   ├── cosmeticFilter.ts  # Element-hiding rules, observers
    │   └── cookieCleaner.ts   # Cookie interception hook
    ├── components/ui/         # Shared Glassmorphism Components
    │   ├── Button.tsx         # Custom buttons
    │   ├── Card.tsx           # Glass panels
    │   ├── Switch.tsx         # Smooth toggle switches
    │   ├── Badge.tsx          # Status indicators
    │   ├── Tabs.tsx           # Navigation menus
    │   └── Chart.tsx          # SVG analytics charts
    ├── pages/                 # Full Dashboard UI Panels
    │   ├── Dashboard.tsx      # Stats visualization & radial gauge
    │   ├── SettingsPage.tsx   # Granular settings selectors
    │   ├── WhitelistPage.tsx  # Interactive Whitelist/Blacklist management
    │   └── AboutPage.tsx      # Extension credits & info
    ├── hooks/                 # Chrome Storage React Bindings
    │   ├── useSettings.ts     # Settings hook (automatic local sync)
    │   ├── useStats.ts        # Polled stats data hook
    │   └── useTabInfo.ts      # Current active tab states
    └── utils/
        └── cn.ts              # Tailwind CSS class merger utility
```

---

## 🔒 Permissions & Manifest V3 Compliance

PrivacyShield AI strictly adheres to the Chrome Web Store security requirements. The extension uses the minimum possible permission set, operates without **any remote code execution**, and implements static rule sets for high efficiency:

| Permission | Rationale |
|---|---|
| `declarativeNetRequest` | Intercepts and blocks network connections on browser-level. |
| `declarativeNetRequestFeedback` | Logs blocked request metadata internally for dashboard analytics. |
| `storage` | Preserves whitelist entries, settings parameters, and cumulative statistics. |
| `tabs` / `activeTab` | Determines the host domain of the active tab to manage whitelist status. |
| `scripting` | Dynamically executes element hiding and anti-fingerprint content scripts. |
| `notifications` | Emits warnings (e.g. dangerous trackers, milestone achievements). |
| `alarms` | Schedules background cleanup tasks and rotates daily stats. |
| `cookies` / `browsingData` | Implements automated cookie and storage cleaning operations. |
| `webNavigation` | Triggers protection initialization during initial frame navigation. |

---

## 🚀 Getting Started & Installation

### Easiest Method (For Non-Technical Users)

You can load the extension directly using the pre-packaged zip file without needing any code tools or terminal commands:

1. Locate the **`privacyshield-ai.zip`** file in the root of the project directory.
2. Extract (unzip) it to a folder on your computer (e.g., your Desktop or Documents).
3. Open Google Chrome and navigate to `chrome://extensions/`.
4. Turn **ON** the **Developer mode** toggle in the top-right corner.
5. Click the **Load unpacked** button in the top-left corner and select the extracted folder.

---

### Developer Method (Build from Source)

### 1. Clone the project and install dependencies
Make sure you have Node.js (v18+) and npm installed on your machine.
```bash
npm install
```

### 2. Start the development server (with HMR)
Runs the project in development mode. The build folder is automatically compiled and updated when changes are made.
```bash
npm run dev
```

### 3. Generate production build
Bundles the code, minifies assets via default OXC minifiers, and formats files.
```bash
npm run build
```

### 4. Load the extension in Chrome / Chromium
1. Open Chrome and head to `chrome://extensions/`.
2. Toggle the **Developer mode** switch at the top-right corner.
3. Click the **Load unpacked** button at the top-left.
4. Select the `dist/` directory inside your project folder.
5. The extension logo will appear in your extensions list and is ready to use!

---

## 📦 Production Build & Chrome Web Store Submission

### 1. Build for Distribution
You can create a production-ready `.zip` file of the compiled code directly with:
```bash
npm run build:zip
```
This script runs the TypeScript compilation, builds the static assets, minifies files, and compresses the contents of the `dist/` folder into `privacyshield-ai.zip` inside the root directory.

### 2. Chrome Web Store Upload Steps
1. Navigate to the [Chrome Web Store Developer Console](https://chrome.google.com/webstore/devconsole/).
2. Log in with your developer account and click **Create new item** or **Add new item**.
3. Upload `privacyshield-ai.zip`.
4. Fill in the required metadata:
   - **Title:** PrivacyShield AI
   - **Description:** A premium, Next-Gen privacy tool & ad blocker.
   - **Icon:** Upload `public/icons/icon128.png`.
5. Under **Privacy Practices**, declare the permissions used (e.g. explain that `declarativeNetRequest` is used to block ads locally).
6. Submit for review!

---

## 🛡️ Performance & Security Guarantees

- **No Remote Rules:** All ad-blocking rules are stored locally. The extension never requests external text files or updates rules dynamically from untrusted servers, preventing Man-in-the-Middle injection attacks.
- **Zero Performance Lag:** Interception is handled entirely at the C++ layer of Chrome using the browser’s `declarativeNetRequest` engine, preventing Javascript execution delays during page loads.
- **Strict Content Security Policy:** Extension pages specify a strict `script-src 'self'` policy. Injected scripts do not have access to execution context outside their sandboxes.
