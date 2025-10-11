# 🔥 Firebase Setup Guide - LoveLevel v1.1

> **Project:** LoveLevel Partner Sync  
> **Firebase Region:** europe-west1  
> **Auth Methods:** Email/Password, Google OAuth  
> **Storage Limit:** 10GB  
> **Max Sync Connections:** 10

---

## Phase 0: Firebase Project Initialization

### ✅ Step 1: Create Firebase Project (5 min)

1. Navigate to [Firebase Console](https://console.firebase.google.com)
2. Click **"Add project"** or **"Create a project"**
3. Enter project details:
   ```
   Project Name: lovelevel-sync
   Project ID: lovelevel-sync-{unique-id} (auto-generated)
   ```
4. **Disable Google Analytics** (optional for now, can enable later)
5. Click **"Create project"**
6. Wait for Firebase to provision resources (~30 seconds)
7. Click **"Continue"** when ready

---

### ✅ Step 2: Enable Authentication (5 min)

1. In Firebase Console, go to **Build → Authentication**
2. Click **"Get started"**
3. Go to **Sign-in method** tab
4. Enable **Email/Password**:
   - Toggle switch ON
   - ✅ Email/Password enabled
   - ❌ Email link (passwordless) disabled
   - Click **Save**

5. Enable **Google** OAuth:
   - Click on Google provider
   - Toggle switch ON
   - Enter **Project public-facing name**: `LoveLevel`
   - Enter **Support email**: `{your-email}@gmail.com`
   - Click **Save**

6. ✅ **Result**: Two sign-in methods active

---

### ✅ Step 3: Setup Firestore Database (5 min)

1. Go to **Build → Firestore Database**
2. Click **"Create database"**
3. Choose **Production mode** (we'll add custom rules)
4. Select location:
   ```
   Region: europe-west3 (Frankfurt) or nam5 (US)
   ```
   ⚠️ **Cannot be changed later!**
5. Click **Enable**
6. Wait for database provisioning (~30 seconds)

#### Initial Collections Structure
```
/users/{userId}
  - uid: string
  - email: string
  - displayName: string
  - photoURL: string
  - createdAt: timestamp
  - partnerConnections: array<string>

/partnerRequests/{requestId}
  - fromUserId: string
  - toUserId: string
  - status: "pending" | "accepted" | "declined"
  - createdAt: timestamp

/memories/{memoryId}
  - userId: string
  - title: string
  - description: string
  - photoURL: string
  - date: timestamp
  - sharedWith: array<string>

/stats/{userId}
  - totalMemories: number
  - totalConnections: number
  - lastActive: timestamp
```

---

### ✅ Step 4: Enable Storage (3 min)

1. Go to **Build → Storage**
2. Click **"Get started"**
3. Choose **Production mode**
4. Select same location as Firestore:
   ```
   Region: europe-west3 (Frankfurt)
   ```
5. Click **Done**

#### Storage Structure
```
/users/{userId}/profile/
  - avatar.jpg

/memories/{userId}/
  - {memoryId}.jpg
  - {memoryId}_thumb.jpg (optional)
```

---

### ✅ Step 5: Install Firebase SDK (5 min)

#### 5.1 Install Dependencies
```powershell
cd "d:\OMNI Tech Solutions\coupLOVE"
npm install firebase
```

#### 5.2 Get Firebase Config
1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll to **"Your apps"** section
3. Click **Web app icon** (`</>`)
4. Register app:
   ```
   App nickname: LoveLevel Web
   ✅ Also set up Firebase Hosting
   ```
5. Click **Register app**
6. Copy the Firebase configuration object:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "lovelevel-sync.firebaseapp.com",
  projectId: "lovelevel-sync",
  storageBucket: "lovelevel-sync.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

---

### ✅ Step 6: Configure Environment Variables (5 min)

#### 6.1 Create `.env.local` file
```bash
# In project root: d:\OMNI Tech Solutions\coupLOVE\.env.local
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=lovelevel-sync.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=lovelevel-sync
VITE_FIREBASE_STORAGE_BUCKET=lovelevel-sync.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

#### 6.2 Update `.gitignore`
Ensure `.env.local` is ignored:
```bash
# Environment variables
.env.local
.env.*.local
```

#### 6.3 Create `.env.example`
```bash
# Firebase Configuration (Copy to .env.local and fill with your values)
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

### ✅ Step 7: Setup Security Rules (10 min)

#### 7.1 Firestore Security Rules

1. Go to **Firestore Database → Rules** tab
2. Replace default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && isOwner(userId);
    }
    
    // Partner requests
    match /partnerRequests/{requestId} {
      allow read: if isAuthenticated() && (
        resource.data.fromUserId == request.auth.uid ||
        resource.data.toUserId == request.auth.uid
      );
      allow create: if isAuthenticated() && 
        request.resource.data.fromUserId == request.auth.uid;
      allow update: if isAuthenticated() && 
        resource.data.toUserId == request.auth.uid;
      allow delete: if isAuthenticated() && (
        resource.data.fromUserId == request.auth.uid ||
        resource.data.toUserId == request.auth.uid
      );
    }
    
    // Memories collection
    match /memories/{memoryId} {
      allow read: if isAuthenticated() && (
        resource.data.userId == request.auth.uid ||
        request.auth.uid in resource.data.sharedWith
      );
      allow create: if isAuthenticated() && 
        request.resource.data.userId == request.auth.uid;
      allow update, delete: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
    }
    
    // Stats collection
    match /stats/{userId} {
      allow read: if isAuthenticated() && isOwner(userId);
      allow write: if isAuthenticated() && isOwner(userId);
    }
  }
}
```

3. Click **Publish**

#### 7.2 Storage Security Rules

1. Go to **Storage → Rules** tab
2. Replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    function isImage() {
      return request.resource.contentType.matches('image/.*');
    }
    
    function isSizeValid() {
      return request.resource.size < 10 * 1024 * 1024; // 10MB
    }
    
    // User profile pictures
    match /users/{userId}/profile/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && isOwner(userId) && 
        isImage() && isSizeValid();
    }
    
    // User memories
    match /memories/{userId}/{memoryId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && isOwner(userId) && 
        isImage() && isSizeValid();
    }
  }
}
```

