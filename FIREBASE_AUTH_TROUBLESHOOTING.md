# 🔍 Firebase Auth Troubleshooting - LoveLevel

**Project ID:** `lovelevel-7dadc`  
**Auth Domain:** `lovelevel-7dadc.firebaseapp.com`  
**Date:** 2025-10-29

---

## ✅ Step 1: Verify Firebase Console Settings

### 1.1 Open Firebase Console
🔗 **Direct Link:** https://console.firebase.google.com/project/lovelevel-7dadc/authentication/providers

### 1.2 Check Email/Password Provider
- [ ] Go to **Authentication → Sign-in method**
- [ ] Find **Email/Password** in the list
- [ ] Verify it shows **"Enabled"** status (green checkmark)
- [ ] If disabled: Click on it → Toggle ON → Save

### 1.3 Check Google OAuth Provider
- [ ] In the same **Sign-in method** tab
- [ ] Find **Google** in the list
- [ ] Verify it shows **"Enabled"** status
- [ ] If disabled: Click on it → Toggle ON → Fill support email → Save
- [ ] Check that **Web client ID** is configured

### 1.4 Check Authorized Domains
- [ ] Scroll down to **Authorized domains** section
- [ ] Verify these domains are present:
  ```
  ✅ localhost
  ✅ lovelevel-7dadc.firebaseapp.com
  ✅ Your Netlify domain (if deployed)
  ```
- [ ] If `localhost` is missing:
  - Click **Add domain**
  - Enter: `localhost`
  - Click **Add**

---

## 🧪 Step 2: Test Authentication in Browser

### 2.1 Open Diagnostic Tool
1. Open browser dev tools (F12)
2. Navigate to: http://localhost:5174/firebase-test.html
3. Check console for any errors

### 2.2 Test Email/Password Signup
1. Click **"Test Email/Password Signup"**
2. Check console output
3. **Expected:** "✅ Signup successful"
4. **If error:** Copy the exact error message

### 2.3 Test Email/Password Login
1. Click **"Test Email/Password Login"**
2. Check console output
3. **Expected:** "✅ Login successful"
4. **If error:** Copy the exact error message

### 2.4 Test Google OAuth
1. Click **"Test Google OAuth"**
2. Browser should redirect to Google
3. Select account
4. Browser redirects back
5. **Expected:** "✅ Google OAuth successful"
6. **If error:** Check console for error code

---

## 🔍 Common Errors & Solutions

### Error: "auth/operation-not-allowed"
**Cause:** Email/Password or Google provider not enabled in Firebase Console  
**Fix:**
1. Go to Firebase Console → Authentication → Sign-in method
2. Enable the provider that's showing the error
3. Click Save

### Error: "auth/unauthorized-domain"
**Cause:** Current domain not in Authorized domains list  
**Fix:**
1. Go to Firebase Console → Authentication → Settings → Authorized domains
2. Add `localhost` (for local dev)
3. Add your Netlify/production domain

### Error: "auth/popup-blocked"
**Cause:** Browser blocked popup for Google OAuth  
**Fix:**
- We're using redirect instead of popup
- Clear browser cache
- Try in incognito mode

### Error: "auth/network-request-failed"
**Cause:** Network connectivity or CORS issue  
**Fix:**
1. Check internet connection
2. Disable VPN if active
3. Check browser console for CORS errors
4. Verify Firebase config in `.env.local` is correct

### Error: "auth/user-not-found" or "auth/wrong-password"
**Cause:** Credentials don't match any existing user  
**Fix:**
1. Go to Firebase Console → Authentication → Users
2. Check if user exists
3. If not, sign up first
4. If exists but can't login, reset password

### Error: "auth/invalid-api-key"
**Cause:** API key in `.env.local` is incorrect  
**Fix:**
1. Go to Firebase Console → Project Settings → General
2. Scroll to "Your apps" → Web apps
3. Copy the correct API key
4. Update `VITE_FIREBASE_API_KEY` in `.env.local`
5. Restart dev server

---

## 🎯 Quick Diagnostic Commands

### Check if Firebase is initialized
```javascript
// In browser console on http://localhost:5174
window.testFirebase()
```

### Check current user
```javascript
// In browser console
firebase.auth().currentUser
```

### Check auth state
```javascript
// In browser console
firebase.auth().onAuthStateChanged(user => console.log('User:', user))
```

---

## 📋 Information to Collect

If still failing, collect this info:

1. **Firebase Console Screenshot:**
   - Authentication → Sign-in method page
   - Show enabled providers

2. **Browser Console Errors:**
   - Full error message
   - Error code (e.g., `auth/operation-not-allowed`)

3. **Network Tab:**
   - Failed requests to Firebase
   - Status codes

4. **Environment:**
   - Browser version
   - OS
   - Dev server URL

---

## 🚀 Manual Fix: Enable Providers via Firebase Console

### For Email/Password:
1. Open: https://console.firebase.google.com/project/lovelevel-7dadc/authentication/providers
2. Click on **Email/Password** row
3. Toggle **Enable** switch to ON
4. Click **Save**

### For Google OAuth:
1. Same page as above
2. Click on **Google** row
3. Toggle **Enable** switch to ON
4. Enter **Support email**: Your email address
5. Click **Save**

### Verify in Users Tab:
1. Go to **Authentication → Users** tab
2. Try creating a test user manually:
   - Click **Add user**
   - Email: `test@example.com`
   - Password: `Test123!`
   - Click **Add user**
3. If successful, providers are working
4. Now test login from app

---

## ✅ Success Checklist

- [ ] Email/Password provider enabled in Firebase Console
- [ ] Google OAuth provider enabled in Firebase Console
- [ ] `localhost` in Authorized domains
- [ ] Can create user via Firebase Console UI
- [ ] Can login with test credentials in app
- [ ] Google OAuth redirect works
- [ ] User appears in Firebase Console → Users tab

---

## 🆘 Still Not Working?

Share this info:
1. Screenshot of Firebase Console → Authentication → Sign-in method
2. Screenshot of Authorized domains section
3. Exact error message from browser console
4. Which test failed (Email/Password or Google)

**Next:** After checking Firebase Console, run the diagnostic tool and share results.
