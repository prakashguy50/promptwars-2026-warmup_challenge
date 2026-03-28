# Google Services Integration

SankatBridge leverages multiple Google Cloud and Firebase services to provide a robust, scalable, and secure emergency response platform.

## 1. Gemini API (Multimodal Analysis)
The Gemini API (`gemini-3.1-flash-preview`) is the core intelligence engine of SankatBridge. It processes multimodal inputs (text, audio, and images) simultaneously to extract critical structured data like incident type, severity, and casualties. It also utilizes Google Search Grounding to verify and provide the most up-to-date first aid instructions.

## 2. Firebase Authentication (Anonymous)
Firebase Authentication is used to instantly authenticate users via `signInAnonymously()`. This ensures that bystanders can report emergencies immediately without the friction of creating an account, while still providing a secure, unique `userId` to track and protect their submitted reports.

## 3. Cloud Firestore (Incident Storage)
Cloud Firestore acts as the real-time, NoSQL database for storing emergency reports. Every incident is securely written to the `incidents` collection with strict security rules that ensure users can only read and update their own submissions, protecting sensitive emergency data.

## 4. Google Maps (Location Services)
Google Maps (via the browser's Geolocation API and potential future Maps JavaScript API integration) is used to pinpoint the exact coordinates of the emergency. This location data is crucial for dispatching the correct services and is displayed on the `LiveMap` component.

## 5. Google Analytics (Usage Tracking)
Google Analytics (`gtag.js`) is integrated to track critical user interactions and application performance. Events such as `report_submitted`, `share_brief_clicked`, and `first_aid_viewed` are fired to help understand how the application is used during high-stress situations, enabling future UX improvements.

## 6. Cloud Run (Deployment)
The application is designed to be containerized and deployed on Google Cloud Run. This serverless environment ensures that the application can scale automatically from zero to handle massive spikes in traffic during widespread emergencies, while maintaining high availability and security.
