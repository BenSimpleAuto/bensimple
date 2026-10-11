export const DISPLAY_NAME_OPTIONS = [
  ["full_name", "Full name"],
  ["first_last_initial", "First name and last initial"],
  ["first_name", "First name only"],
  ["anonymous", "Anonymous customer"],
  ["custom", "A custom display name"]
];

const DISPLAY_NAME_VALUES = new Set(DISPLAY_NAME_OPTIONS.map(([value]) => value));

function clean(value, limit) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, limit);
}

export function displayNameForReview(name, preference, customName) {
  const fullName = clean(name, 120);
  const parts = fullName.split(" ").filter(Boolean);
  if (preference === "anonymous") return "Anonymous customer";
  if (preference === "first_name") return parts[0] || "Customer";
  if (preference === "first_last_initial") {
    const initial = parts.length > 1 ? `${parts.at(-1)[0].toUpperCase()}.` : "";
    return [parts[0], initial].filter(Boolean).join(" ") || "Customer";
  }
  if (preference === "custom") return clean(customName, 80);
  return fullName;
}

export function validateReviewInput(input) {
  const name = clean(input?.name, 120);
  const email = clean(input?.email, 180).toLowerCase();
  const vehicle = clean(input?.vehicle, 160);
  const reviewText = clean(input?.reviewText, 2000);
  const displayNamePreference = clean(input?.displayNamePreference, 40);
  const customDisplayName = clean(input?.customDisplayName, 80);
  const rating = Number(input?.rating);

  if (name.length < 2) return { error: "Please add your name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Please add a valid email address." };
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { error: "Please choose a rating from 1 to 5." };
  if (reviewText.length < 20) return { error: "Please add at least 20 characters about your experience." };
  if (!DISPLAY_NAME_VALUES.has(displayNamePreference)) return { error: "Please choose how your name may be displayed." };
  if (displayNamePreference === "custom" && customDisplayName.length < 2) return { error: "Please add the display name you want used." };
  if (input?.permissionToPublish !== true) return { error: "Permission to publish is required for a testimonial submission." };

  const displayName = displayNameForReview(name, displayNamePreference, customDisplayName);
  if (!displayName) return { error: "Please add a valid display name." };

  return {
    value: {
      name,
      email,
      vehicle: vehicle || null,
      rating,
      reviewText,
      displayNamePreference,
      customDisplayName: customDisplayName || null,
      displayName,
      permissionToPublish: true
    }
  };
}

export function validSubmissionTiming(startedAt, now = Date.now()) {
  const started = Number(startedAt);
  const elapsed = now - started;
  return Number.isFinite(started) && elapsed >= 1500 && elapsed <= 2 * 60 * 60 * 1000;
}
