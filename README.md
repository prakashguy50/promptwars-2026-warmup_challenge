# SankatBridge

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)

🚀 **Live Demo:** [https://sankatbridge-241761287718.us-west1.run.app](https://sankatbridge-241761287718.us-west1.run.app)

## The Problem
During an emergency, the "golden hour" is critical. Bystanders often panic, lack first aid knowledge, and struggle to relay accurate information to emergency services. This gap in immediate, structured response can cost lives.

## The Solution: SankatBridge
SankatBridge is an AI-powered emergency first-responder web application. It bridges the gap between a chaotic emergency scene and professional medical help by providing instant, structured guidance and seamless communication.

### How It Works
1. **Multimodal Input**: A bystander can quickly describe the emergency using text, voice recording, or by taking a photo of the scene.
2. **Gemini Analysis**: The Google Gemini API analyzes the multimodal input to instantly classify the incident type, assess severity, and extract critical context (like weapons or hazards).
3. **Structured Life-Saving Output**: The app immediately displays:
   - A color-coded severity badge.
   - Verified, step-by-step first aid instructions tailored to the specific emergency.
   - A live Google Map showing the nearest hospitals.
   - A pre-formatted "Share Brief" that can be instantly sent to emergency contacts or 108 via WhatsApp/SMS.

## Google Services Integrated
- **Gemini API**: Powers the core intelligence, analyzing multimodal inputs and generating structured emergency reports and first aid steps. Uses the `gemini-3-flash-preview` model with Google Search grounding.
- **Firebase Authentication**: Provides anonymous sign-in for quick reporting without friction, and Google Sign-In for future responder dashboards.
- **Cloud Firestore**: Stores emergency reports securely in real-time.
- **Google Maps Embed API**: Displays the nearest hospitals based on the user's geolocation.
- **Google Analytics**: Tracks critical user interactions (report submissions, first aid views) to improve the application.
- **Google Cloud Run**: The application is designed to be containerized and deployed seamlessly on Cloud Run.

## Features
- 🎙️ **Voice & Photo Input**: Large, accessible buttons for shaky hands.
- 🧠 **AI Triage**: Instant severity classification (1-5) and hazard detection.
- 🏥 **Nearest Hospitals**: Automatic geolocation and routing to nearby medical facilities.
- 📋 **Shareable Brief**: One-click generation of a concise emergency summary.
- 🛡️ **Offline/Graceful Degradation**: Handles missing API keys or denied permissions gracefully.

## Accessibility (WCAG 2.1 AA Compliant)
- **Skip-to-Content Link**: Allows keyboard users to bypass navigation.
- **ARIA Labels**: Comprehensive labeling on all interactive elements and dynamic regions (`aria-live="polite"`).
- **Focus Indicators**: High-visibility focus rings (`outline: 2px solid #6366f1`) for keyboard navigation.
- **High Contrast**: Dark theme designed for maximum readability in stressful situations (contrast ratio > 4.5:1).
- **Semantic HTML**: Proper use of `<main>`, `<section>`, `<header>`, and heading hierarchies.

## Security Practices
- **Input Sanitization**: All user text is sanitized to prevent Cross-Site Scripting (XSS).
- **Content-Security-Policy (CSP)**: Strict headers implemented to prevent unauthorized script execution.
- **Rate Limiting**: Built-in client-side rate limiting (10-second cooldown) to prevent API spam.
- **No Hardcoded Secrets**: All API keys are managed via environment variables.
- **Firestore Security Rules**: Strict rules ensuring users can only create and read their own reports (documented in `FIRESTORE_RULES.md`).

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons.
- **Backend/Services**: Firebase (Auth, Firestore), Google GenAI SDK.
- **Testing**: Vitest, c8 (Coverage).

## How to Run Tests
The project includes a comprehensive test suite (50+ tests) covering unit tests, integration tests, and edge cases.

```bash
# Run all tests
npm run test

# Run tests with coverage report
npm run test:coverage
```
