import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { POST as bdcPost } from "../app/api/bdc/route.js";
import { POST as leadPost } from "../app/api/leads/route.js";
import { POST as reviewPost } from "../app/api/reviews/route.js";
import { LEAD_STATUS_VALUES } from "../lib/leadStatuses.js";
import { displayNameForReview, validSubmissionTiming, validateReviewInput } from "../lib/reviews.js";
import { reviewSubmissionFingerprint } from "../lib/reviewSecurity.js";

test("lead status migration and dashboard share the same status list", async () => {
  const migration = await readFile(new URL("../supabase/migrations/20261008000000_allow_appointment_requested_status.sql", import.meta.url), "utf8");
  for (const status of LEAD_STATUS_VALUES) assert.match(migration, new RegExp(`'${status}'`));
  assert.doesNotMatch(migration, /'contacted'::text|'appointment'::text|'closed'::text/);
  assert.ok(LEAD_STATUS_VALUES.includes("appointment_requested"));
});

test("review display-name preferences preserve the customer choice", () => {
  assert.equal(displayNameForReview("Ben Simple Test", "full_name"), "Ben Simple Test");
  assert.equal(displayNameForReview("Ben Simple Test", "first_last_initial"), "Ben T.");
  assert.equal(displayNameForReview("Ben Simple Test", "first_name"), "Ben");
  assert.equal(displayNameForReview("Ben Simple Test", "anonymous"), "Anonymous customer");
  assert.equal(displayNameForReview("Ben Simple Test", "custom", "Montana Driver"), "Montana Driver");
});

test("review validation requires publish permission and useful content", () => {
  const valid = {
    name: "BenSimple QA Test",
    email: "qa@example.com",
    rating: 5,
    reviewText: "A clearly synthetic review used only for launch QA testing.",
    displayNamePreference: "first_last_initial",
    permissionToPublish: true
  };
  assert.equal(validateReviewInput(valid).value.displayName, "BenSimple T.");
  assert.match(validateReviewInput({ ...valid, permissionToPublish: false }).error, /permission/i);
  assert.match(validateReviewInput({ ...valid, reviewText: "Too short" }).error, /20 characters/i);
});

test("review timing and daily fingerprint support basic spam controls", () => {
  const now = Date.now();
  assert.equal(validSubmissionTiming(now - 2500, now), true);
  assert.equal(validSubmissionTiming(now - 200, now), false);
  const first = reviewSubmissionFingerprint({ email: "qa@example.com", ip: "127.0.0.1", now: new Date("2026-10-11T12:00:00Z") });
  const second = reviewSubmissionFingerprint({ email: "qa@example.com", ip: "127.0.0.1", now: new Date("2026-10-11T23:00:00Z") });
  assert.equal(first, second);
  assert.equal(first.length, 64);
});

test("failed lead submissions are rejected before persistence", async () => {
  const missingConsent = await leadPost(new Request("http://localhost/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lead: { name: "QA Test", email: "qa@example.com", message: "Please contact me." } })
  }));
  assert.equal(missingConsent.status, 400);

  const missingContact = await leadPost(new Request("http://localhost/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ consent: true, lead: { name: "QA Test", message: "Please contact me." } })
  }));
  assert.equal(missingContact.status, 400);
});

test("failed review submissions and honeypot spam are handled safely", async () => {
  const missingPermission = await reviewPost(new Request("http://localhost/api/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "BenSimple QA Test",
      email: "qa@example.com",
      rating: 5,
      reviewText: "A clearly synthetic review used only for launch QA testing.",
      displayNamePreference: "anonymous",
      permissionToPublish: false,
      startedAt: Date.now() - 3000
    })
  }));
  assert.equal(missingPermission.status, 400);

  const honeypot = await reviewPost(new Request("http://localhost/api/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ website: "https://spam.invalid" })
  }));
  assert.equal(honeypot.status, 200);
});

test("Preview remains guided fallback unless AI Gateway is explicitly enabled", async () => {
  const previousModel = process.env.AI_GATEWAY_MODEL;
  const previousEnabled = process.env.BENSIMPLE_AI_GATEWAY_ENABLED;
  process.env.AI_GATEWAY_MODEL = "openai/gpt-5-mini";
  delete process.env.BENSIMPLE_AI_GATEWAY_ENABLED;
  try {
    const response = await bdcPost(new Request("http://localhost/api/bdc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: "I am shopping for a vehicle within a few days." }] })
    }));
    const data = await response.json();
    assert.equal(response.status, 200);
    assert.equal(data.mode, "guided-fallback");
  } finally {
    if (previousModel === undefined) delete process.env.AI_GATEWAY_MODEL;
    else process.env.AI_GATEWAY_MODEL = previousModel;
    if (previousEnabled === undefined) delete process.env.BENSIMPLE_AI_GATEWAY_ENABLED;
    else process.env.BENSIMPLE_AI_GATEWAY_ENABLED = previousEnabled;
  }
});
