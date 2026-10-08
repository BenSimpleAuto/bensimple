# BenSimple Automotive

Mobile-first personal-brand and automotive lead site for Ben LaVelle in Butte, Montana.

## Brand hierarchy

- BenSimple is the master brand.
- Butte Auto is the dealership affiliation, official live inventory source, and transaction platform.
- Supported new-vehicle access: RAM, Dodge, Chrysler, Jeep, Chevrolet, GMC, Toyota, and Subaru.
- Used vehicles may come from any brand.

## Primary customer experience

The homepage is an automotive BDC assistant, not a long discovery questionnaire. A customer can type naturally or choose a useful starting point:

- find or narrow down a vehicle
- work through a trade or sale
- ask an automotive question
- decode a VIN
- check NHTSA recalls
- open Butte Auto's official inventory
- request contact or an appointment with Ben

The assistant asks one useful question at a time. It classifies intent, buying timeframe, buying signals, lead temperature, trade status, appointment status, and the best next action in structured data behind the conversation.

## Brand assets and typography

The approved profile, banner, and transparent wordmark masters are stored in `public/` and must remain unchanged. The wordmark is used directly from `public/BENSIMPLE_WORDMARK_APPROVED.png`; it must not be recreated from text or cropped from the banner.

The site self-hosts Barlow Condensed through `@fontsource/barlow-condensed`:

- 800 italic for primary headlines
- 700 for secondary headings and interface text
- 500 or 400 for supporting and body text

See `BRAND_ASSET_LOCK.md` for the canonical asset and color rules.

## Local work

Automotive development is on the `automotive-2026` branch. Run `pnpm dev` for local review and `pnpm build` for the production build check.

## AI and lead system

The server-side assistant route is `app/api/bdc/route.js`. It uses Vercel AI Gateway when both `AI_GATEWAY_API_KEY` and `BENSIMPLE_AI_MODEL` are configured. If either is missing or the model request fails, the same interface uses a deterministic guided fallback. No provider credential is sent to the browser.

NHTSA vPIC powers VIN decoding and year/make/model support. NHTSA recall results are model-level records, even when a VIN is first decoded to identify the vehicle. Customers are told to confirm open VIN-specific recalls and remedy status through NHTSA or an authorized dealer.

The assistant never supplies a dealership vehicle price and never promises availability, financing, payments, trade value, or an appointment. Every appointment remains `Needs Ben Confirmation` until Ben personally confirms it.

After the customer provides contact permission, the server stores the structured lead, transcript, summary, temperature, timeframe, buying signals, appointment request, next action, and attribution in the configured Supabase `auto_leads` table. Site events use `auto_events`. The short form under the assistant remains as the non-AI fallback.

See `docs/AI_BDC_ARCHITECTURE.md` and `docs/SUPABASE_BDC_DATA_MODEL.md` for the implementation details.

## Environment setup

Copy `.env.example` to `.env.local` and supply only the values needed for local work. Keep `AI_GATEWAY_API_KEY` and `SUPABASE_SECRET_KEY` server-only. The admin dashboard uses the browser-safe Supabase publishable values.

## Deployment gate

Do not deploy production until all of these are confirmed:

- final transparent wordmark is present
- Supabase lead insert succeeds under the current row-level security policy
- Vercel AI Gateway key and model are configured for model-powered answers
- the Vercel project is linked to `BenSimpleAuto/bensimple`
- the desired production branch is explicitly selected
- responsive and end-to-end preview checks pass
