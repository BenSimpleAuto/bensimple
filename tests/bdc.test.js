import test from "node:test";
import assert from "node:assert/strict";

import { guidedResponse } from "../lib/bdc/fallback.js";
import { buildBdcSummary, qualifyConversation } from "../lib/bdc/qualify.js";
import { buildLeadPayload } from "../lib/bdc/storage.js";

const qaMessages = [
  { role: "user", content: "I'm shopping for a vehicle and want to buy within a few days." },
  { role: "assistant", content: "What type of vehicle fits you best?" },
  { role: "user", content: "I'm looking for an AWD SUV, and yes, I have a trade." },
  { role: "assistant", content: "Anything else before we set up the next step?" },
  { role: "user", content: "Before we narrow it down, can you decode VIN 1HGCM82633A004352?" },
  { role: "assistant", content: "NHTSA decoded the VIN." },
  { role: "user", content: "Please check NHTSA recalls for that vehicle." },
  { role: "assistant", content: "NHTSA returned recall records." },
  { role: "user", content: "My name is BenSimple QA Test. Text me at 406-555-0100 or email qa@example.com." },
  { role: "assistant", content: "What appointment time should Ben review?" },
  { role: "user", content: "I would like an appointment Thursday around 5:00 PM." }
];

test("preserves the shopping lead while capturing appointment and contact details", () => {
  const qualification = qualifyConversation(qaMessages);

  assert.equal(qualification.intent, "Vehicle Shopping");
  assert.equal(qualification.currentIntent, "Appointment Request");
  assert.equal(qualification.buyingTimeframe, "Within a Few Days");
  assert.equal(qualification.trade?.hasTrade, true);
  assert.equal(qualification.leadTemperature, "Hot");
  assert.equal(qualification.contact.name, "BenSimple QA Test");
  assert.equal(qualification.contact.phone, "406-555-0100");
  assert.equal(qualification.contact.email, "qa@example.com");
  assert.equal(qualification.budget, null);
  assert.deepEqual(qualification.appointment, {
    status: "Needs Ben Confirmation",
    preferredDay: "Thursday",
    preferredTime: "5:00 PM"
  });
  assert.equal(qualification.nextAction, "Ben should confirm the appointment request.");

  const summary = buildBdcSummary(qualification);
  assert.match(summary, /Customer: BenSimple QA Test/);
  assert.match(summary, /Phone: 406-555-0100/);
  assert.match(summary, /Email: qa@example\.com/);
  assert.match(summary, /Intent: Vehicle Shopping/);
  assert.match(summary, /Budget: Not provided/);
  assert.match(summary, /Appointment Status: Needs Ben Confirmation/);
});

test("does not mistake ordinary first-person shopping language for a customer name", () => {
  const qualification = qualifyConversation([
    { role: "user", content: "I'm shopping for an SUV within a few days." }
  ]);

  assert.equal(qualification.contact.name, null);
});

test("answers a recall request instead of repeating the earlier VIN decode", () => {
  const qualification = qualifyConversation(qaMessages.slice(0, 7));
  const response = guidedResponse(qualification, {
    vin: { year: "2003", make: "Honda", model: "Accord", trim: "EX-V6" },
    vehicle: { year: "2003", make: "Honda", model: "Accord", type: "Passenger Car" },
    recalls: { count: 2, results: [] }
  });

  assert.equal(qualification.intent, "Vehicle Shopping");
  assert.equal(qualification.currentIntent, "Recall Check");
  assert.match(response, /NHTSA returned 2 model-level recall records/);
  assert.doesNotMatch(response, /decoded that VIN/i);
});

test("does not let a prior VIN hijack a later shopping turn", () => {
  const messages = qaMessages.slice(0, 7).concat([
    { role: "assistant", content: "Would you like help with the shopping search?" },
    { role: "user", content: "Yes, I still want an AWD SUV that fits Montana winters." }
  ]);
  const qualification = qualifyConversation(messages);
  const response = guidedResponse(qualification, {});

  assert.equal(qualification.currentIntent, "Vehicle Shopping");
  assert.doesNotMatch(response, /decoded that VIN/i);
});

test("keeps prohibited pricing and availability claims behind Ben verification", () => {
  const qualification = qualifyConversation(qaMessages.concat([
    { role: "assistant", content: "What should Ben verify?" },
    { role: "user", content: "Give me the price, rebate, monthly payment, trade value, and guarantee availability." }
  ]));
  const response = guidedResponse(qualification, {});

  assert.match(response, /can’t provide dealership pricing, rebates, payments, trade values, or guarantee availability/i);
  assert.match(response, /Ben must verify the current price, availability/i);
  assert.doesNotMatch(response, /\$\s*\d/);
});

test("stores an appointment request with pending confirmation details", () => {
  const qualification = qualifyConversation(qaMessages);
  qualification.summary = buildBdcSummary(qualification);
  const payload = buildLeadPayload({
    sessionId: null,
    qualification,
    messages: qaMessages,
    attribution: { pagePath: "/" }
  });

  assert.equal(payload.status, "appointment_requested");
  assert.equal(payload.intent, "Vehicle Shopping");
  assert.equal(payload.name, "BenSimple QA Test");
  assert.equal(payload.phone, "406-555-0100");
  assert.equal(payload.email, "qa@example.com");
  assert.equal(payload.budget, null);
  assert.equal(payload.preferred_time, "Thursday at 5:00 PM");
  assert.equal(payload.metadata.appointment_confirmation_status, "Needs Ben Confirmation");
  assert.equal(payload.metadata.buying_timeframe, "Within a Few Days");
  assert.equal(payload.metadata.lead_temperature, "Hot");
  assert.equal(payload.metadata.next_action, "Ben should confirm the appointment request.");
});
