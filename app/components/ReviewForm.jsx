"use client";

import { useState } from "react";
import { DISPLAY_NAME_OPTIONS } from "../../lib/reviews";

const blankForm = {
  name: "",
  email: "",
  vehicle: "",
  rating: "5",
  reviewText: "",
  displayNamePreference: "first_last_initial",
  customDisplayName: "",
  permissionToPublish: false,
  website: ""
};

export default function ReviewForm() {
  const [form, setForm] = useState(blankForm);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(event) {
    event.preventDefault();
    setSending(true);
    setStatus("");
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, startedAt })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setStatus(data.message || "Thank you. Ben will review it before anything is published.");
      setForm(blankForm);
      setStartedAt(Date.now());
    } catch (error) {
      setStatus(error.message || "The review could not be saved. Please try again later.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="reviewForm" onSubmit={submit}>
      <div className="reviewFormIntro">
        <span className="sectionLabel">Private submission</span>
        <h3>Share your experience.</h3>
        <p>Nothing is published automatically. Ben reviews every submission first.</p>
      </div>

      <div className="reviewSplit">
        <label><span>Your name</span><input required autoComplete="name" value={form.name} onChange={(event) => update("name", event.target.value)} /></label>
        <label><span>Email for verification</span><input required type="email" autoComplete="email" value={form.email} onChange={(event) => update("email", event.target.value)} /></label>
      </div>

      <div className="reviewSplit">
        <label><span>Vehicle, if relevant</span><input value={form.vehicle} onChange={(event) => update("vehicle", event.target.value)} placeholder="Example: 2021 Toyota Tacoma" /></label>
        <label><span>Rating</span><select value={form.rating} onChange={(event) => update("rating", event.target.value)}>{[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} out of 5</option>)}</select></label>
      </div>

      <label><span>Your review</span><textarea required minLength="20" maxLength="2000" rows="6" value={form.reviewText} onChange={(event) => update("reviewText", event.target.value)} /></label>

      <label><span>How should your name appear?</span><select value={form.displayNamePreference} onChange={(event) => update("displayNamePreference", event.target.value)}>{DISPLAY_NAME_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      {form.displayNamePreference === "custom" && <label><span>Custom display name</span><input required value={form.customDisplayName} onChange={(event) => update("customDisplayName", event.target.value)} /></label>}

      <label className="reviewPermission">
        <input required type="checkbox" checked={form.permissionToPublish} onChange={(event) => update("permissionToPublish", event.target.checked)} />
        <span>I confirm this is my own experience and give BenSimple permission to publish this review using the display-name choice above.</span>
      </label>
      <label className="websiteField" aria-hidden="true"><span>Website</span><input tabIndex="-1" autoComplete="off" value={form.website} onChange={(event) => update("website", event.target.value)} /></label>

      <div className="reviewSubmitRow">
        <button className="button primary" type="submit" disabled={sending}>{sending ? "Submitting…" : "Submit for Review"}</button>
        <small>Your email is used for verification and is never displayed with the testimonial.</small>
      </div>
      {status && <p className="reviewStatus" role="status" aria-live="polite">{status}</p>}
    </form>
  );
}
