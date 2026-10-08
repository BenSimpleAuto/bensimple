# BenSimple Automotive

Mobile-first personal-brand and automotive lead site for Ben LaVelle in Butte, Montana.

## Brand hierarchy

- BenSimple is the master brand.
- Butte Auto is the dealership affiliation, official live inventory source, and transaction platform.
- Supported new-vehicle access: RAM, Dodge, Chrysler, Jeep, Chevrolet, GMC, Toyota, and Subaru.
- Used vehicles may come from any brand.

## Primary customer paths

- Vehicle Discovery with exact-vehicle, comparison, and narrowing-down branches
- Trade or Sell request
- Ask Ben
- Ben Helps topic starters
- Contact and appointment request
- Direct links to Butte Auto's official inventory

## Brand assets and typography

The approved profile and banner masters are stored in `public/` and must remain unchanged. The application expects the final transparent wordmark at `public/BENSIMPLE_WORDMARK_APPROVED.png`. That file is not yet available and must not be recreated from text or cropped from the banner.

The site self-hosts Barlow Condensed through `@fontsource/barlow-condensed`:

- 800 italic for primary headlines
- 700 for secondary headings and interface text
- 500 or 400 for supporting and body text

See `BRAND_ASSET_LOCK.md` for the canonical asset and color rules.

## Local work

Automotive development is on the `automotive-2026` branch. Run `pnpm dev` for local review and `pnpm build` for the production build check.

## Lead system

The customer flows post structured leads and attribution to the configured Supabase `auto_leads` and `auto_events` tables. The submission review step does not provide automated vehicle recommendations. Ben verifies current availability, pricing, and vehicle details before personally following up.

## Deployment gate

Do not deploy production until all of these are confirmed:

- final transparent wordmark is present
- Supabase lead insert succeeds under the current row-level security policy
- the Vercel project is linked to `BenSimpleAuto/bensimple`
- the desired production branch is explicitly selected
- responsive and end-to-end preview checks pass
