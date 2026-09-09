# E-Khata

**Digitizing the kirana khata — account-based credit, not a payment app.**

Live demo: **[https://ekhata-gamma.vercel.app/](https://ekhata-gamma.vercel.app/)**

E-Khata is a hackathon prototype for neighbourhood kirana stores that still run on paper *udhaar* books. It gives the shopkeeper a live credit ledger and the customer a phone-first view of the same khata — without phone-number lookups, without the customer scanning a QR, and without a manual “settle” button.

---

## Problem

Most kirana credit is still a notebook: name, amount, handshake. That works until the book is lost, the due date is forgotten, or a dispute appears. Existing UPI and “scan-to-pay” products treat every visit as a fresh payment. They do not model **a running account** — the actual unit of trust in a kirana.

E-Khata models that account.

---

## What judges should try

Open the [live demo](https://ekhata-gamma.vercel.app/) and use **Continue as shopkeeper** / **Continue as customer**. Demo data is preloaded. **Reset demo** on login restores the starting ledger.

| Role | What to do |
| --- | --- |
| Shopkeeper | Open **Scan bill**, photograph or upload a receipt, review the extracted lines, then post to the customer’s khata. Sample bills: [`samples/ocr-bills/`](samples/ocr-bills/print.html) (print HTML or the PNG files). Hear the **ElevenLabs** Sia (Warm & Real Companion) confirmation for that amount (when the API key is configured). |
| Customer | Home shows the **outstanding graph**, **QR vs RFID** split, and **automatic RFID listen**. **Scan a pack** has sample photos (`samples/packs/`). Demo UIDs: `EKRFID21G`, `EKRFIDMETRO`, `EKRFIDCANTEEN`. |
| Settlement | Due date is **30 September 2026**. When that date passes, the khata **auto-settles**. There is no shopkeeper Settle button. |
| RFID prototype | Customer home **listens automatically**. Hold an NFC card (Web NFC) or scan a USB RFID wedge UID — a known card posts the fare with no confirm tap. Demo UID: `EKRFID21G`. |

---

## Product rules (this build)

- **Account-based, not identity-based.** The session is a khata. No customer ID or phone lookup.
- **Shopkeeper generates QR; customer does not scan.** Posting is **Add to account** on the shop side.
- **Settlement is automatic** on the due date. No manual close.
- **ElevenLabs** speaks a Sia (Warm & Real Companion) confirmation for **any** posted amount (`POST /api/voice` → ElevenLabs TTS). If the key is missing, the UI still posts the bill and falls back to a local chime / speech synthesis.

---

## Features in this milestone

- Dual-role app: shopkeeper dashboard, create-QR, customer khata, ledger, settlement
- Live ledger with running balance and due date
- Shopkeeper **bill photo OCR** (Tesseract) → review items → post to account
- Shopkeeper QR + **Add to account** (no customer scan)
- **ElevenLabs** voice confirmation (Sia — Warm & Real Companion) via a server proxy (avoids browser CORS)
- Automatic RFID recognition on the customer home (Web NFC + USB wedge, same khata)
- Light / dark theme, terms, reset-demo
- Manual item entry remains available when a photo cannot be read

---

## Roadmap

### Phase 1 — khata credit score (this build)

Shop–customer repayment behaviour becomes an explainable score (300–900) plus feature breakdown. Query `GET /api/credit-score?customer=Rahul%20Sharma&merchant=Sharma%20Stores`. Three customer settlements are required; due-date auto-settles are excluded. This is alternative data only — E-KHATA does not lend, set a limit, or charge interest.

### Phase 2 / 3 — licensed lending (not built)

A revolving khata line or merchant working-capital product would need an NBFC (or bank) as the lender, with E-KHATA as an LSP. Do not add credit-limit or interest logic in this repo until that partnership exists.

### Collections operations

- **Aging buckets** — 0–30 / 31–60 / 61–90 / 90+ days on outstanding khata
- **Reminders** — scheduled nudges before and after the due date
- **Defaulters tracking** — accounts that miss settlement, with a shopkeeper worklist

### After that — field kit

Once aging, reminders, and defaulters are in place, E-Khata will add:

- **Offline RFID-based khata** — tap-to-post when the shop or vehicle is offline
- **Voice-call reminders** — outbound calls driven by an **ElevenLabs agent** (not only in-app TTS)
- **Real-time sync** — **Supabase Realtime** so shop and customer screens stay aligned across devices the moment a post, reminder, or settlement lands

---

## Stack

| Layer | Choice |
| --- | --- |
| App | React 19, TypeScript, Vite |
| UI | Tailwind CSS v4, Motion, Radix, Sonner |
| Voice | **ElevenLabs** Text-to-Speech (`/api/voice` proxy) |
| Data (optional) | Supabase schema + Realtime publication in `supabase/migrations/` |
| Hosting | [Vercel](https://ekhata-gamma.vercel.app/) |
| Android | Capacitor 8 WebView wrapper (`android/`) |

---

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Login is at `/login`.

### Environment

```
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=
```

The Vite API reads `ELEVENLABS_API_KEY` on the server and never exposes the key to the browser. Without a key, posting still works; voice falls back locally. The default voice is **Sia — Warm & Real Companion** (Eleven Multilingual v2) with slower, more stable settings so it sounds less synthetic. The spoken line includes the exact rupee amount.

---

## Routes

| Path | Role |
| --- | --- |
| `/` | Redirects to login |
| `/login` | Role select + reset demo |
| `/terms` | Terms |
| `/shopkeeper` | Shop dashboard |
| `/shopkeeper/credit` | Per-customer khata score + bill correction |
| `/shopkeeper/upload` | Photograph bill (OCR) |
| `/shopkeeper/create` | Review / create items |
| `/shopkeeper/qr` | QR + **Add to account** |
| `/customer` | Customer home (khata + RFID tap) |
| `/customer/ledger` | Customer ledger |
| `/customer/settlement` | Auto-settlement view |

Legacy `/shop` and `/pay` routes redirect into this flow.

---

## Scripts

```bash
npm run dev
npm test
npm run build
```

---

## Android (Capacitor)

The React + Vite app still runs in the browser. Capacitor wraps the same `dist/` build in an Android WebView.

```bash
npm install
cp .env.example .env
npm run build
npx cap sync android
npx cap open android
```

Generate a debug APK from the repo root (requires the Android SDK and a JDK):

```bash
npm run android:apk
```

The APK is written to:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

Equivalent Gradle command from `android/`:

```bash
gradlew.bat assembleDebug
```

On macOS/Linux use `./gradlew assembleDebug`.

### Native notes

- **App ID (placeholder):** `app.ekhata.placeholder`
- **App name:** E-Khata
- **Icons / splash:** Capacitor default resources until you replace files under `android/app/src/main/res/`
- **APIs:** inside the APK, `/api/*` calls go to `https://ekhata-gamma.vercel.app` unless `VITE_API_BASE_URL` is set at build time
- **Google OAuth:** add `https://localhost/auth/callback` to the Supabase redirect allow-list. Demo “Continue as customer/shopkeeper” still works without Google
- **Camera:** Android CAMERA permission is declared for bill OCR and QR scan
- **Web NFC:** Chrome WebView often does not expose `NDEFReader`; USB RFID wedge input still works
- First Android project generation (if `android/` is missing): `npm run build && npx cap add android`

---



---

## License

Private prototype unless a license is added.
