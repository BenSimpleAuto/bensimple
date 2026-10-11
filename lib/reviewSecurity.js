import { createHash } from "node:crypto";

export function reviewSubmissionFingerprint({ email, ip, now = new Date() }) {
  const day = now.toISOString().slice(0, 10);
  return createHash("sha256")
    .update(`bensimple-review|${String(ip || "unknown")}|${String(email || "").toLowerCase()}|${day}`)
    .digest("hex");
}
