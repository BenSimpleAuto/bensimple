function getAttribution() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  let referringHost = "direct";
  if (document.referrer) {
    try {
      referringHost = new URL(document.referrer).hostname;
    } catch {
      referringHost = "referral";
    }
  }
  let sessionId = window.localStorage.getItem("bensimple_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    window.localStorage.setItem("bensimple_session_id", sessionId);
  }
  return {
    sessionId,
    pagePath: window.location.pathname,
    referrer: document.referrer || null,
    source: params.get("source") || params.get("utm_source") || referringHost,
    utmSource: params.get("utm_source"),
    utmMedium: params.get("utm_medium"),
    utmCampaign: params.get("utm_campaign"),
    utmContent: params.get("utm_content")
  };
}

export function track(eventName, metadata = {}) {
  if (typeof window === "undefined") return;
  fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...getAttribution(), eventName, metadata }),
    keepalive: true
  }).catch(() => {});
}
