# Firestore Security Rules

The following security rules are deployed to protect the `incidents` collection in Cloud Firestore. They enforce strict access control and data validation.

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Helper Functions
    function isAuthenticated() { return request.auth != null; }
    function isOwner() { return isAuthenticated() && request.auth.uid == resource.data.reporterId; }
    function uidUnchanged() { return !('reporterId' in request.resource.data) || request.resource.data.reporterId == request.auth.uid; }
    function uidNotModified() { return !('reporterId' in request.resource.data) || request.resource.data.reporterId == resource.data.reporterId; }
    function hasRequiredFields(fields) { return request.resource.data.keys().hasAll(fields); }
    function areImmutableFieldsUnchanged(fields) { return !request.resource.data.diff(resource.data).affectedKeys().hasAny(fields); }

    // Domain Validators
    function isValidIncident(data) {
      return hasRequiredFields(['reporterId', 'timestamp', 'coordinates', 'structuredData', 'status']) &&
             data.reporterId is string && data.reporterId.size() > 0 && data.reporterId.size() < 100 &&
             data.status is string && data.status.size() > 0 && data.status.size() < 50 &&
             data.structuredData is map &&
             (data.coordinates == null || (data.coordinates is map && 'lat' in data.coordinates && 'lng' in data.coordinates && data.coordinates.lat is number && data.coordinates.lng is number));
    }

    match /incidents/{incidentId} {
      // CREATE: Anyone authenticated can create, must set themselves as reporter
      allow create: if isAuthenticated() && isValidIncident(request.resource.data) && uidUnchanged();
      
      // READ: Only the reporter can read their own incidents
      allow read: if isOwner();
      
      // UPDATE: Only the reporter can update, cannot change reporterId or timestamp
      allow update: if isOwner() && isValidIncident(request.resource.data) && uidNotModified() && areImmutableFieldsUnchanged(['timestamp']);
                    
      // DELETE: Only the reporter can delete their own incidents
      allow delete: if isOwner();
    }
  }
}
```
