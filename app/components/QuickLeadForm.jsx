"use client";

import { useState } from "react";
import { track } from "../../lib/track";

const empty = { name: "", phone: "", email: "", need: "Vehicle Help", message: "", preferredContact: "Text", consent: false };

function sessionId() {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem("bensimple_session_id");
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem("bensimple_session_id", id);
  }
  return id;
}

export default function QuickLeadForm() {
  const [form, setForm] = useState(empty);
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const [sid] = useState(sessionId);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(event) {
    event.preventDefault();
    setStatus("");
    if (!form.name || (!form.phone && !form.email) || !form.message || !form.consent) {
      setStatus("Add your name, a phone number or email, a short message, and contact permission.");
      return;
    }
    setSending(true);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid, lead: form, consent: form.consent })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setStatus("Sent to Ben. He will follow up using your preferred contact method.");
      track("quick_lead_sent", { need: form.need, preferredContact: form.preferredContact });
      setForm(empty);
    } catch (error) {
      setStatus(error.message || "That did not save. Please text or call Ben directly.");
    } finally {
      setSending(false);
    }
  }

  return <form className="quickLead" onSubmit={submit}>
    <div className="quickLeadTitle"><span className="sectionLabel">No chat needed</span><h3>Send Ben a quick note.</h3></div>
    <label><span>Name</span><input value={form.name} onChange={(event) => update("name", event.target.value)} /></label>
    <div className="quickLeadSplit">
      <label><span>Phone</span><input type="tel" value={form.phone} onChange={(event) => update("phone", event.target.value)} /></label>
      <label><span>Email</span><input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} /></label>
    </div>
    <label><span>What Can Ben Help With?</span><select value={form.need} onChange={(event) => update("need", event.target.value)}><option>Vehicle Help</option><option>Trade / Sell</option><option>Automotive Question</option><option>Appointment Request</option></select></label>
    <label><span>Message</span><textarea rows="4" value={form.message} onChange={(event) => update("message", event.target.value)} /></label>
    <fieldset><legend>Preferred Contact Method</legend>{["Text", "Call", "Email"].map((method) => <button className={form.preferredContact === method ? "active" : ""} type="button" key={method} onClick={() => update("preferredContact", method)}>{method}</button>)}</fieldset>
    <label className="quickConsent"><input type="checkbox" checked={form.consent} onChange={(event) => update("consent", event.target.checked)} /><span>Ben may contact me about this request.</span></label>
    <button className="button primary" type="submit" disabled={sending}>{sending ? "Sending…" : "Send to Ben"}</button>
    {status && <p className="quickStatus">{status}</p>}
  </form>;
}

