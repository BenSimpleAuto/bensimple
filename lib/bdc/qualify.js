const supportedMakes = ["RAM", "Dodge", "Chrysler", "Jeep", "Chevrolet", "GMC", "Toyota", "Subaru"];

function userText(messages) {
  return messages
    .filter((message) => message.role === "user")
    .map((message) => String(message.content || "").trim())
    .filter(Boolean);
}

function matchOne(text, tests) {
  return tests.find(([, expression]) => expression.test(text))?.[0] || null;
}

function firstMatch(text, expression, group = 1) {
  return text.match(expression)?.[group]?.trim() || null;
}

function detectTimeframe(text) {
  return matchOne(text, [
    ["Today / ASAP", /\b(today|right now|asap|immediately|as soon as possible)\b/i],
    ["Within a Few Days", /\b(tomorrow|this week|next few days|in a few days)\b/i],
    ["Within 1–2 Weeks", /\b(1\s*[-–]\s*2 weeks|one to two weeks|next week|two weeks)\b/i],
    ["Within 30 Days", /\b(within (a )?month|within 30 days|this month|in a month)\b/i],
    ["1–3 Months", /\b(1\s*[-–]\s*3 months|one to three months|two months|three months|60 days|90 days)\b/i],
    ["More Than 3 Months", /\b(more than three months|over three months|six months|next year|lease (is )?up)\b/i],
    ["Waiting for Something Specific", /\b(waiting for|when .* arrives|specific vehicle|specific color)\b/i],
    ["Just Researching", /\b(just researching|only researching|doing research|not ready|looking around)\b/i],
    ["Not Sure Yet", /\b(not sure (yet|when)|no timeline)\b/i]
  ]);
}