3. Click **Publish**

---

### ✅ Step 8: Test Connection (5 min)

#### 8.1 Create Firebase Config File

Create `src/lib/firebase.ts` with test connection code (will be provided in next step).

#### 8.2 Test Checklist
- [ ] Firebase initializes without errors
- [ ] Can create test user with email/password
- [ ] Can sign in with test credentials
- [ ] Can write to Firestore
- [ ] Can read from Firestore
- [ ] Can upload to Storage
- [ ] Can download from Storage

---

## 🎯 Configuration Variables

| Variable | Default Value | Can Change? |
|----------|---------------|-------------|
| Firebase Region | `europe-west3` | ❌ No (after creation) |
| Auth Methods | Email, Google | ✅ Yes (anytime) |
| Storage Limit | 10GB (Spark plan) | ✅ Yes (with upgrade) |
| Max Sync Connections | 10 per user | ✅ Yes (app logic) |
| Image Max Size | 10MB | ✅ Yes (rules) |

---

## 📊 Firebase Pricing (Spark Plan - Free Tier)

| Resource | Free Tier | Overage Cost |
|----------|-----------|--------------|
| **Firestore** | | |
| Stored data | 1 GB | $0.18/GB |
| Document reads | 50K/day | $0.06/100K |
| Document writes | 20K/day | $0.18/100K |
| **Storage** | 5 GB | $0.026/GB |
| Downloads | 1 GB/day | $0.12/GB |
| **Authentication** | Unlimited | Free |
| **Hosting** | 10 GB/month | $0.15/GB |

⚠️ **Recommendation**: Monitor usage in first month, upgrade to Blaze (pay-as-you-go) if approaching limits.

---

## 🔒 Security Best Practices

### ✅ DO:
- ✅ Keep `.env.local` in `.gitignore`
- ✅ Use server-side validation for critical operations
- ✅ Implement rate limiting for API calls
- ✅ Validate file types and sizes before upload
- ✅ Use HTTPS only (enforced by Firebase)
- ✅ Enable 2FA for Firebase Console access
- ✅ Regularly review Security Rules in Firebase Console

### ❌ DON'T:
- ❌ Commit API keys to Git
- ❌ Allow unauthenticated writes
- ❌ Trust client-side validation only
- ❌ Store sensitive data in Firestore without encryption
- ❌ Use `allow read, write: if true;` in production

---

## 🧪 Testing Strategy

### Unit Tests (Firebase Emulator)
```bash
npm install -D firebase-tools
firebase emulators:start
```

### Integration Tests
- Test auth flow (signup → signin → signout)
- Test Firestore CRUD operations
- Test Storage upload/download
- Test Security Rules violations

### Load Tests
- Simulate 10 concurrent users
- Test Firestore read/write limits
- Monitor response times

---

## 🚀 Next Steps After Setup

Once you complete **all 8 steps** above and confirm:

1. ✅ Firebase project created
2. ✅ Auth enabled (Email + Google)
3. ✅ Firestore database active
4. ✅ Storage configured
5. ✅ SDK installed (`npm install firebase`)
6. ✅ Environment variables in `.env.local`
7. ✅ Security Rules published
8. ✅ Test connection successful

**Reply with: "Firebase kurulumunu tamamladım"**

And I will immediately start:

```json
{
  "phase": "Sprint 1",
  "module": "C - Partner Sync",
  "duration": "5-7 days",
  "tasks": [
    "Firebase integration layer",
    "Authentication flow",
    "Partner request system",
    "Real-time sync listeners",
    "Connection management UI"
  ]
}
```

---

## 📞 Support

If you encounter issues during setup:
- Firebase Console: https://console.firebase.google.com
- Firebase Docs: https://firebase.google.com/docs
- Firebase Status: https://status.firebase.google.com

---

**Estimated Total Setup Time: 30-45 minutes**

🎯 **Your Action Now**: Follow steps 1-8, then type "Firebase kurulumunu tamamladım"
