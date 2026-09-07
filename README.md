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
| Customer | Open **My khata** and **Settlement**. There is **no Scan QR** path — the customer never scans. Balance and due date update from the same account. |
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

### Next milestone — collections operations

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



---

## License

Private prototype unless a license is added.
