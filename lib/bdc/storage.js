const TABLE = "auto_leads";

function config() {
  return {
    url: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  };
}

async function postRow(table, payload) {
  const { url, key } = config();
  if (!url || !key) throw new Error("Supabase server configuration is incomplete.");
  const response = await fetch(`${url}/rest/v1/${table}`, {
    method: "POST",
    headers: { apikey: key, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify(payload),
    cache: "no-store"
  });
  if (!response.ok) throw new Error(`Supabase insert failed with ${response.status}`);
}

export async function storeBdcLead({ sessionId, qualification, messages, attribution = {}, source = "bensimple-ai" }) {
  const contact = qualification.contact || {};
  const vehicle = qualification.vehicle || {};
  const transcript = messages.map((message) => ({ role: message.role, content: String(message.content || "").slice(0, 3000) }));
  const payload = {
    session_id: sessionId || null,
    page_path: attribution.pagePath || "/",
    referrer: attribution.referrer || null,
    source: attribution.source || source,
    utm_source: attribution.utmSource || null,
    utm_medium: attribution.utmMedium || null,
    utm_campaign: attribution.utmCampaign || null,
    utm_content: attribution.utmContent || null,
    name: contact.name || null,
    first_name: contact.name?.split(" ")[0] || null,
    last_name: contact.name?.split(" ").slice(1).join(" ") || null,
    phone: contact.phone || null,
    email: contact.email || null,
    need: qualification.intent,
    intent: qualification.intent,
    vehicle: [vehicle.year, vehicle.make, vehicle.model, vehicle.type].filter(Boolean).join(" ") || null,
    vehicle_type: vehicle.type || null,
    vehicle_year: vehicle.year ? Number(vehicle.year) : null,
    vehicle_make: vehicle.make || null,
    vehicle_model: vehicle.model || null,
    budget: qualification.budget || null,
    trade: qualification.trade?.hasTrade ? "Trade indicated" : null,
    trade_vin: qualification.vin || null,
    preferred_contact: contact.preferredContact || null,
    note: qualification.latestCustomerMessage || null,
    consent_to_contact: true,
    metadata: {
      origin: "bensimple.co",
      funnel: "ai_bdc",
      lead_temperature: qualification.leadTemperature,
      buying_timeframe: qualification.buyingTimeframe,
      buying_signals: qualification.buyingSignals,
      must_haves: qualification.mustHaves,
      deal_breakers: qualification.dealBreakers,
      appointment: qualification.appointment,
      next_action: qualification.nextAction,
      bdc_summary: qualification.summary,
      transcript
    }
  };
  await postRow(TABLE, payload);
}

export async function storeEvent(payload) {
  await postRow("auto_events", payload);
}

