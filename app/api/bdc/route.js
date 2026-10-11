import { createBdcAgent } from "../../../lib/bdc/agent.js";
import { guidedResponse } from "../../../lib/bdc/fallback.js";
import { enforceCustomerRules } from "../../../lib/bdc/guardrails.js";
import { buildBdcSummary, qualifyConversation } from "../../../lib/bdc/qualify.js";
import { decodeVin, getRecalls } from "../../../lib/nhtsa.js";

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
  const action = qualification.currentIntent;
  if (!["VIN Assistance", "Recall Check"].includes(action)) return context;

  let recallVehicle = qualification.vehicle;
  if (qualification.vin) {
    try {
      context.vin = await decodeVin(qualification.vin);
      recallVehicle = {
        year: context.vin.year || qualification.vehicle.year,
        make: context.vin.make || qualification.vehicle.make,
        model: context.vin.model || qualification.vehicle.model,
        type: context.vin.vehicleType || qualification.vehicle.type
      };
      context.vehicle = recallVehicle;
    } catch (error) {
      context.vinError = error.message;
    }
  }
  if (action === "Recall Check" && recallVehicle?.year && recallVehicle?.make && recallVehicle?.model) {
    try {
      context.recalls = await getRecalls(recallVehicle);
    } catch (error) {
      context.recallError = error.message;
    }
  }
  return context;
}

function logGatewayFailure(error) {
  console.error("[BenSimple BDC] AI Gateway request failed", {
    name: error?.name || "Error",
    status: error?.statusCode || error?.status || null,
    message: String(error?.message || "Unknown AI Gateway error").slice(0, 500)
  });
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
    const gatewayReady = process.env.BENSIMPLE_AI_GATEWAY_ENABLED === "true" && Boolean(model);
    let responseText;
    let mode = "guided-fallback";

    if (gatewayReady) {
      try {
        const agent = createBdcAgent(model, { qualification, nhtsa });
        const result = await agent.generate({ messages });
        responseText = result.text;
        mode = "ai-gateway";
      } catch (error) {
        logGatewayFailure(error);
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

