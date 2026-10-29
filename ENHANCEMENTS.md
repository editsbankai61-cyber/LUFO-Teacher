# LUFO Teacher — Enhancements & Android Conversion Guide

## What was improved in this pass

### 1. Authentication (Login / Register / Forgot)

**File:** `src/components/auth-screen.tsx`

- Password **visibility toggle** (eye icon) on password and confirm-password fields
- Confirm-password field on registration
- Stronger client-side validation (email format, password match, name required)
- **Forgot-password flow** UI (calls Better Auth `forgetPassword` when available; safe success messaging to avoid account enumeration)
- Loading spinner + disabled state while submitting
- Clear success / error messages with ARIA roles

### 2. Bug fix — Sound toggle inverted

**File:** `src/components/sound-toggle.tsx`

Previously the quiet flag was set the wrong way when toggling sound on/off.
Now: when the speaker is muted → click turns sound **on** and plays a confirmation chime.

### 3. UI polish (CSS)

**File:** `src/styles.css`

- `.password-field` + `.password-toggle` styles
- `.auth-success` message style
- `.text-link-button` for inline “Forgot password?” / “Sign in” actions
- Spinner animation (`.spin`)

---

## Already present in the original project (good foundation)

| Feature | Status |
|---------|--------|
| Better Auth (email + OAuth providers) | ✅ Wired |
| PGLite (local WASM Postgres) + Neon path | ✅ |
| Learner progress, XP, completed lessons (localStorage + userId key) | ✅ |
| Marathi default + 9 other Indian languages | ✅ |
| Dark / light / system theme | ✅ |
| Sound controls | ✅ (now fixed) |
| 3D India map (`ClientStage kind="map"`) | ✅ |
| Responsive layout + reduced-motion support | ✅ |
| Access Studio (accessibility prefs) | ✅ |

---

## Next steps you should do

### A. Real backend & cross-device progress (recommended free tier)

1. Create a free Neon Postgres project → copy `DATABASE_URL`
2. Deploy the app (Vercel is already prepared via `vercel.json`)
3. Set environment variables on the host:
   - `DATABASE_URL`
   - `BETTER_AUTH_URL` (your production URL)
   - `VITE_AUTH_ENABLED=true`
   - (Optional) email provider keys for real password-reset emails
4. The existing `src/lib/db.ts` + migration system will use Neon automatically when `DATABASE_URL` is set.
5. To sync learner progress across devices, extend `src/lib/store.tsx` to also write/read from a `learner_progress` table via server functions when a real user is logged in.

### B. Convert to Android with Capacitor

```bash
# 1. Install Capacitor (after npm install succeeds)
npm install @capacitor/core @capacitor/cli @capacitor/android --legacy-peer-deps
npx cap init "LUFO Teacher" "app.lufo.teacher" --web-dir dist/client

# 2. Build the web app
npm run build

# 3. Add Android platform
npx cap add android
npx cap sync

# 4. Open in Android Studio
npx cap open android
```

Then:

- Build → Generate Signed Bundle / APK
- Or run on a connected device / emulator from Android Studio

**Important notes for this codebase**

- The project is **TanStack Start** (SSR + API routes). For a pure offline APK you have two practical options:
  1. **Hosted WebView** (easiest): Capacitor loads your deployed Vercel URL. Auth and DB work normally.
  2. **Static SPA export**: Adjust the Vite/TanStack build to produce a fully client-side bundle and point Capacitor’s `webDir` at it. Server features (auth, progress sync) will need a separate backend URL.

`capacitor.config.ts` is already added with sensible defaults (dark splash, status bar, Android scheme).

### C. Testing checklist

- [ ] Register new account → sign out → sign in again
- [ ] Password visibility toggles work
- [ ] Forgot-password shows success message
- [ ] Theme switch persists and applies to whole app
- [ ] Sound toggle correctly mutes / unmutes + plays chime when enabling
- [ ] Progress (XP, completed lessons) survives refresh
- [ ] Mobile layout (narrow screen) for auth, dashboard, map
- [ ] 3D map still renders and language selection works

---

## Files changed in this session

- `src/components/auth-screen.tsx` — major enhancement
- `src/components/sound-toggle.tsx` — logic bug fix
- `src/styles.css` — new auth / password styles
- `capacitor.config.ts` — new
- `ENHANCEMENTS.md` — this file

Happy shipping! 🚀
