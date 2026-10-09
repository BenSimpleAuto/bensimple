import { createBdcAgent } from "../../../lib/bdc/agent";
import { guidedResponse } from "../../../lib/bdc/fallback";
import { enforceCustomerRules } from "../../../lib/bdc/guardrails";
import { buildBdcSummary, qualifyConversation } from "../../../lib/bdc/qualify";
import { decodeVin, getRecalls } from "../../../lib/nhtsa";

export const runtime = "nodejs";
export const maxDuration = 30;

function sanitizeMessages(input) {
  if (!Array.isArray(input)) return [];
  return input
    .slice(-30)
    .filter((message) => ["user", "assistant"].includes(message?.role))
    .map((message) => ({ role: message.role, content: String(message.content || "").slice(0, 3000) }))
    .filter((message) => message.content.trim());
}

async function getNhtsaContext(qualification) {
  const context = {};
  if (qualification.vin) {
    try {
      context.vin = await decodeVin(qualification.vin);
      qualification.vehicle = {
        year: context.vin.year || qualification.vehicle.year,
        make: context.vin.make || qualification.vehicle.make,
        model: context.vin.model || qualification.vehicle.model,
        type: context.vin.vehicleType || qualification.vehicle.type
      };
    } catch (error) {
      context.vinError = error.message;
    }
  }
  if (qualification.intent === "Recall Check" && qualification.vehicle?.year && qualification.vehicle?.make && qualification.vehicle?.model) {
    try {
      context.recalls = await getRecalls(qualification.vehicle);
    } catch (error) {
      context.recallError = error.message;
    }
  }
  return context;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const messages = sanitizeMessages(body.messages);
    if (!messages.length || messages.at(-1).role !== "user") {
      return Response.json({ error: "A customer message is required." }, { status: 400 });
    }

    const qualification = qualifyConversation(messages);
    const nhtsa = await getNhtsaContext(qualification);
    qualification.summary = buildBdcSummary(qualification);
    const model = process.env.AI_GATEWAY_MODEL || process.env.BENSIMPLE_AI_MODEL;
    const gatewayReady = Boolean(model && (process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN));
    let responseText;
    let mode = "guided-fallback";

    if (gatewayReady) {
      try {
        const agent = createBdcAgent(model, { qualification, nhtsa });
        const result = await agent.generate({ messages });
        responseText = result.text;
        mode = "ai-gateway";
      } catch {
        responseText = guidedResponse(qualification, nhtsa);
      }
    } else {
      responseText = guidedResponse(qualification, nhtsa);
    }

    responseText = enforceCustomerRules(responseText, qualification);
    return Response.json({
      message: responseText,
      mode,
      qualification,
      nhtsa,
      inventory: {
        source: "Butte Auto official inventory",
        url: "https://www.butteauto.com/all-inventory/index.htm",
        priceExposed: false,
        availabilityGuaranteed: false
      },
      handoff: {
        ready: qualification.handoffReady,
        appointmentStatus: qualification.appointment?.status || null,
        nextAction: qualification.nextAction
      }
    });
  } catch {
    return Response.json({
      message: "I hit a temporary problem, but you can keep going. Tell me what you need and Ben can follow up personally.",
      mode: "safe-error",
      error: "The BenSimple assistant could not process that message."
    }, { status: 500 });
  }
}

