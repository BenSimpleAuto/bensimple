import { buildBdcSummary, qualifyConversation } from "../../../lib/bdc/qualify.js";
import { storeBdcLead } from "../../../lib/bdc/storage.js";

export const runtime = "nodejs";

function clean(value, limit = 3000) {
  return String(value || "").trim().slice(0, limit);
}

function sanitizeMessages(messages) {
  return (Array.isArray(messages) ? messages : [])
    .slice(-30)
    .filter((message) => ["user", "assistant"].includes(message?.role))
    .map((message) => ({ role: message.role, content: clean(message.content) }))
    .filter((message) => message.content);
}

function sanitizeAttribution(attribution) {
  return {
    pagePath: clean(attribution?.pagePath, 300) || "/",
    referrer: clean(attribution?.referrer, 600) || null,
    source: clean(attribution?.source, 120) || null,
    utmSource: clean(attribution?.utmSource, 120) || null,
    utmMedium: clean(attribution?.utmMedium, 120) || null,
    utmCampaign: clean(attribution?.utmCampaign, 180) || null,
    utmContent: clean(attribution?.utmContent, 180) || null
  };
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (clean(body.website, 200)) return Response.json({ ok: true });
    if (!body.consent) return Response.json({ error: "Contact consent is required." }, { status: 400 });

    let messages = sanitizeMessages(body.messages);
    if (body.lead) {
      const lead = body.lead;
      const description = clean(lead.message);
      if (clean(lead.name, 120).length < 2) return Response.json({ error: "A name is required." }, { status: 400 });
      if (description.length < 5) return Response.json({ error: "A short message is required." }, { status: 400 });
      messages = [{ role: "user", content: `${clean(lead.need, 120)}. ${description}`.trim() }];
    }
    if (!messages.length) return Response.json({ error: "A lead message is required." }, { status: 400 });

    const qualification = qualifyConversation(messages);
    if (body.lead) {
      qualification.contact = {
        name: clean(body.lead.name, 120) || null,
        phone: clean(body.lead.phone, 50) || null,
        email: clean(body.lead.email, 180) || null,
        preferredContact: clean(body.lead.preferredContact, 30) || null
      };
      qualification.intent = clean(body.lead.need, 120) || qualification.intent;
      qualification.latestCustomerMessage = clean(body.lead.message);
      qualification.summary = buildBdcSummary(qualification);
    }
    if (!qualification.contact.phone && !qualification.contact.email) {
      return Response.json({ error: "A phone number or email is required." }, { status: 400 });
    }

    await storeBdcLead({
      sessionId: clean(body.sessionId, 120) || null,
      qualification,
      messages,
      attribution: sanitizeAttribution(body.attribution),
      source: body.lead ? "quick-fallback" : "bensimple-ai"
    });
    return Response.json({
      ok: true,
      appointmentStatus: qualification.appointment ? "Needs Ben Confirmation" : null,
      nextAction: qualification.nextAction
    });
  } catch {
    return Response.json({ error: "The request could not be saved. Please text or call Ben directly." }, { status: 503 });
  }
}

