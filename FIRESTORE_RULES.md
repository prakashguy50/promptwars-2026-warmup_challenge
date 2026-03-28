# Firestore Security Rules Documentation

This document outlines the security rules for the SankatBridge application.

## Collections

### `incidents`
Stores emergency reports submitted by users.

#### Schema
- `reporterId` (string): The UID of the user who submitted the report.
- `timestamp` (timestamp): The time the report was submitted.
- `coordinates` (map): `lat` (number), `lng` (number).
- `structuredData` (map): The Gemini-analyzed emergency report.
- `status` (string): Current status of the incident (e.g., 'pending', 'resolved').

#### Rules
- **Create**: Allowed if the user is authenticated (`request.auth != null`) and `request.resource.data.reporterId == request.auth.uid`.
- **Read**: Allowed for the owner (`resource.data.reporterId == request.auth.uid`) or users with a specific responder role (e.g., `request.auth.token.role == 'responder'`).
- **Update**: Allowed for responders to update the `status` field. Owners cannot modify the report after submission.
- **Delete**: Denied for all users to maintain an audit trail.

## Example Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    match /incidents/{incidentId} {
      allow create: if isOwner(request.resource.data.reporterId);
      allow read: if isOwner(resource.data.reporterId) || (isAuthenticated() && request.auth.token.role == 'responder');
      allow update: if isAuthenticated() && request.auth.token.role == 'responder';
      allow delete: if false;
    }
  }
}
```
