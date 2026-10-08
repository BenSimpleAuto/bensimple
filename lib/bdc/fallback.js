function describeVehicle(qualification) {
  return [qualification.vehicle?.year, qualification.vehicle?.make, qualification.vehicle?.model, qualification.vehicle?.type].filter(Boolean).join(" ");
}

export function guidedResponse(qualification, nhtsa = {}) {
  const latest = qualification.latestCustomerMessage || "";
  const vehicle = describeVehicle(qualification);

  if (nhtsa.vin) {
    const decoded = [nhtsa.vin.year, nhtsa.vin.make, nhtsa.vin.model, nhtsa.vin.trim].filter(Boolean).join(" ");
    return `NHTSA decoded that VIN as a ${decoded || "vehicle"}${nhtsa.vin.driveType ? ` with ${nhtsa.vin.driveType}` : ""}. What would you like to know or do with it?`;
  }
  if (nhtsa.vinError) {
    return "NHTSA’s VIN service is temporarily unavailable, so I will not guess at the decode. Would you like Ben to verify the VIN details for you?";
  }
  if (nhtsa.recalls) {
    if (nhtsa.recalls.count === 0) return `NHTSA did not return model-level recall records for the ${vehicle || "vehicle you described"}. A VIN-specific check at NHTSA.gov/recalls is still the right final check. Is there anything about the vehicle you want Ben to help interpret?`;
    return `NHTSA returned ${nhtsa.recalls.count} model-level recall record${nhtsa.recalls.count === 1 ? "" : "s"} for the ${vehicle || "vehicle you described"}. I listed the affected components below. Would you like Ben to help you understand what any of them mean?`;
  }
  if (nhtsa.recallError) {
    return `NHTSA’s recall service is temporarily unavailable, so I will not guess about the ${vehicle || "vehicle"}. Would you like Ben to verify the recall information for you?`;
  }
  if (qualification.intent === "Recall Check") return "I can check official NHTSA model-level recall records. What are the year, make, and model, or do you have the 17-character VIN?";
  if (qualification.intent === "VIN Assistance" && !qualification.vin) return "Paste the complete 17-character VIN and I’ll use NHTSA vPIC to decode the useful vehicle details.";
  if (qualification.appointment) {
    if (!qualification.contact.phone && !qualification.contact.email) return "I can prepare an appointment request for Ben. What phone number or email should he use to confirm the time with you?";
    if (qualification.appointment.preferredDay && qualification.appointment.preferredTime) return `I have ${qualification.appointment.preferredDay} at ${qualification.appointment.preferredTime} as a request that still needs Ben’s confirmation. Use the button below when you are ready to send it to Ben.`;
    return "I have this as an appointment request that still needs Ben’s confirmation. What day and time window would work best for you?";
  }
  if (qualification.intent === "Trade / Sell") {
    if (!/\b\d{2,3}[, ]?\d{3}\s*(?:miles|mi)?\b/i.test(latest)) return "Absolutely. About how many miles are on the vehicle you’re considering trading or selling?";
    return "Got it. Is there a loan or payoff Ben should know about, and what are you hoping to drive next?";
  }
  if (qualification.vehicle?.type === "Truck") {
    if (!/\b(midsize|full-size|heavy-duty|half-ton|three-quarter|one-ton)\b/i.test(latest)) return "Absolutely. Are you thinking midsize, full-size, heavy-duty, or are you still open?";
    if (/\b(tow|camper|trailer)\b/i.test(latest) && !/\b\d[\d,]*\s*(?:lb|lbs|pounds)\b/i.test(latest)) return "About how much does the camper or trailer weigh when it is loaded?";
  }
  if (qualification.intent === "Inventory Inquiry") return "I can use Butte Auto’s official inventory as the source, but Ben must verify availability and current details. What vehicle or stock number caught your attention?";
  if (qualification.intent === "Vehicle Shopping" && !qualification.buyingTimeframe) return `That gives me a useful start${vehicle ? ` on the ${vehicle}` : ""}. If the right vehicle showed up, when would you realistically want to make a move?`;
  if (qualification.intent === "Vehicle Shopping" && !qualification.trade) return "What matters most in the vehicle, and is there anything you definitely do not want?";
  if (qualification.intent === "Automotive Question") return "Tell me the vehicle and the question in your own words. I’ll answer what I can and have Ben verify anything that should not be guessed.";
  return "What brought you here today: finding a vehicle, a trade, a VIN or recall check, or a car question?";
}

