# 🗳️ Indian Election Simulator

> **An immersive, AI-powered, comic-style civic education simulator** that demystifies Indian Democracy — playable in your browser, powered by Gemini AI.

🔗 **Live Demo:** [Indian Election Simulator](https://election-simulator-393226308231.asia-south1.run.app)

---

## 🎯 The Problem We Solve

Democracy is too often taught through dry textbooks. Citizens remain confused about the actual mechanics of how elections work, what their rights are, and what officials actually do. This project **gamifies civic education** — putting users directly into the shoes of democratic stakeholders, teaching ECI procedures through consequence-driven storytelling rather than passive reading.

---

## ✨ Features

### 🤖 AI-Powered Dynamic Content
- **Gemini 2.5 Flash** generates unique, educational scenario choices in bulk for every playthrough
- Structured output via Gemini's **`responseSchema` API** ensures perfectly formatted JSON every time
- "Did You Know?" facts are AI-generated and displayed in the contextual information panel
- Choices are **randomized in position** — the correct answer is never always the first option

### 🗳️ 5 Election Types × 4 Roles
| Election | Roles Available |
|----------|----------------|
| Lok Sabha (General Election) | Voter, Candidate, Official, Observer |
| Vidhan Sabha (State Assembly) | Voter, Candidate, Official, Observer |
| Rajya Sabha (Upper House) | Voter, Candidate, Official, Observer |
| Presidential Election | Observer (Special) |
| Prime Minister | Observer (Special) |

### 🏗️ Architecture
- **Vanilla ES6** — No heavy frameworks. Pure modular JavaScript for maximum efficiency
- **Firebase Firestore** — All story data served from cloud DB, zero local JSON files
- **Nginx Reverse Proxy** — Gemini API key is never exposed to the client
- **Docker + Cloud Run** — Fully containerized, auto-scaled serverless deployment
- **DOMPurify** — All dynamic HTML is sanitized before injection (XSS-proof)

---

## 🔐 Security

| Layer | Implementation |
|-------|----------------|
| API Key Protection | Gemini API key injected server-side via Nginx proxy; never sent to client |
| XSS Prevention | All `innerHTML` writes sanitized with DOMPurify |
| Content Security Policy | Strict `script-src` without `unsafe-inline` or `unsafe-eval` |
| Transport Security | HSTS header with 1-year max-age |
| Clickjacking | `X-Frame-Options: SAMEORIGIN` |
| MIME Sniffing | `X-Content-Type-Options: nosniff` |
| Permissions Policy | Camera, microphone, geolocation, payment all blocked |
| Firebase Rules | Firestore: `read: if true`, `write: if false` — public read, no write |

---

## ♿ Accessibility (WCAG AA)

- Semantic HTML5 landmarks (`<main>`, `role="dialog"`, `role="complementary"`)
- All images have descriptive `alt` text
- All modal dialogs have `aria-modal`, `aria-labelledby`
- Keyboard navigation: number keys `1–4` select choices, `Enter` continues
- `:focus-visible` outlines on every interactive element
- Screen-reader utility class (`.sr-only`) for visually-hidden accessible labels
- `lang="en"` on `<html>` root

---

## 🧪 Tests

**29 passing unit tests** across 7 test suites using **Jest**:

```
✓ State Management       (5 tests) — initial state, setState merging, scene navigation
✓ Choice Logic           (5 tests) — one correct answer, feedback on all choices
✓ Scene Data Validation  (5 tests) — required fields, 4 choices, valid visual types
✓ TypeWriter Logic       (2 tests) — character write, instant skip
✓ XSS Security           (3 tests) — DOMPurify stripping, safe HTML preservation
✓ Election Data          (6 tests) — required fields, directRole logic, roles structure
✓ Story Cache            (3 tests) — cache miss/hit, independent election keys

Tests: 29 passed, 29 total
```

Run tests:
```bash
npm test
npm run test:coverage
```

---

## 🚀 Local Development

```bash
# Serve the app locally (no build step needed)
python3 -m http.server 8080
# Then open http://localhost:8080
```

> **Note:** The Gemini AI feature requires the app to be deployed on Cloud Run (the proxy is Nginx-only). Locally, the simulator will use fallback data from Firestore.

---

## 🐳 Docker / Cloud Run Deployment

```bash
# Build
docker build -t election-simulator .

# Deploy to Cloud Run (with API key)
gcloud run deploy election-simulator \
  --source . \
  --region asia-south1 \
  --set-env-vars GEMINI_API_KEY=YOUR_KEY_HERE \
  --allow-unauthenticated
```

---

## 📁 Project Structure

```
/
├── index.html              # Entry point — semantic HTML, CSP meta, OG tags
├── Dockerfile              # Production container (nginx:alpine)
├── nginx.conf.template     # Security headers + Gemini API reverse proxy
├── js/
│   ├── app.js              # Core simulator engine (state, events, lifecycle)
│   ├── ui.js               # UI rendering mixin (all screens + scene layout)
│   ├── services.js         # Firebase Firestore + Gemini API service layer
│   ├── audio.js            # Web Audio API synth (zero dependencies)
│   └── analytics.js        # Google Analytics 4 (external, deferred)
├── css/
│   ├── style.css           # CSS entry point (@imports)
│   ├── variables.css       # Design tokens, root layout, accessibility utils
│   ├── menu.css            # Start / election / role selection screens
│   ├── scene.css           # Simulation scene grid layout
│   ├── cards.css           # Visual data cards (info, stat, timeline, etc.)
│   └── feedback.css        # Choice overlay + feedback panel + end screen
├── assets/                 # Character sprites, prop images, favicon
└── tests/
    └── simulation.test.js  # 29-test Jest suite
```

---

## 🤔 Assumptions Made

- **Modern Browser:** Requires ES6 Modules, CSS Grid, and Web Audio API support
- **Firebase Public Key:** Firebase API keys are intentionally public-safe; security is enforced via Firestore Security Rules and authorized domain restrictions
- **Educational Simplification:** Storylines are based on real ECI protocols but simplified for narrative accessibility

---

## 🏷️ Tags

`civic-tech` · `edtech` · `gemini-ai` · `india` · `election` · `simulator` · `firebase` · `cloud-run` · `vanilla-js` · `accessibility`
