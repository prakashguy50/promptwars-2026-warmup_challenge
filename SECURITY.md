# Security Policy

## Reporting Vulnerabilities

If you discover a security vulnerability, please report it responsibly by opening a private issue or contacting the maintainer directly.

## Security Practices Implemented

### Input Validation & Sanitization
- All user inputs are validated and sanitized via `src/utils/sanitize.ts` before processing
- HTML special characters are escaped to prevent XSS attacks
- Input length is validated to prevent payload abuse
- All text is sanitized before sending to Gemini API and Firestore

### Cross-Site Scripting (XSS) Prevention
- User-generated content is sanitized using `sanitizeInput()` before DOM insertion
- `innerHTML` is never used with unsanitized user data
- Content-Security-Policy headers restrict script and resource loading

### Content Security Policy
- Strict CSP meta tag implemented in `index.html`
- Script sources limited to same-origin and trusted Google CDNs
- Frame sources restricted to Google Maps embeds only
- Connect sources limited to Firebase and Gemini API endpoints

### Authentication & Session Management
- Firebase Anonymous Authentication via `signInAnonymously()`
- Each report linked to authenticated user ID for accountability
- Session tokens managed securely by Firebase SDK

### Data Protection
- No API keys or secrets hardcoded in source code
- All sensitive configuration loaded via environment variables
- `.env` files excluded from version control via `.gitignore`
- Sensitive data stripped from user-visible error messages

### Rate Limiting
- 10-second client-side cooldown enforced after each report submission
- Prevents abuse and spam of the Gemini API and Firestore

### Security Headers
- `X-Content-Type-Options: nosniff` prevents MIME-type sniffing
- `X-Frame-Options: DENY` prevents clickjacking attacks
- `Content-Security-Policy` restricts resource loading origins

### Dependencies
- Minimal dependency footprint to reduce attack surface
- `package-lock.json` committed for reproducible, auditable builds
