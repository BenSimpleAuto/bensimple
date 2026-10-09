# BenSimple AI BDC architecture

## Customer path

1. The customer starts with natural language or a short intent starter.
2. `POST /api/bdc` sanitizes the recent conversation and derives a structured qualification snapshot.
3. VIN and recall requests call official NHTSA services from the server.
4. When `AI_GATEWAY_MODEL` and either Vercel OIDC or an AI Gateway API key are available, the BenSimple BDC agent creates the customer-facing reply. Otherwise, a deterministic guided response keeps the experience usable.
5. A response guard checks the final message for prohibited dealership price, availability, financing, trade-value, and appointment claims.
6. A lead is not stored until the customer provides a phone number or email and explicitly clicks `Send This to Ben` or submits the quick form with consent.
7. `POST /api/leads` repeats qualification on the server and writes the lead and conversation summary to Supabase.

## Server boundaries

- AI provider and Supabase secret credentials stay in server environment variables. Vercel deployments may use the automatic `VERCEL_OIDC_TOKEN` instead of a manually managed Gateway key.
- The browser receives only the assistant reply, structured qualification safe for the customer interface, NHTSA results, and handoff status.
- The browser never receives a service-role or Supabase secret key.
- The admin dashboard uses Supabase Auth and the publishable browser key. Database row-level security must remain enabled for exposed tables.

## Assistant tools

- `decodeVin`: official NHTSA vPIC VIN decoding
- `checkRecalls`: official NHTSA model-level recall records
- `getButteAutoInventoryLinks`: official Butte Auto inventory destinations, with no prices or availability promises

The initial inventory integration is a safe official-source handoff. Listing-level matching requires an approved stable Butte Auto feed or parser before it should be represented as live inventory knowledge.

## Hard customer rules

- Do not provide dealership vehicle prices.
- Do not promise availability.
- Do not guarantee financing, payments, trade value, or approval.
- Do not confirm appointments. Use `Needs Ben Confirmation`.
- Ask one useful question at a time.
- Do not request Social Security numbers, banking credentials, passwords, or payment-card information.

## AI failure behavior

External service failures do not stop the lead path. NHTSA failures produce a concise verification message. AI Gateway failures switch to the guided response. Lead persistence failures tell the customer to contact Ben directly and do not pretend the lead was saved.
