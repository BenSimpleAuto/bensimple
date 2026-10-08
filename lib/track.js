const SUPABASE_URL = "https://awymwlzpzkqjovygenda.supabase.co";
const SUPABASE_KEY = "sb_publishable_1PwoBzvc_K_ftlJ5rrazBw_437izYL1";

function getAttribution() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  let sessionId = window.localStorage.getItem("bensimple_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    window.localStorage.setItem("bensimple_session_id", sessionId);
  }

  return {
    session_id: sessionId,
    page_path: window.location.pathname,
    referrer: document.referrer || null,
    source: params.get("source") || params.get("utm_source") || (document.referrer ? new URL(document.referrer).hostname : "direct"),
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    utm_content: params.get("utm_content")
  };
}

async function postRow(table, payload) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      "Content-Type": "application/json",
      Prefer: "return=minimal"
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Supabase insert failed: ${res.status}`);
}

export function track(event_name, metadata = {}) {
  if (typeof window === "undefined") return;
  const base = getAttribution();
  postRow("auto_events", { ...base, event_name, metadata }).catch(() => {});
}

export async function submitLead(form) {
  const base = getAttribution();
  const details = Object.fromEntries(
    Object.entries(form).filter(([key, value]) => key !== "consent" && value !== "" && value !== null && value !== undefined)
  );
  const payload = {
    ...base,
    name: [form.firstName, form.lastName].filter(Boolean).join(" ").trim() || null,
    first_name: form.firstName?.trim() || null,
    last_name: form.lastName?.trim() || null,
    phone: form.phone?.trim() || null,
    email: form.email?.trim() || null,
    need: form.intent || null,
    intent: form.intent || null,
    vehicle: [form.vehicleYear, form.vehicleMake, form.vehicleModel].filter(Boolean).join(" ") || null,
    vehicle_type: form.bodyStyle || null,
    vehicle_condition: form.vehicleCondition || null,
    vehicle_year: form.vehicleYear ? Number(form.vehicleYear) : null,
    vehicle_make: form.vehicleMake || null,
    vehicle_model: form.vehicleModel || null,
    budget_mode: form.budgetMode || null,
    budget_min: null,
    budget_max: null,
    payment_max: null,
    budget: form.budgetDetails?.trim() || form.budgetMode || null,
    trade: [form.tradeYear, form.tradeMake, form.tradeModel].filter(Boolean).join(" ") || null,
    trade_year: form.tradeYear ? Number(form.tradeYear) : null,
    trade_make: form.tradeMake || null,
    trade_model: form.tradeModel || null,
    trade_vin: form.tradeVin?.trim() || null,
    trade_mileage: form.tradeMileage ? Number(form.tradeMileage) : null,
    trade_has_lien: null,
    trade_story: form.tradeCondition?.trim() || null,
    preferred_contact: form.preferredContact || null,
    preferred_time: null,
    note: form.notes || form.question || null,
    consent_to_contact: !!form.consent,
    metadata: {
      origin: "bensimple.co",
      funnel: form.leadType || "automotive_lead",
      process_stage: form.processStage || null,
      details
    }
  };
  await postRow("auto_leads", payload);
  track("lead_submitted", { intent: form.intent || null, vehicle_type: form.bodyStyle || null, process_stage: form.processStage || null });
}