function detectIntent(text) {
  if (/\b(appointment|test drive|come in|stop in|visit|tomorrow at|thursday at|friday at)\b/i.test(text)) return "Appointment Request";
  if (/\b(trade|trade-in|sell my|selling my|payoff|lien)\b/i.test(text)) return "Trade / Sell";
  if (/\b(recalls?|campaign)\b/i.test(text)) return "Recall Check";
  if (/\b(vin|decode)\b/i.test(text)) return "VIN Assistance";
  if (/\b(stock number|stock #|butte auto|inventory|listed vehicle|saw a vehicle)\b/i.test(text)) return "Inventory Inquiry";
  if (/\b(need|want|looking for|shopping for|buy|replace|new vehicle|used vehicle|truck|suv|crossover|sedan|car|minivan|van)\b/i.test(text)) return "Vehicle Shopping";
  return "Automotive Question";
}

function detectVehicleType(text) {
  return matchOne(text, [
    ["Truck", /\b(truck|pickup|half-ton|heavy-duty|midsize pickup|full-size)\b/i],
    ["SUV / Crossover", /\b(suv|crossover)\b/i],
    ["Van / Minivan", /\b(van|minivan)\b/i],
    ["Car", /\b(car|sedan|hatchback|coupe)\b/i]
  ]);
}

function extractContact(text) {
  const email = firstMatch(text, /\b([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})\b/i);
  const phone = firstMatch(text, /(?:^|\D)(\+?1?[\s.-]?(?:\(?\d{3}\)?)[\s.-]?\d{3}[\s.-]?\d{4})(?:\D|$)/);
  const name = firstMatch(text, /\b(?:my name is|i am|i'm)\s+([A-Z][A-Za-z'’-]+(?:\s+[A-Z][A-Za-z'’-]+)?)/i);
  const preference = matchOne(text, [
    ["Text", /\b(text|sms)\b/i],
    ["Call", /\b(call|phone me)\b/i],
    ["Email", /\b(email)\b/i]
  ]);
  return { name, phone, email, preferredContact: preference };
}

function extractModel(text, make) {
  if (!make) return null;
  const raw = firstMatch(text, new RegExp(`\\b${make}\\s+([A-Za-z0-9-]+(?:\\s+[A-Za-z0-9-]+)?)`, "i"));
  if (!raw) return null;
  const stopWords = new Set(["and", "at", "for", "in", "on", "that", "this", "today", "tomorrow", "under", "with"]);
  const parts = raw.split(/\s+/);
  if (parts.length > 1 && stopWords.has(parts.at(-1).toLowerCase())) parts.pop();
  return parts.join(" ") || null;
}

function detectBuyingSignals(text) {
  const signals = [];
  const checks = [
    ["Immediate timing", /\b(today|tomorrow|asap|this week)\b/i],
    ["Test drive interest", /\b(test drive|drive it)\b/i],
    ["Wants to visit", /\b(come in|stop in|visit)\b/i],
    ["Specific stock number", /\b(stock\s*(?:number|#)?\s*[A-Z0-9-]+)/i],
    ["Specific vehicle selected", /\b(19|20)\d{2}\s+[A-Za-z]+\s+[A-Za-z0-9-]+/i],
    ["Trade available", /\b(trade|trade-in|sell my)\b/i],
    ["Requests direct contact", /\b(call me|text me|reach me|contact me)\b/i],
    ["Final comparison", /\b(down to|between .* and|final options)\b/i]
  ];
  for (const [label, expression] of checks) if (expression.test(text)) signals.push(label);
  return signals;
}

function detectNextAction({ intent, timeframe, signals, contact, appointmentRequested }) {
  if (appointmentRequested) return "Ben should confirm the appointment request.";
  if (signals.includes("Specific stock number")) return "Verify inventory and have Ben follow up.";
  if (intent === "Trade / Sell" && contact.phone) return "Ben should contact the customer about the trade.";
  if (timeframe === "Today / ASAP" || timeframe === "Within a Few Days") return contact.phone ? "Call or text today." : "Collect a preferred contact method and offer an appointment request.";
  if (intent === "Recall Check" || intent === "VIN Assistance" || intent === "Automotive Question") return "Answer the technical question. No sales follow-up is required unless the customer asks for more help.";
  if (timeframe === "Within 1–2 Weeks" || timeframe === "Within 30 Days") return "Follow up in approximately three days.";
  if (timeframe === "1–3 Months") return "Follow up near the stated buying window, approximately 30 days from now.";
  if (timeframe === "More Than 3 Months" || timeframe === "Just Researching") return "Long-term follow-up near the stated buying window.";
  return "Continue the conversation and determine the most useful next step.";
}

function detectLeadTemperature(intent, timeframe, signals, appointmentRequested) {
  if (appointmentRequested || ["Today / ASAP", "Within a Few Days"].includes(timeframe) || signals.some((signal) => ["Test drive interest", "Wants to visit", "Specific stock number"].includes(signal))) return "Hot";
  if (["Within 1–2 Weeks", "Within 30 Days"].includes(timeframe) || signals.length >= 2 || intent === "Inventory Inquiry") return "Warm";
  if (["1–3 Months", "More Than 3 Months", "Waiting for Something Specific", "Just Researching"].includes(timeframe)) return "Long-Term";
  if (["Automotive Question", "Recall Check", "VIN Assistance"].includes(intent)) return "Information Only";
  return "Warm";
}

export function qualifyConversation(messages) {
  const turns = userText(messages);
  const text = turns.join("\n");
  const latest = turns.at(-1) || "";
  const intent = detectIntent(text);
  const timeframe = detectTimeframe(text);
  const contact = extractContact(text);
  const vin = firstMatch(text.toUpperCase(), /\b([A-HJ-NPR-Z0-9]{17})\b/);
  const year = firstMatch(text, /\b((?:19|20)\d{2})\b/);
  const make = supportedMakes.find((brand) => new RegExp(`\\b${brand.replace("RAM", "Ram")}\\b`, "i").test(text)) || null;
  const model = extractModel(text, make);
  const vehicleType = detectVehicleType(text);
  const budget = firstMatch(text, /\b(?:budget(?: is| of)?|under|around|about|up to|stay below)\s*(\$?\d[\d,]*(?:\s*(?:k|per month|monthly))?)/i);
  const mustHaves = [];
  const dealBreakers = [];
  const featureChecks = ["AWD", "4x4", "heated seats", "ventilated seats", "remote start", "third row", "Apple CarPlay", "Android Auto", "adaptive cruise", "low mileage", "ground clearance", "towing", "fuel economy", "leather"];
  for (const feature of featureChecks) {
    const expression = new RegExp(`\\b${feature.replace("+", "\\+")}\\b`, "i");
    if (expression.test(text)) {
      if (new RegExp(`\\b(no|not|without|avoid)\\b.{0,18}${feature.replace("+", "\\+")}`, "i").test(text)) dealBreakers.push(feature);
      else mustHaves.push(feature);
    }
  }
  const signals = detectBuyingSignals(text);
  const appointmentRequested = intent === "Appointment Request" || signals.includes("Test drive interest") || signals.includes("Wants to visit");
  const preferredDay = firstMatch(text, /\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i, 0);
  const preferredTime = firstMatch(text, /\b(\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?))\b/i);
  const leadTemperature = detectLeadTemperature(intent, timeframe, signals, appointmentRequested);
  const nextAction = detectNextAction({ intent, timeframe, signals, contact, appointmentRequested });
  const trade = intent === "Trade / Sell" || signals.includes("Trade available");

  const qualification = {
    intent,
    leadTemperature,
    buyingTimeframe: timeframe,
    contact,
    vehicle: { year, make, model, type: vehicleType },
    vin,
    budget,
    mustHaves,
    dealBreakers,
    trade: trade ? { hasTrade: true } : null,
    buyingSignals: signals,
    appointment: appointmentRequested ? { status: "Needs Ben Confirmation", preferredDay, preferredTime } : null,
    nextAction,
    latestCustomerMessage: latest,
    customerTurnCount: turns.length
  };

  qualification.summary = buildBdcSummary(qualification);
  qualification.handoffReady = Boolean(
    (contact.phone || contact.email) &&
    (!["Automotive Question", "Recall Check", "VIN Assistance"].includes(intent) || appointmentRequested || trade)
  );
  return qualification;
}

export function buildBdcSummary(data) {
  const vehicle = [data.vehicle?.year, data.vehicle?.make, data.vehicle?.model, data.vehicle?.type].filter(Boolean).join(" ");
  const lines = [
    "BENSIMPLE BDC SUMMARY",
    `Customer: ${data.contact?.name || "Not provided"}`,
    `Intent: ${data.intent}`,
    `Lead Temperature: ${data.leadTemperature}`,
    `Buying Timeframe: ${data.buyingTimeframe || "Not established"}`,
    `Looking For: ${vehicle || "Not established"}`,
    `Must-Haves: ${data.mustHaves?.join(", ") || "Not established"}`,
    `Deal-Breakers: ${data.dealBreakers?.join(", ") || "Not established"}`,
    `Budget: ${data.budget || "Not provided"}`,
    `Trade: ${data.trade?.hasTrade ? "Yes, details still being gathered" : "Not established"}`,
    "Price Discussed: NO",
    `Appointment: ${data.appointment ? "Requested" : "Not requested"}`,
    `Appointment Status: ${data.appointment?.status || "Not applicable"}`,
    `Best Contact: ${data.contact?.preferredContact || "Not established"}`,
    `Next Action: ${data.nextAction}`
  ];
  return lines.join("\n");
}

