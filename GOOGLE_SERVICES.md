# Google Services Integration

SankatBridge leverages **7 Google Cloud and Firebase services** to deliver a reliable, scalable, and intelligent emergency response platform.

## Services Overview

| # | Service | Purpose | File |
|---|---------|---------|------|
| 1 | Gemini API | Multimodal AI analysis | `src/services/gemini.ts` |
| 2 | Firebase Auth | Anonymous authentication | `src/services/firebase.ts` |
| 3 | Cloud Firestore | Real-time incident database | `src/services/firebase.ts`, `src/utils/firestore.ts` |
| 4 | Google Maps | Hospital location finder | `src/components/LiveMap.tsx` |
| 5 | Google Analytics | Usage event tracking | `index.html`, `src/utils/analytics.ts` |
| 6 | Google Fonts | Typography (Inter) | `index.html` |
| 7 | Cloud Run | Serverless deployment | `Dockerfile` |

### 1. Gemini API (Core AI Engine)
- **Model**: `gemini-2.5-flash` (multimodal)
- Processes text, audio (base64), and images (base64) simultaneously
- Returns structured JSON via `responseSchema` enforcement
- **File**: `src/services/gemini.ts`

### 2. Firebase Authentication
- `signInAnonymously()` for zero-friction emergency access
- Each report linked to authenticated `uid`
- **File**: `src/services/firebase.ts`

### 3. Cloud Firestore
- Collection: `incidents` with full structured data
- Real-time listeners via `onSnapshot`
- Security rules in `FIRESTORE_RULES.md` and `firestore.rules`
- **Files**: `src/services/firebase.ts`, `src/utils/firestore.ts`

### 4. Google Maps Platform
- Maps Embed API for nearest hospital display
- GPS-based location from browser Geolocation API
- **File**: `src/components/LiveMap.tsx`

### 5. Google Analytics (gtag.js)
- Events: `report_submitted`, `share_brief_clicked`, `first_aid_viewed`, `voice_input_used`, `photo_captured`
- **Files**: `index.html`, `src/utils/analytics.ts`

### 6. Google Fonts
- Inter font family for accessible typography
- **File**: `index.html`

### 7. Google Cloud Run
- Multi-stage Dockerfile (Node build + nginx serve)
- Port 8080, gzip, security headers, SPA routing
- **Files**: `Dockerfile`, `.dockerignore`
