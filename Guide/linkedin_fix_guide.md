# LinkedIn OAuth & Auto-Post Fix Guide

## 🔴 Root Cause: Redirect URI Mismatch

LinkedIn rejects the OAuth flow because your app's redirect URI isn't registered in the Developer Portal.

**Your app sends:** `http://localhost:3000/api/linkedin/callback`  
**LinkedIn says:** "The redirect_uri does not match the registered value"

## ✅ Steps to Fix (LinkedIn Developer Portal)

### Step 1: Add the Redirect URI

1. Go to **[LinkedIn Developer Portal](https://www.linkedin.com/developers/apps)**
2. Log in with your LinkedIn account
3. Click on your app (Client ID: `77w1fzvzstb3e3`)
4. Go to the **"Auth"** tab
5. Under **"OAuth 2.0 settings"** → **"Authorized redirect URLs for your app"**
6. Click **"Add redirect URL"**
7. Enter exactly: **`http://localhost:3000/api/linkedin/callback`**
8. Click **Save**

### Step 2: Verify Required Products

In the **"Products"** tab, ensure these are enabled:
- ✅ **Share on LinkedIn** (grants `w_member_social` scope)
- ✅ **Sign In with LinkedIn using OpenID Connect** (grants `openid`, `profile`, `email` scopes)

### Step 3: Test the Connection

1. Go back to HireX → **Settings** → **LinkedIn** tab
2. Click **"Connect LinkedIn"**
3. LinkedIn should show the consent screen (not an error)
4. After authorizing, you'll be redirected back to Settings with "LinkedIn connected successfully! 🎉"

## 📝 Code Changes Made

### Backend (already applied)

| File | Changes |
|------|---------|
| `services/linkedinService.js` | Updated API version to `202405`, better error handling, LinkedIn returns 201 with empty body on success |
| `controllers/linkedinController.js` | Better logging, error detail extraction, proper state decoding, person URN validation |
| `package.json` | Added `axios` as explicit dependency |

### Key Fixes in the Code

1. **API Version**: `202401` → `202405` (current)
2. **Publish response handling**: LinkedIn returns HTTP 201 with **empty body** — old code treated this as an error
3. **Person URN validation**: Added check that `linkedin_person_id` exists before attempting to publish
4. **Better error messages**: Now extracts `error_description`, `message`, or `errorDetailType` from LinkedIn API errors
5. **Comprehensive logging**: Every step of the OAuth flow is now logged in the backend console

> [!IMPORTANT]
> The **only thing you need to do manually** is add the redirect URI in the LinkedIn Developer Portal (Step 1 above). All code changes have already been applied.
