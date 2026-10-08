# Supabase BDC data model

The first implementation preserves the existing `auto_leads` and `auto_events` tables. It does not require an unreviewed production schema migration.

## `auto_leads`

Existing columns store contact, attribution, intent, vehicle, budget, trade, preferred contact method, consent, status, and the latest customer note.

The `metadata` JSON object stores the AI BDC fields:

```json
{
  "origin": "bensimple.co",
  "funnel": "ai_bdc",
  "lead_temperature": "Hot | Warm | Long-Term | Information Only",
  "buying_timeframe": "Today / ASAP | Within a Few Days | Within 1–2 Weeks | Within 30 Days | 1–3 Months | More Than 3 Months | Waiting for Something Specific | Just Researching | Not Sure Yet",
  "buying_signals": [],
  "must_haves": [],
  "deal_breakers": [],
  "appointment": {
    "status": "Needs Ben Confirmation",
    "preferredDay": null,
    "preferredTime": null
  },
  "next_action": "Human-readable next action",
  "bdc_summary": "Machine-generated handoff summary",
  "transcript": [
    { "role": "user | assistant", "content": "Sanitized message" }
  ]
}
```

## Pipeline statuses

The admin interface supports these operational states:

- `new`
- `needs_contact`
- `appointment_requested`
- `appointment_confirmed`
- `follow_up_today`
- `future_follow_up`
- `long_term`
- `sold`
- `lost`

If the current database has a status constraint, review and approve a matching database change before using the new values in production.

## Security requirements

- Enable row-level security on browser-exposed tables.
- Keep Supabase secret or service-role keys on the server only.
- Use the publishable key in the browser only for authenticated admin access covered by row-level security policies.
- Do not log or store highly sensitive financial or identity information in lead metadata or transcripts.
- Review retention and deletion policy before production launch.
