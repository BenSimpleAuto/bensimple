import { storeEvent } from "../../../lib/bdc/storage";

export const runtime = "nodejs";

function clean(value, limit = 500) {
  return String(value || "").trim().slice(0, limit) || null;
}

export async function POST(request) {
  try {
    const body = await request.json();
    await storeEvent({
      session_id: clean(body.sessionId, 120),
      page_path: clean(body.pagePath, 300) || "/",
      referrer: clean(body.referrer, 500),
      source: clean(body.source, 120) || "direct",
      utm_source: clean(body.utmSource, 120),
      utm_medium: clean(body.utmMedium, 120),
      utm_campaign: clean(body.utmCampaign, 180),
      utm_content: clean(body.utmContent, 180),
      event_name: clean(body.eventName, 120) || "site_event",
      metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : {}
    });
    return new Response(null, { status: 204 });
  } catch {
    return new Response(null, { status: 204 });
  }
}

