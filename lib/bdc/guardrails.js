import { SAFE_PRICE_REPLY } from "./policy";

export function enforceCustomerRules(text, qualification) {
  const response = String(text || "").trim();
  if (!response) return "I want Ben to verify that before I give you the wrong information. What would you like him to check?";

  const pricingClaim = /\b(msrp|sale price|selling price|discount|rebate|incentive|out-the-door|trade value|trade-in value|payment is|monthly payment)\b|\$\s*\d/i;
  const budgetContext = /\b(your|that|the) budget\b/i.test(response);
  if (pricingClaim.test(response) && !budgetContext) return SAFE_PRICE_REPLY;

  if (/\b(definitely|guaranteed|certainly) (available|on the lot)|\bis still available\b/i.test(response)) {
    return "That vehicle appears to be listed, but Ben needs to verify that it is still available and confirm the current details.";
  }
  if (/\b(appointment|time) (is|has been) confirmed\b|\byou are (all )?set for\b/i.test(response)) {
    return "I’ll send Ben the appointment request and have him confirm the time with you personally.";
  }
  if (/\b(approved for financing|financing is guaranteed|guaranteed approval)\b/i.test(response)) {
    return "Financing cannot be guaranteed here. Ben can help you understand the dealership’s next steps without making promises about approval.";
  }
  if (/\b(your trade is worth|trade is worth|we can give you)\b/i.test(response)) {
    return "Ben needs to inspect the vehicle and verify the details before discussing a trade value.";
  }
  if (qualification?.intent === "Inventory Inquiry" && /\bon the lot\b/i.test(response)) {
    return "I found a listing that looks close to what you described. Ben needs to verify availability and the current details.";
  }
  return response;
}

