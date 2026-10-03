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
      Authorization: `Bearer ${SUPABASE_KEY}`,
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
  const payload = {
    ...base,
    name: form.name?.trim() || null,
    phone: form.phone?.trim() || null,
    email: form.email?.trim() || null,
    need: form.need || null,
    vehicle: form.vehicle || null,
    budget: form.budget || null,
    trade: form.trade || null,
    note: form.note || null,
    consent_to_contact: !!form.consent,
    metadata: { origin: "bensimple.co", funnel: "tell_ben" }
  };
  await postRow("auto_leads", payload);
  track("lead_submitted", { need: form.need || null });
}
