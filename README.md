# BenSimple Automotive

Fresh automotive build for BenSimple.

## Brand
- BenSimple.
- Cars don't have to be complicated.
- It's BenSimple all along.
- Ben LaVelle at Butte Auto, Butte, Montana.

## Current build
- Mobile-first lead landing page
- Call / text / email actions
- Butte Auto inventory link
- Conversational "Tell Ben what you need" flow
- Uses the approved BenSimple profile caricature

## Architecture
The original general-purpose BenSimple application is preserved on the branch:
`legacy-general-bensimple-2026`

Automotive development lives on:
`automotive-2026`

Backend lead storage and attribution will be connected to a clean Supabase project before production cutover.


## Social rollout
Live:
- Facebook: https://www.facebook.com/benlavelle26
- Instagram: https://www.instagram.com/benlavelle26/

Planned fresh BenSimple accounts:
- YouTube
- TikTok
- Snapchat

Do not show dead social buttons on the production site. Add each platform only after the account exists.

## Monthly specials publishing gate
A special does not go live until the following are confirmed:
- exact vehicle/model or stock number
- actual all-consumer advertised price
- dealer-required fees included in advertised price
- conditional incentive separated and eligibility stated
- expiration date or program window
- manager verification date
- current availability

The public page reads from `data/specials.js`.
