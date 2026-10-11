import { storeCustomerReview } from "../../../lib/bdc/storage.js";
import { validSubmissionTiming, validateReviewInput } from "../../../lib/reviews.js";
import { reviewSubmissionFingerprint } from "../../../lib/reviewSecurity.js";

export const runtime = "nodejs";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const attempts = globalThis.__bensimpleReviewAttempts || new Map();
globalThis.__bensimpleReviewAttempts = attempts;

function clientIp(request) {
  return String(request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown")
    .split(",")[0]
    .trim()
    .slice(0, 100);
}

function rateLimited(ip, now = Date.now()) {
  const recent = (attempts.get(ip) || []).filter((time) => now - time < WINDOW_MS);
  recent.push(now);
  attempts.set(ip, recent);
  return recent.length > MAX_ATTEMPTS;
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (String(body.website || "").trim()) return Response.json({ ok: true });

    const validated = validateReviewInput(body);
    if (validated.error) return Response.json({ error: validated.error }, { status: 400 });
    if (!validSubmissionTiming(body.startedAt)) {
      return Response.json({ error: "Please reload the form and try again." }, { status: 400 });
    }

    const ip = clientIp(request);
    if (rateLimited(ip)) return Response.json({ error: "Too many attempts. Please try again later." }, { status: 429 });

    const review = validated.value;
    await storeCustomerReview({
      name: review.name,
      email: review.email,
      vehicle: review.vehicle,
      rating: review.rating,
      review_text: review.reviewText,
      permission_to_publish: review.permissionToPublish,
      display_name_preference: review.displayNamePreference,
      custom_display_name: review.customDisplayName,
      display_name: review.displayName,
      status: "pending",
      consent_at: new Date().toISOString(),
      source: "bensimple.co",
      page_path: "/#review",
      submission_fingerprint: reviewSubmissionFingerprint({ email: review.email, ip })
    });

    return Response.json({ ok: true, message: "Thank you. Ben will review it before anything is published." });
  } catch (error) {
    if (error?.status === 409) {
      return Response.json({ error: "A review from this contact was already submitted today." }, { status: 429 });
    }
    return Response.json({ error: "The review could not be saved. Please try again later." }, { status: 503 });
  }
}
