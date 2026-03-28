# SankatBridge Architecture

SankatBridge follows a clean, modular React architecture designed for maintainability, performance, and scalability.

## Directory Structure

```
/
├── public/               # Static assets and Service Worker for offline caching
├── src/                  # Application source code
│   ├── components/       # Reusable React components
│   │   ├── EmergencyInterface.tsx # Main input capture (voice, photo, text)
│   │   ├── IncidentCard.tsx       # Display of structured emergency data
│   │   └── LiveMap.tsx            # Google Maps integration for location
│   ├── hooks/            # Custom React hooks
│   │   └── useDebounce.ts         # Debounce hook for text input optimization
│   ├── services/         # External API integrations
│   │   ├── firebase.ts            # Firebase Auth & Firestore initialization
│   │   └── gemini.ts              # Gemini API multimodal analysis logic
│   ├── types/            # TypeScript interfaces and types
│   │   └── index.ts               # Centralized type definitions
│   ├── utils/            # Helper functions and utilities
│   │   ├── analytics.ts           # Google Analytics event tracking
│   │   ├── emergency.ts           # Formatting and severity color logic
│   │   ├── geolocation.ts         # Browser Geolocation API wrapper
│   │   ├── media.ts               # Image compression and base64 conversion
│   │   └── sanitize.ts            # XSS sanitization for user input
│   ├── App.tsx           # Main application state and routing logic
│   ├── main.tsx          # React DOM entry point
│   └── index.css         # Tailwind CSS global styles
├── .eslintrc.json        # Strict TypeScript linting rules
├── Dockerfile            # Cloud Run deployment configuration
├── firestore.rules       # Firebase security rules
└── package.json          # Dependencies and scripts
```

## Key Architectural Decisions

1. **Component Lazy Loading**: Heavy components like `IncidentCard` and `LiveMap` are dynamically imported using `React.lazy()` and `<Suspense>` to reduce the initial bundle size.
2. **Memoization**: Pure components are wrapped in `React.memo()` to prevent unnecessary re-renders.
3. **Strict Typing**: All data structures are strictly typed using TypeScript interfaces in `src/types/index.ts`.
4. **Separation of Concerns**: API logic (Gemini, Firebase) is completely decoupled from UI components, residing in the `services/` directory.
5. **Security First**: All user input is sanitized before processing, and Firestore rules enforce strict ownership-based access control.
