# E-Khata

Digital credit ledger for kirana stores. Shopkeepers add bills to a customer’s khata (OCR or Quick QR), the customer confirms on their phone, and both screens update live.

## What it does

- **Shopkeeper** — pick a customer, scan or type a bill, generate a payment QR, watch the ledger, settle balances.
- **Customer** — scan the shop QR, confirm the amount, hear a voice confirmation, see the new balance.
- **Two-device QR** — the QR is an HTTP `/pay` link. Confirming on a phone updates the shop screen over the local API (SSE) or localStorage fallback.
- **Works without cloud keys** — empty `.env` still runs a full demo.

## Stack

React 19, TypeScript, Vite, Tailwind CSS v4, Motion, Tesseract.js, Vitest. Optional ElevenLabs voice and Supabase schema are included but not required.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

Optional in `.env`:

```
VITE_ELEVENLABS_API_KEY=
VITE_ELEVENLABS_VOICE_ID=
```

If those are unset, the app plays a local chime, then browser speech synthesis.

## Demo paths

| Path | Who |
| --- | --- |
| `/` | Landing — choose shopkeeper or customer |
| `/shop` | Shop dashboard |
| `/shop/upload` → `/shop/match` → `/shop/qr` | Bill OCR flow |
| `/shop/quick-qr` | Amount-only QR |
| `/pay?ref=…&amount=…` | Customer confirm (from the QR) |
| `/customer` | Customer home |
| `/shop/ledger` | Transaction history |
| `/shop/settlement` | Mark a khata settled |

For two phones on one LAN, open the shop on one device and scan the QR with the other. The Vite dev API keeps both in sync.

## Scripts

```bash
npm run dev
npm test
npm run build
```

## Database (optional)

`supabase/migrations/` has the demo schema (`customers`, `transactions`, `pay_intents`) plus Realtime publication. Apply it only if you point a Supabase project at this app. Anon RLS is intentionally permissive for the hackathon demo — do not store real customer data there.

## License

Private prototype unless you add a license.
