# Google Services Integration

1. **Google Gemini API**: Used for multimodal AI analysis of emergency situations, providing severity assessment and first aid instructions. Grounded with Google Search to verify first aid protocols.
2. **Firebase Authentication**: Uses anonymous authentication (`signInAnonymously`) to securely identify users without friction.
3. **Cloud Firestore**: Stores emergency reports securely in real-time.
4. **Google Maps Embed API**: Displays the nearest hospitals based on the user's geolocation.
5. **Google Analytics**: Tracks critical user interactions ('report_submitted', 'share_brief_clicked', 'first_aid_viewed', 'photo_captured', 'voice_recorded') using gtag.js.
